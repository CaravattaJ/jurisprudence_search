# Recherche de jurisprudence administrative

Prototype d'outil interne (non officiel) pour retrouver rapidement des décisions du Conseil d'État, des cours administratives d'appel et des tribunaux administratifs en lien avec un cas.

## Utilisation

Enregistrer `recherche-jurisprudence.html` sur le poste, puis l'ouvrir par double-clic dans le navigateur. Aucune installation, aucun serveur.

- **Mots-clés** : tous obligatoires ; guillemets pour une expression exacte, tiret devant un mot pour l'exclure.
- **Texte libre** : la page en extrait les termes importants (sans IA). Chaque terme peut être obligatoire, « bonus » (sert seulement au classement) ou ignoré.
- **Filtres** : niveau de juridiction ou juridictions précises, période.
- **Résultats** : classement par pertinence, extraits surlignés, texte intégral, lien vers la page officielle, référence à copier.
- **Sens de la décision** : le dispositif (les articles finaux) est lu automatiquement et résumé par une étiquette (rejet, annulation, suspension…), avec un filtre par issue. L'étiquette est indicative : elle ne dit pas à elle seule qui obtient gain de cause, notamment en appel.

## Principes

- **Aucune persistance** : ni base de données, ni cookie, ni stockage local. Tout disparaît à la fermeture de l'onglet.
- **Données transmises** : seuls les termes obligatoires et exclus partent vers les moteurs de recherche (open data et, si connecté, Légifrance). Le texte libre et les termes « bonus » restent sur le poste.
- **Ne jamais saisir de nom** ni d'élément permettant d'identifier une personne.
- Un seul fichier HTML autonome, sans dépendance externe.

## Sources de données

### Open data de la justice administrative (sans compte)

Moteur de recherche de `opendata.justice-administrative.fr`.

- Couverture : Conseil d'État depuis fin septembre 2021, cours depuis fin mars 2022, tribunaux depuis fin juin 2022.
- Le moteur renvoie les décisions les plus récentes contenant les termes, pas les plus pertinentes : le classement ne porte que sur les décisions analysées (20 à 100).
- Cet accès n'a pas de documentation officielle et peut changer sans préavis.

### Légifrance (API officielle, portail PISTE)

Fonds « CETAT » : jurisprudence administrative, y compris les décisions anciennes. Les résultats des deux sources sont fusionnés et les doublons regroupés.

Prérequis : un compte sur piste.gouv.fr et une application abonnée à l'API Légifrance.

**Pourquoi un jeton à coller.** L'accès se fait en deux temps : PISTE délivre un *jeton* (laissez-passer valable environ une heure) en échange du Client ID et du Client Secret, puis ce jeton accompagne chaque recherche. Or le serveur qui délivre le jeton refuse tout appel venant d'une page web (constaté le 6 octobre 2026). La page ne peut donc pas le demander elle-même : il s'obtient à part, puis se colle dans « Connexion à Légifrance (PISTE) ».

**Obtenir un jeton sous Windows.** Ouvrir PowerShell et coller ces deux lignes (production) :

```powershell
$r = Invoke-RestMethod -Method Post -Uri "https://oauth.piste.gouv.fr/api/oauth/token" -Body @{ grant_type = "client_credentials"; client_id = (Read-Host "Client ID"); client_secret = (Read-Host "Client Secret"); scope = "openid" }
$r.access_token | Set-Clipboard
```

PowerShell demande le Client ID puis le Client Secret, et place le jeton dans le presse-papiers. Pour le bac à sable, remplacer l'adresse par `https://sandbox-oauth.piste.gouv.fr/api/oauth/token` et choisir « Bac à sable » dans la page.

Le Client Secret ne doit jamais être écrit dans un fichier de ce dépôt.

## Pistes prévues

- Relais hébergé (par le service informatique) pour obtenir le jeton Légifrance sans manipulation.
- Recherches prêtes à l'emploi : réglementation du sport, accueils collectifs de mineurs.
- Dans un second temps : analyse du texte libre par une IA.
