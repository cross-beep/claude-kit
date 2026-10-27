# savvy-flow

[English](README.md) · **Français**

Un flow de livraison orchestré pour Claude Code. Lancez `/savvy-flow <tâche>` (`/savvy-flow:savvy-flow` une fois installé comme plugin) : le modèle de la session planifie, garde la main sur la conception, délègue l'implémentation à des sous-agents exécutants par niveau et révise de façon critique ce qu'ils rendent.

## Contenu

- **Skill** `savvy-flow` : le mode d'emploi de l'orchestrateur.
- **Agents** par niveau, le moins coûteux capable de réussir la tâche du premier coup :

  | Agent | Modèle / effort | Pour |
  | --- | --- | --- |
  | `savvy-fable` | Fable / high | la logique et les bugs les plus durs ; conçoit des fonctionnalités sur demande |
  | `savvy-heavy` | Opus / xhigh | du code inconnu, une cause racine floue |
  | `savvy-careful` | Opus / high | des changements délicats mais bien compris |
  | `savvy-medium` | Opus / medium | le travail courant sur les fonctionnalités |
  | `savvy-light` | Opus / low | les modifications mécaniques, builds, tests |

  `savvy-fable` tourne sur le modèle Fable ; si vous n'y avez pas accès, changez `model:` dans `agents/savvy-fable.md` (par exemple en `opus`).

## Avec crew

Le skill et les agents fonctionnent très bien seuls. Avec le mod [crew](../crew/README.fr.md) installé, l'orchestrateur rapporte le plan et les tâches acceptées à une barre de progression au-dessus du prompt, et chaque exécutant rapporte ses propres étapes au panneau des agents. Sans le mod, ces appels sont simplement sautés.

Les instructions d'installation sont dans le [README du dépôt](../../README.fr.md).
