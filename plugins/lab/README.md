# lab

**English** · [Français](README.fr.md)

A Claude Code mod: a demo pane beside the chat that shows interactive pieces the other mods of this kit do not use. Its interface is in French only. It is a sandbox to try ideas in, before moving the ones worth keeping into crew or session-band.

- **Turn rhythm**: one bar per turn of the main conversation, as tall as the turn was long, green under 30 seconds, amber under two minutes, red beyond. The last 24 turns are kept.
- **Context**: a gauge of the context window's fill, and a `Compacter` button (hotkey `c`) that compacts the conversation as `/compact` does. During a turn it only says to try again afterwards.
- **Quick prompts**: three buttons (hotkeys `1`, `2`, `3`) that put a ready-made prompt in the prompt box without sending it.
- **Notes**: a text field; Enter adds the note. Each note has `↳` (insert it in the prompt box), `⧉` (copy it) and `×` (delete it). Notes are kept between sessions.
- **End of turn**: a picker for what happens when a turn ends: nothing, a toast with the turn's duration and tool count, or the same on the status line (which also counts the tools while the turn runs). The choice is kept between sessions.

The pane and its buttons are drawn only where the session has a surface that draws: the terminal and the desktop app. The mobile app may not show the text field and the picker. In a cloud session nothing is drawn, and the commands below are the only way in.

## Commands

- `/lab`: opens the pane, and answers with the same content as text: which surfaces the session draws on, whether the pane is drawn, the turns, the context, the notes.
- `/lab note <text>`: adds a note.
- `/lab rm <number>`: deletes the note of that number.
- `/lab signal <off|toast|status>`: sets the end-of-turn signal.

## Tests

```bash
claude plugin test plugins/lab
```

Install instructions are in the [repository README](../../README.md).
