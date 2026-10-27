# crew

[English](README.md) · **Français**

Un mod Claude Code : une barre de progression au-dessus du prompt et un panneau des sous-agents en direct. Pensé pour le skill [savvy-flow](../savvy-flow/README.fr.md), et utile avec n'importe quel sous-agent.

Anciennement `savvy-progress` dans [johnnyvizz/claude-kit](https://github.com/johnnyvizz/claude-kit) : ses outils s'appellent désormais `mcp__crew__progress` et `mcp__crew__step`, et ses réglages se trouvent sous `pluginConfigs.crew`.

- **Barre de progression** : le titre du flow, la phase (Plan, Design, Tâches, Révision), les tâches acceptées sur le total prévu, et un bouton avec la taille de l'équipe qui ouvre le panneau. Elle apparaît dès que quelque chose rapporte son avancement (savvy-flow le fait) ou qu'un exécutant `savvy-*` démarre.
- **Panneau des agents** (`/crew` l'ouvre ou le ferme ; `/crew open` l'ouvre ou le ramène au premier plan sans le refermer) : les sous-agents en cours, terminés et planifiés, avec modèle, effort, avancement de la tâche, contexte, tokens et temps (et un coût estimé avec `showCost`). Sous chaque sous-agent en cours, son activité en direct : le dernier outil appelé et son argument principal (`Bash · npm test`, `Edit · register.tsx`, `HubSpot · search_crm_objects`), chronométré tant que l'outil tourne et grisé une fois qu'il a rendu la main, pour qu'une commande bloquée saute aux yeux. Les crabes au travail marchent, et chaque niveau savvy anime son accessoire : l'astronaute flotte, le détective balaie avec sa loupe, l'ingénieur tourne sa clé, le chef fait sauter l'omelette, le pilote court en agitant son drapeau. Les sous-agents propres à Claude Code se déguisent aussi : `Explore` en pirate, `Plan` en scientifique (la fiole bouillonne), `claude-code-guide` en magicien (la baguette s'agite), `statusline-setup` en peintre (le pinceau goutte), `general-purpose` en ninja (le shuriken tourne) ; tout autre type porte le costume du photographe, du DJ ou du banquier, choisi d'après son nom pour qu'il garde toujours le même. `prefers-reduced-motion` les arrête.

## Les outils qu'il ajoute

- `mcp__crew__progress` : l'orchestrateur rapporte le plan, la phase et les tâches acceptées. Seule la session principale le peut : un appel venant d'un sous-agent est ignoré, un exécutant ne peut donc ni renommer, ni terminer, ni réinitialiser le flow.
- `mcp__crew__step` : un exécutant rapporte ses propres étapes (`done`, `total`, `note`). Un exécutant qui ne rapporte rien affiche à la place le remplissage de son contexte, en gris. L'outil est listé d'emblée plutôt que caché derrière ToolSearch, et chaque exécutant `savvy-*` reçoit à la fin de sa consigne une ligne lui demandant ces rapports.

Avec `showCost` activé, le coût est une estimation grossière tirée du nombre de tokens et d'une grille de prix par modèle intégrée (`PRICES` dans `hooks/register.tsx`, prix publics au 2026-10-10), pas une facture. Les écritures en cache sont comptées au tarif 1 heure, celui qu'utilise Claude Code avec un abonnement ; une session qui écrit des entrées de 5 minutes est donc surestimée sur ce poste.

## Réglages

`language` : `auto` (par défaut), `en`, `fr`, `ru` ou `he`. En hébreu, la barre et le panneau se dessinent de droite à gauche. `auto` suit le réglage `language` de Claude Code, puis la locale du système (`fr_CA.UTF-8` donne le français), et revient à l'anglais sinon. Réglez-le dans `/config` ou, pour un mod chargé à la main, dans `~/.claude/settings.json` :

```json
{ "pluginConfigs": { "crew": { "options": { "language": "fr" } } } }
```

`showCost` : désactivé (par défaut) ou activé. Désactivé, le panneau n'affiche aucun montant, seulement les tokens et le temps ; activé, il ajoute le coût estimé par agent et au total.

`autoOpen` : `savvy` (par défaut) ou `any`. Avec `savvy`, le panneau s'ouvre tout seul quand un exécutant `savvy-*` démarre ou qu'un plan est rapporté. Avec `any`, il s'ouvre aussi, une fois par session, quand n'importe quel autre sous-agent démarre. `/crew` l'ouvre ou le ferme dans tous les cas.

Les instructions d'installation sont dans le [README du dépôt](../../README.fr.md).
