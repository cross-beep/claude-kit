# claude-kit

[English](README.md) · **Français**

Des skills et des mods pour [Claude Code](https://claude.com/claude-code), au même endroit : un fork de [johnnyvizz/claude-kit](https://github.com/johnnyvizz/claude-kit) adapté à mon travail, avec l'interface des mods en français (`language: fr`, ou `auto` d'après la locale). Chaque élément est un plugin autonome dans `plugins/` : n'installez que ce dont vous avez besoin.

| Plugin | Type | Ce qu'il fait |
| --- | --- | --- |
| [savvy-flow](plugins/savvy-flow/README.fr.md) | skill + agents | `/savvy-flow <tâche>` : le modèle de la session planifie, délègue à des sous-agents exécutants par niveau et révise leur travail. |
| [crew](plugins/crew/README.fr.md) | mod | Une barre de progression au-dessus du prompt et un panneau des agents en direct. Pensé pour savvy-flow, affiche n'importe quel sous-agent. |
| [session-band](plugins/session-band/README.fr.md) | mod | Un bandeau au-dessus du prompt : tour, vitesse, compte à rebours du cache du prompt et contexte (coût en option) ; prévient avant l'expiration du cache. |

savvy-flow et crew fonctionnent chacun seul et s'allument ensemble : avec les deux installés, le flow pilote la barre et les exécutants rapportent leur avancement au panneau.

## Installation

Pour un guide pas à pas (vérifications, réglages, dépannage), voir **[INSTALL.fr.md](INSTALL.fr.md)**.

### Depuis la marketplace

Dans Claude Code :

```
/plugin marketplace add cross-beep/claude-kit
/plugin install savvy-flow@cross-kit
/plugin install crew@cross-kit
/plugin install session-band@cross-kit
```

La marketplace s'appelle `cross-kit`, elle cohabite donc avec le `claude-kit` de johnnyvizz sans conflit. Redémarrez la session ensuite. Les skills et agents d'un plugin portent son préfixe : le skill devient `/savvy-flow:savvy-flow`, les agents `savvy-flow:savvy-careful`, etc.

### À la main

```bash
git clone https://github.com/cross-beep/claude-kit.git ~/claude-kit
```

**Un skill** (sans passer par le système de plugins, les noms restent courts : `/savvy-flow`, `savvy-careful`) : copiez ses dossiers dans votre configuration Claude Code.

```bash
cp -R ~/claude-kit/plugins/savvy-flow/skills/savvy-flow ~/.claude/skills/
```

```bash
cp ~/claude-kit/plugins/savvy-flow/agents/*.md ~/.claude/agents/
```

**Un mod** : chargez le dossier pour une session,

```bash
claude --plugin-dir ~/claude-kit/plugins/crew
```

ou pour toutes les sessions (application de bureau comprise) via `env` dans `~/.claude/settings.json`. Séparez plusieurs dossiers par `:` ; si la variable existe déjà, ajoutez-y le chemin au lieu de la remplacer :

```json
{
  "env": {
    "CLAUDE_CODE_PLUGIN_DIRS": "~/claude-kit/plugins/crew"
  }
}
```

Un `git pull` dans le clone met à jour un mod chargé de cette façon ; les skills copiés doivent être recopiés.

Les mods reposent sur les function hooks (`hooks/register.tsx`), une API de Claude Code en accès anticipé : testés sur Claude Code 2.1.286, ils peuvent casser d'une version à l'autre. Si un mod installé depuis la marketplace n'apparaît pas, chargez-le à la main comme ci-dessus.

## Organisation

```
.claude-plugin/marketplace.json   le catalogue que lit `/plugin marketplace add`
plugins/<nom>/
  .claude-plugin/plugin.json      le manifeste
  skills/<skill>/SKILL.md         un skill
  agents/*.md                     les sous-agents qu'il fournit
  hooks/hooks.json                un mod : pointe vers le module de hooks
  hooks/register.tsx              un mod : le module lui-même
  types/index.d.ts                un mod : son contrat $.state
```

Vérifiez un plugin avant de publier : `claude plugin validate plugins/<nom>`, et le catalogue avec `claude plugin validate .`.

## Licence

MIT
