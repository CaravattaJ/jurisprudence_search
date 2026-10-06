# Recherche de jurisprudence administrative

Prototype d'outil interne (non officiel) pour retrouver rapidement des décisions du Conseil d'État, des cours administratives d'appel et des tribunaux administratifs en lien avec un cas.

## À quoi sert l'outil

Il a été conçu pour la préparation des mémoires en défense d'un service départemental jeunesse et sport, dont les mesures de police (suspension en urgence, interdiction d'exercer) sont contestées devant le juge administratif. L'usage principal est la **recherche par moyen** : retrouver comment les juges ont répondu à un argument précis du requérant.

### Recherche par moyen

La page s'ouvre sur l'onglet « Par moyen ». L'onglet « Recherche libre » donne accès à la recherche par mots-clés et par description du cas. Les réglages secondaires (sources, connexion Légifrance, juridictions, période) sont regroupés sous « Options ».

1. Choisir le **moyen à contrer** : incompétence du signataire, défaut de motivation, absence de procédure contradictoire, urgence non caractérisée, inexactitude matérielle des faits, erreur d'appréciation ou disproportion, durée de la mesure, procédure pénale et présomption d'innocence, conditions du référé.
2. Choisir la **mesure contestée** : sport (L. 212-13 du code du sport), accueils de mineurs (L. 227-10 et L. 227-11 du code de l'action sociale et des familles), ou les deux.
3. Lancer la recherche. Pour chaque décision, la page isole le passage des motifs où le juge traite ce moyen et indique s'il l'a **écarté** ou **accueilli**. Le passage se copie avec sa référence.

Les décisions qui répondent au moyen sont classées en premier, le Conseil d'État et les cours avant les tribunaux. Un filtre permet de ne garder que les moyens écartés (à citer) ou accueillis (à anticiper).

Limites : le repérage repose sur les formules habituelles du juge (« doit être écarté », « est fondé à soutenir »…). Mis au point sur 120 décisions réelles, il reste automatique : « réponse à lire » signale un passage trouvé sans conclusion reconnue, et tout passage doit être relu dans la décision avant d'être cité. L'open data supprimant souvent la numérotation des points, le numéro de point n'est indiqué que lorsqu'il est disponible.

## Utilisation

Enregistrer `recherche-jurisprudence.html` sur le poste, puis l'ouvrir par double-clic dans le navigateur. Aucune installation, aucun serveur. Une version hébergée est aussi possible (voir plus bas).

- **Mots-clés** : tous obligatoires ; guillemets pour une expression exacte, tiret devant un mot pour l'exclure.
- **Texte libre** : la page en extrait les termes importants (sans IA). Chaque terme peut être obligatoire, « bonus » (sert seulement au classement) ou ignoré.
- **Filtres** : niveau de juridiction ou juridictions précises, période.
- **Résultats** : classement par pertinence, extraits surlignés, texte intégral, lien vers la page officielle, référence à copier.
- **Articles cités** : les articles de codes cités dans les décisions analysées sont repérés (par exemple L. 227-4 CASF). Un panneau liste les plus fréquents et permet de filtrer les résultats sur un article. Repérage automatique : une attribution erronée à un code reste possible lorsque la décision écrit « du même code ».
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

**Obtenir un jeton sous Windows.** Double-cliquer sur `obtenir-jeton-legifrance.cmd` (à enregistrer à côté de la page). Une fenêtre demande l'environnement, le Client ID puis le Client Secret (saisie masquée), et place le jeton dans le presse-papiers. Rien n'est enregistré.

Si le fichier est bloqué sur le poste, la même opération se fait en collant cette ligne dans PowerShell (production ; pour le bac à sable, l'adresse commence par `https://sandbox-oauth.piste.gouv.fr`) :

```powershell
$id = Read-Host "Client ID"; $sec = Read-Host "Client Secret"; $r = Invoke-RestMethod -Method Post -Uri "https://oauth.piste.gouv.fr/api/oauth/token" -Body @{ grant_type = "client_credentials"; client_id = $id; client_secret = $sec; scope = "openid" }; if ($r.access_token) { $r.access_token | Set-Clipboard; "OK : jeton copie" } else { "Aucun jeton recu" }; $sec = $null
```

Chaque application PISTE a ses propres identifiants, valables dans un seul environnement : ceux de `APP_SANDBOX` ne fonctionnent que sur le bac à sable.

Le Client Secret ne doit jamais être écrit dans un fichier de ce dépôt.

## Version hébergée (Vercel)

La page peut aussi être publiée sur Vercel. Elle s'ouvre alors par une adresse web, et l'étape du jeton disparaît : un *relais* (`api/legifrance.js`, une fonction exécutée côté serveur) détient les identifiants PISTE, obtient le jeton et transmet les recherches à Légifrance. L'utilisateur saisit seulement un code d'accès partagé dans le service.

Ce que cela implique :

- les identifiants PISTE sont stockés dans les réglages du projet Vercel, jamais dans ce dépôt ;
- les recherches Légifrance (termes obligatoires et exclus) transitent par le relais, qui ne les conserve pas ; les recherches open data partent toujours directement du poste ;
- le relais n'accepte que la recherche et la lecture de décisions du fonds de jurisprudence administrative ;
- la page n'est pas référencée par les moteurs de recherche, et la fonction s'exécute à Paris (`cdg1`).

**Mise en place**

1. Sur vercel.com : « Add New… » → « Project », puis importer le dépôt `jurisprudence_search`. Préréglage « Other », sans commande de construction.
2. Dans « Settings » → « Environment Variables », créer :
   - `PISTE_CLIENT_ID` et `PISTE_CLIENT_SECRET` : identifiants OAuth de l'application PISTE de production ;
   - `CODE_ACCES` : un code long et difficile à deviner, à communiquer aux collègues ;
   - `PISTE_ENV` (facultatif) : `sandbox` pour utiliser le bac à sable.
3. Relancer un déploiement (« Deployments » → « Redeploy ») pour que les variables soient prises en compte.
4. Ouvrir l'adresse du projet, déplier « Connexion à Légifrance », saisir le code d'accès.

Chaque fusion sur `main` met ensuite la version hébergée à jour. Pour changer le code d'accès, modifier `CODE_ACCES` puis redéployer.

La version fichier (double-clic) continue de fonctionner, avec le jeton à coller.

## Pistes prévues

- Recherches prêtes à l'emploi : réglementation du sport, accueils collectifs de mineurs.
- Dans un second temps : analyse du texte libre par une IA.
