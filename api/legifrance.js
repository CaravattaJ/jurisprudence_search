// Relais Légifrance pour la version hébergée (Vercel).
//
// Le serveur de jetons de PISTE refuse les appels venant d'un navigateur. Cette fonction
// tourne côté serveur : elle détient les identifiants PISTE (variables d'environnement),
// obtient le jeton et transmet la recherche à Légifrance. Le jeton ne quitte jamais le serveur.
//
// Rien n'est enregistré : ni base de données, ni journal des recherches.
//
// Variables d'environnement à définir dans le projet Vercel :
//   PISTE_CLIENT_ID      Client ID de l'application PISTE
//   PISTE_CLIENT_SECRET  Client Secret de l'application PISTE
//   CODE_ACCES           code partagé dans le service, demandé par la page
//   PISTE_ENV            facultatif : "prod" (par défaut) ou "sandbox"

const crypto = require('crypto');

const PISTE = {
  prod: {
    oauth: 'https://oauth.piste.gouv.fr/api/oauth/token',
    api: 'https://api.piste.gouv.fr/dila/legifrance/lf-engine-app',
  },
  sandbox: {
    oauth: 'https://sandbox-oauth.piste.gouv.fr/api/oauth/token',
    api: 'https://sandbox-api.piste.gouv.fr/dila/legifrance/lf-engine-app',
  },
};

// Seules ces deux opérations sont relayées, et seulement sur la jurisprudence administrative.
const ALLOWED = {
  '/search': (b) => b && b.fond === 'CETAT' && b.recherche && typeof b.recherche === 'object',
  '/consult/juri': (b) => b && typeof b.textId === 'string' && /^CETATEXT\d{12}$/.test(b.textId),
};
const MAX_BODY = 20000;

// Jeton gardé en mémoire tant que l'instance de la fonction reste active.
let cached = { token: '', exp: 0, env: '' };

function sameCode(given, expected) {
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function getToken(env, force) {
  if (!force && cached.token && cached.env === env && Date.now() < cached.exp) return cached.token;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.PISTE_CLIENT_ID,
    client_secret: process.env.PISTE_CLIENT_SECRET,
    scope: 'openid',
  });
  const r = await fetch(PISTE[env].oauth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!r.ok) {
    const e = new Error('jeton refusé par PISTE (HTTP ' + r.status + ')');
    e.status = r.status;
    throw e;
  }
  const d = await r.json();
  if (!d.access_token) throw new Error('réponse de PISTE sans jeton');
  const life = Math.max(60, (parseInt(d.expires_in, 10) || 3600) - 60);
  cached = { token: d.access_token, exp: Date.now() + life * 1000, env };
  return cached.token;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée.' });

  const { PISTE_CLIENT_ID, PISTE_CLIENT_SECRET, CODE_ACCES } = process.env;
  if (!PISTE_CLIENT_ID || !PISTE_CLIENT_SECRET || !CODE_ACCES) {
    return send(res, 500, { error: 'Relais non configuré : variables d\'environnement manquantes.' });
  }
  const env = process.env.PISTE_ENV === 'sandbox' ? 'sandbox' : 'prod';

  if (!sameCode(req.headers['x-code-acces'] || '', CODE_ACCES)) {
    await new Promise((r) => setTimeout(r, 600)); // ralentit les essais répétés
    return send(res, 401, { error: 'Code d\'accès refusé.' });
  }

  let input = req.body;
  if (typeof input === 'string') {
    try { input = JSON.parse(input); } catch (e) { input = null; }
  }
  const path = input && input.path;
  const body = input && input.body;
  if (!path || !Object.prototype.hasOwnProperty.call(ALLOWED, path) || !ALLOWED[path](body)) {
    return send(res, 400, { error: 'Demande non autorisée par le relais.' });
  }
  const json = JSON.stringify(body);
  if (json.length > MAX_BODY) return send(res, 413, { error: 'Demande trop volumineuse.' });

  try {
    let upstream;
    for (let attempt = 0; attempt < 2; attempt++) {
      const token = await getToken(env, attempt > 0);
      upstream = await fetch(PISTE[env].api + path, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: json,
      });
      if (upstream.status !== 401) break; // 401 : jeton périmé, on en redemande un
    }
    const text = await upstream.text();
    if (!upstream.ok) {
      return send(res, 502, { error: 'Légifrance a répondu HTTP ' + upstream.status + '.', detail: text.slice(0, 200) });
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(text);
  } catch (e) {
    const creds = e && (e.status === 400 || e.status === 401);
    return send(res, 502, {
      error: creds
        ? 'Identifiants PISTE refusés : vérifiez les variables d\'environnement et PISTE_ENV.'
        : 'Le relais n\'a pas pu joindre PISTE (' + (e && e.message) + ').',
    });
  }
};
