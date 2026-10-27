# Installer claude-kit — guide pas à pas

Ce guide installe les trois plugins du kit dans Claude Code, avec l'interface en français. Comptez 5 minutes.

| Plugin | À quoi il sert |
| --- | --- |
| **savvy-flow** | La commande `/savvy-flow <tâche>` : Claude planifie, confie le travail à des sous-agents, puis vérifie ce qu'ils ont fait. |
| **crew** | Une barre de progression au-dessus du prompt et un panneau qui montre les sous-agents au travail (commande `/crew`). |
| **session-band** | Un bandeau au-dessus du prompt : numéro du tour, vitesse, temps restant avant l'expiration du cache, remplissage du contexte. Prévient avant que le cache expire. |

Vous pouvez n'en installer qu'un ou deux : chacun fonctionne seul. savvy-flow et crew vont bien ensemble.

## Avant de commencer

- **Claude Code** installé (terminal ou application de bureau). Les mods (crew et session-band) ont été testés sur la version 2.1.286 ; vérifiez la vôtre avec `claude --version` et mettez à jour si elle est plus ancienne.
- Un accès à GitHub depuis votre poste (le dépôt `cross-beep/claude-kit`).

## Étape 1 — Ajouter la marketplace

Dans une session Claude Code, tapez :

```
/plugin marketplace add cross-beep/claude-kit
```

La marketplace s'appelle **`cross-kit`**.

## Étape 2 — Installer les plugins

Toujours dans Claude Code, une ligne par plugin voulu :

```
/plugin install savvy-flow@cross-kit
/plugin install crew@cross-kit
/plugin install session-band@cross-kit
```

## Étape 3 — Redémarrer la session

Quittez Claude Code et relancez-le (ou ouvrez une nouvelle session dans l'application). Les plugins ne se chargent qu'au démarrage.

## Étape 4 — Passer l'interface en français

Par défaut (`auto`), les mods suivent la langue de Claude Code, puis celle du système : sur un poste réglé en français, ils sont déjà en français et vous n'avez rien à faire.

Sinon, ouvrez `/config`, cherchez les réglages de **crew** et de **session-band** et choisissez `fr` pour la langue.

## Étape 5 — Vérifier que tout marche

- **session-band** : un bandeau (tour, vitesse, cache, contexte) apparaît au-dessus du prompt. `/session_data` l'affiche ou le masque.
- **crew** : tapez `/crew`, le message « Panneau des agents ouvert. » s'affiche avec le panneau.
- **savvy-flow** : tapez `/savvy-flow:savvy-flow` suivi d'une petite tâche (le nom complet est obligatoire quand on installe depuis la marketplace). La barre de progression de crew apparaît dès que le plan est posé.

## Réglages utiles

Dans `/config`, pour **crew** et **session-band** :

| Réglage | Valeurs | Effet |
| --- | --- | --- |
| `language` | `auto`, `fr`, `en` (+ `ru`, `he` pour crew) | Langue de l'interface. |
| `showCost` | désactivé (par défaut) / activé | Affiche un coût estimé en dollars. Désactivé, aucun montant n'apparaît. |
| `autoOpen` (crew) | `savvy` (par défaut) / `any` | `savvy` : le panneau s'ouvre seul pour savvy-flow. `any` : il s'ouvre aussi pour n'importe quel sous-agent. |

## Option macOS — l'alerte de cache de session-band

session-band envoie une notification système à 10 puis 5 minutes de l'expiration du cache. Sans rien installer de plus, c'est la notification standard de Claude Code qui s'affiche. Pour avoir une vraie notification avec le titre du projet et l'ouverture de la session au clic, il faut compiler une petite application, ce qui demande de charger le mod à la main :

1. Installez les outils en ligne de commande de Xcode si ce n'est pas fait : `xcode-select --install`.
2. Clonez le dépôt et compilez :

   ```bash
   git clone https://github.com/cross-beep/claude-kit.git ~/claude-kit
   ~/claude-kit/plugins/session-band/notifier/build.sh
   ```

3. Désinstallez la version marketplace (`/plugin uninstall session-band@cross-kit`) et chargez celle du clone pour toutes les sessions, dans `~/.claude/settings.json` :

   ```json
   {
     "env": {
       "CLAUDE_CODE_PLUGIN_DIRS": "~/claude-kit/plugins/session-band"
     }
   }
   ```

   Si `env` ou `CLAUDE_CODE_PLUGIN_DIRS` existe déjà dans le fichier, ajoutez le chemin à la suite avec `:` au lieu de remplacer la valeur.

4. Redémarrez Claude Code. À la première alerte, macOS demande d'autoriser les notifications de « Session Band » : acceptez.

## Mettre à jour

- Installation par la marketplace : `/plugin marketplace update cross-kit`, puis redémarrez la session.
- Mod chargé depuis le clone : `git pull` dans `~/claude-kit`, puis redémarrez la session.

## En cas de souci

- **Un mod n'apparaît pas après installation** : les mods utilisent une API de Claude Code encore en accès anticipé. Mettez Claude Code à jour ; si ça ne suffit pas, chargez le mod à la main depuis un clone, comme à l'étape 3 de l'option macOS (en remplaçant `session-band` par `crew` au besoin, plusieurs dossiers séparés par `:`).
- **`/savvy-flow` est inconnu** : installé depuis la marketplace, le skill s'appelle `/savvy-flow:savvy-flow`.
- **L'agent `savvy-fable` échoue** : il utilise le modèle Fable. Sans accès à ce modèle, installez les agents à la main (voir « À la main » dans le [README](README.fr.md#à-la-main)) et remplacez `model:` par `opus` dans `~/.claude/agents/savvy-fable.md`.
- **L'interface reste en anglais** : réglez `language` sur `fr` dans `/config` (étape 4), puis redémarrez.

Plus de détails sur chaque plugin : [crew](plugins/crew/README.fr.md), [savvy-flow](plugins/savvy-flow/README.fr.md), [session-band](plugins/session-band/README.fr.md).
