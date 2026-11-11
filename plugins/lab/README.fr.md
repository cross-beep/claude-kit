# lab

[English](README.md) · **Français**

Un mod Claude Code : un panneau de démonstration à côté du chat, qui montre des éléments interactifs que les autres mods du kit n'utilisent pas. Son interface est en français seulement. C'est un bac à sable pour essayer des idées avant de déplacer celles qui valent la peine dans crew ou session-band.

- **Rythme des tours** : une barre par tour de la conversation principale, haute selon sa durée, verte sous 30 secondes, orange sous deux minutes, rouge au-delà. Les 24 derniers tours sont gardés.
- **Contexte** : une jauge du remplissage de la fenêtre de contexte, et un bouton `Compacter` (raccourci `c`) qui compacte la conversation comme `/compact`. Pendant un tour, il dit seulement de réessayer après.
- **Prompts rapides** : trois boutons (raccourcis `1`, `2`, `3`) qui placent un prompt tout fait dans la zone de saisie, sans l'envoyer.
- **Notes** : un champ de saisie ; Entrée ajoute la note. Chaque note a `↳` (l'insérer dans la zone de saisie), `⧉` (la copier) et `×` (la supprimer). Les notes sont gardées d'une session à l'autre.
- **Fin de tour** : un menu pour choisir ce qui se passe à la fin d'un tour : rien, un toast avec la durée du tour et le nombre d'outils, ou la même chose sur la ligne de statut (qui compte aussi les outils pendant le tour). Le choix est gardé d'une session à l'autre.

Le panneau et ses boutons ne sont dessinés que là où la session a une surface qui dessine : le terminal et l'application de bureau. L'application mobile peut ne pas afficher le champ de saisie ni le menu. Dans une session cloud, rien n'est dessiné, et les commandes ci-dessous sont la seule porte d'entrée.

## Commandes

- `/lab` : ouvre le panneau et répond avec le même contenu en texte : les surfaces sur lesquelles la session dessine, si le panneau est dessiné, les tours, le contexte, les notes.
- `/lab note <texte>` : ajoute une note.
- `/lab rm <numéro>` : supprime la note de ce numéro.
- `/lab signal <off|toast|status>` : règle le signal de fin de tour.

## Tests

```bash
claude plugin test plugins/lab
```

Les instructions d'installation sont dans le [README du dépôt](../../README.fr.md).
