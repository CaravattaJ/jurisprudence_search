# Recherche de jurisprudence administrative

Prototype d'outil interne (non officiel) pour retrouver rapidement des décisions du Conseil d'État, des cours administratives d'appel et des tribunaux administratifs en lien avec un cas.

## Utilisation

Enregistrer `recherche-jurisprudence.html` sur le poste, puis l'ouvrir par double-clic dans le navigateur. Aucune installation, aucun serveur.

- **Mots-clés** : tous obligatoires ; guillemets pour une expression exacte, tiret devant un mot pour l'exclure.
- **Texte libre** : la page en extrait les termes importants (sans IA). Chaque terme peut être obligatoire, « bonus » (sert seulement au classement) ou ignoré.
- **Filtres** : niveau de juridiction ou juridictions précises, période.
- **Résultats** : classement par pertinence, extraits surlignés, texte intégral, lien vers la page officielle, référence à copier.

## Principes

- **Aucune persistance** : ni base de données, ni cookie, ni stockage local. Tout disparaît à la fermeture de l'onglet.
- **Données transmises** : seuls les termes obligatoires et exclus partent vers le moteur de recherche. Le texte libre et les termes « bonus » restent sur le poste.
- **Ne jamais saisir de nom** ni d'élément permettant d'identifier une personne.
- Un seul fichier HTML autonome, sans dépendance externe.

## Source de données

Moteur de recherche de l'open data de la justice administrative (`opendata.justice-administrative.fr`), sans compte.

- Couverture : Conseil d'État depuis fin septembre 2021, cours depuis fin mars 2022, tribunaux depuis fin juin 2022.
- Le moteur renvoie les décisions les plus récentes contenant les termes, pas les plus pertinentes : le classement ne porte que sur les décisions analysées (20 à 100).
- Cet accès n'a pas de documentation officielle et peut changer sans préavis.

## Pistes prévues

- Ajout de l'API Légifrance (portail PISTE) comme seconde source, notamment pour les décisions antérieures à 2021.
- Recherches prêtes à l'emploi : réglementation du sport, accueils collectifs de mineurs.
- Dans un second temps : analyse du texte libre par une IA.
