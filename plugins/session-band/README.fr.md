# session-band

[English](README.md) · **Français**

Un mod Claude Code : un bandeau au-dessus du prompt pour voir la session d'un coup d'œil.

- **Bandeau** : numéro du tour, vitesse de sortie de la dernière réponse (tok/s), coût du dernier tour et de la session (avec `showCost`), compte à rebours du cache de prompt d'une heure depuis la dernière réponse, et remplissage du contexte. Le bandeau prend un cadre orange 20 minutes avant l'expiration du cache, puis rouge à 10 minutes. Quand la fenêtre se rétrécit, la ligne abandonne des détails au lieu de passer à la ligne ; `×` le masque pour le reste de la session.
- **Alerte de cache** : à 10 puis 5 minutes de la fin, une notification système avec l'icône de Claude, intitulée `<projet> — <titre de la session>`, indique combien de minutes il reste au cache (« Le cache du prompt expire dans 5 min »). Dans l'application de bureau, un clic dessus ouvre la session. Rien ne part pendant qu'un tour est en cours.

## Le notificateur (macOS)

L'alerte est envoyée par une petite application d'appoint, à compiler une fois sur votre Mac (il faut les outils en ligne de commande de Xcode ; l'icône est reprise de votre Claude.app installée) :

```bash
plugins/session-band/notifier/build.sh
```

Le script produit `notifier/Session Band.app` à côté de lui ; à la première notification, macOS demande s'il faut autoriser les notifications de « Session Band ». Compilez-la dans le dossier d'où le mod est chargé, ou copiez-y l'application compilée. Sans cette application (ou sur un autre système), le mod se rabat sur la notification de Claude Code, qui arrive aussi sur votre téléphone via Remote Control mais sans titre ni ouverture au clic ; si vous êtes déjà sur la session, celle-ci est sautée et un toast le dit à la place.

## Commandes

- `/session_data` : affiche ou masque le bandeau.
- `/session_data demo <minutes>` : fait comme s'il restait ce nombre de minutes au cache, pour prévisualiser les couleurs et l'alerte ; la prochaine réponse le réinitialise.

## Réglages

`language` : `auto` (par défaut), `en` ou `fr` : le bandeau, les réponses aux commandes et l'alerte de cache. `auto` suit le réglage `language` de Claude Code, puis la locale du système (`fr_CA.UTF-8` donne le français), et revient à l'anglais sinon. Réglez-le dans `/config` ou, pour un mod chargé à la main, dans `~/.claude/settings.json` :

```json
{ "pluginConfigs": { "session-band": { "options": { "language": "fr" } } } }
```

`showCost` : désactivé (par défaut) ou activé. Désactivé, le bandeau n'affiche aucun montant ; activé, il ajoute le coût du dernier tour et celui de la session.

Les instructions d'installation sont dans le [README du dépôt](../../README.fr.md).
