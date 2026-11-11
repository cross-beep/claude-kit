import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Note, Signal, Turn } from '../types'

const PANE = 'lab'
const TITLE = 'Lab'
const BARS = '▁▂▃▄▅▆▇█'
const KEPT = 24

const turns = atom({ plugin: 'lab', key: 'turns' } as const, [], { shape: 'turns-1' })
const notes = atom({ plugin: 'lab', key: 'notes' } as const, [], { shape: 'notes-1' })
const signal = atom({ plugin: 'lab', key: 'signal' } as const, 'toast')
const context = atom({ plugin: 'lab', key: 'context' } as const, 0)

const PROMPTS = [
  { key: 'recap', hotkey: '1', label: "Résumé d'étape", text: "Résume en cinq points où on en est et ce qu'il reste à faire." },
  { key: 'risks', hotkey: '2', label: 'Risques', text: 'Quels sont les trois plus gros risques de ce qu’on vient de faire ?' },
  { key: 'tests', hotkey: '3', label: 'Tests manquants', text: 'Quels tests manquent pour couvrir les derniers changements ?' },
] as const

const SIGNALS: readonly { value: Signal; label: string }[] = [
  { value: 'off', label: 'rien' },
  { value: 'toast', label: 'toast' },
  { value: 'status', label: 'ligne de statut' },
]

const isSignal = (value: unknown): value is Signal => SIGNALS.some(one => one.value === value)

const isNotes = (value: unknown): value is Note[] =>
  Array.isArray(value) &&
  value.every(one => typeof one?.id === 'string' && typeof one?.text === 'string')

// One bar per turn, its height against the slowest of those shown.
const bar = (seconds: number, most: number): string =>
  BARS[Math.min(BARS.length - 1, Math.round((seconds / Math.max(1, most)) * (BARS.length - 1)))] ?? '▁'

const tone = (seconds: number): string => (seconds >= 120 ? 'error' : seconds >= 30 ? 'warning' : 'success')

const fill = (percent: number): string => (percent >= 80 ? 'error' : percent >= 50 ? 'warning' : 'success')

export const register: Register = on => {
  let tools = 0

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'lab', description: 'Open the demo pane' })

    const kept = await $.store.get('notes')
    if (isNotes(kept)) await update($, notes, () => kept)

    const chosen = await $.store.get('signal')
    if (isSignal(chosen)) await update($, signal, () => chosen)

    const usage = await $.session.usage()
    await update($, context, () => usage.context.percent ?? 0)

    void $.ui.open({ id: PANE, title: TITLE })

    return next(e)
  })

  // The pane in words, for a session whose client draws no pane: `/lab` alone
  // reports, `/lab note <text>`, `/lab rm <n>` and `/lab signal <value>` act.
  on('command.run', { command: 'lab' }, async ($, e) => {
    const [verb = '', ...rest] = e.args.trim().split(/\s+/)
    const tail = rest.join(' ')
    const kept = await read($, notes)

    if (verb === 'note' && tail !== '') {
      const added = [...kept, { id: String(await $.clock.now()), text: tail }]
      await update($, notes, () => added)
      await $.store.set('notes', added)

      return { text: `Note ${added.length} ajoutée.` }
    }

    if (verb === 'rm') {
      const gone = kept[Number(tail) - 1]
      if (gone === undefined) return { text: `Pas de note ${tail}.` }
      const left = kept.filter(one => one.id !== gone.id)
      await update($, notes, () => left)
      await $.store.set('notes', left)

      return { text: `Note supprimée : ${gone.text}` }
    }

    if (verb === 'signal') {
      const picked = SIGNALS.find(one => one.value === tail || one.label === tail)
      if (picked === undefined) return { text: 'Valeurs : off, toast, status.' }
      await update($, signal, () => picked.value)
      await $.store.set('signal', picked.value)
      if (picked.value !== 'status') $.ui.status(undefined)

      return { text: `Fin de tour : ${picked.label}.` }
    }

    const opened = await $.ui.open({ id: PANE, title: TITLE })
    const surfaces = await $.session.surfaces()
    const list = await read($, turns)
    const percent = await read($, context)
    const most = Math.max(...list.map(turn => turn.seconds), 1)
    const last = list.at(-1)
    const full = Math.round(percent / 5)
    const chosen = await read($, signal)
    const how = SIGNALS.find(one => one.value === chosen)

    return {
      text: [
        `Surfaces : ${surfaces.length === 0 ? 'aucune, rien ne se dessine ici' : surfaces.join(', ')}`,
        `Panneau : ${opened.isPlaced ? 'dessiné' : `en attente (${opened.reason})`}`,
        `Tours : ${list.length === 0 ? 'aucun encore' : list.map(turn => bar(turn.seconds, most)).join('')}${
          last ? `  dernier : ${last.seconds} s, ${last.tools} outils` : ''
        }`,
        `Contexte : ${'█'.repeat(full)}${'░'.repeat(20 - full)} ${percent} %`,
        `Fin de tour : ${how?.label ?? 'toast'}`,
        kept.length === 0 ? 'Notes : aucune' : 'Notes :',
        ...kept.map((note, at) => `  ${at + 1}. ${note.text}`),
        'Commandes : /lab note <texte>, /lab rm <numéro>, /lab signal <off|toast|status>',
      ].join('\n'),
    }
  })

  on('turn.start', async ($, e, next) => {
    if (e.agentId === undefined) tools = 0

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    tools += 1
    if ((await read($, signal)) === 'status') $.ui.status(`lab : ${tools} outils ce tour`)

    return next(e)
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e)

    const seconds = Math.round(e.durationMs / 1000)
    const turn: Turn = { seconds, tools }
    await update($, turns, list => [...list, turn].slice(-KEPT))

    const usage = await $.session.usage()
    await update($, context, () => usage.context.percent ?? 0)

    const line = `Tour terminé : ${seconds} s, ${tools} outils`
    const how = await read($, signal)
    if (how === 'toast') $.ui.toast(line)
    $.ui.status(how === 'status' ? `lab : ${line}` : undefined)

    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Input, Select, Text } = $.ui.resolve(e)
    const list = await read($, turns)
    const kept = await read($, notes)
    const how = await read($, signal)
    const percent = await read($, context)

    const width = Math.max(20, e.props.bodyColumns)
    const most = Math.max(...list.map(turn => turn.seconds), 1)
    const last = list.at(-1)
    const cells = Math.max(8, Math.min(30, width - 22))
    const full = Math.round((percent / 100) * cells)

    const save = async (next: Note[]): Promise<void> => {
      await update($, notes, () => next)
      await $.store.set('notes', next)
    }

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Text bold>Rythme des tours</Text>
          {list.length === 0 ? (
            <Text dimColor>Rien encore : envoie un message.</Text>
          ) : (
            <Box flexDirection="row">
              {list.map(turn => (
                <Text color={tone(turn.seconds)}>{bar(turn.seconds, most)}</Text>
              ))}
            </Box>
          )}
          {last && (
            <Text dimColor>{`dernier : ${last.seconds} s, ${last.tools} outils`}</Text>
          )}
        </Box>

        <Box flexDirection="column">
          <Text bold>Contexte</Text>
          <Box flexDirection="row" gap={1}>
            <Text color={fill(percent)}>{'█'.repeat(full) + '░'.repeat(cells - full)}</Text>
            <Text>{`${percent} %`}</Text>
          </Box>
          <Button
            key="compact"
            label="Compacter"
            hotkey="c"
            onPress={async () => {
              try {
                const { skip } = await $.session.compact()
                $.ui.toast(skip ? 'Compaction refusée.' : 'Conversation compactée.')
              } catch {
                $.ui.toast('Impossible pendant un tour : réessaie après.')
              }
            }}
          />
        </Box>

        <Box flexDirection="column">
          <Text bold>Prompts rapides</Text>
          {PROMPTS.map(one => (
            <Button
              key={one.key}
              label={one.label}
              hotkey={one.hotkey}
              plain
              onPress={async () => {
                await $.prompt.fill({ text: one.text })
              }}
            />
          ))}
        </Box>

        <Box flexDirection="column">
          <Text bold>Notes</Text>
          <Input
            key="note"
            value=""
            placeholder="Écris une note"
            submitLabel="ajouter"
            onSubmit={async value => {
              const text = value.trim()
              if (text === '') return
              await save([...kept, { id: String(await $.clock.now()), text }])
            }}
          />
          {kept.map(note => (
            <Box key={`row-${note.id}`} flexDirection="row" gap={1}>
              <Button
                key={`use-${note.id}`}
                label="↳"
                plain
                onPress={async () => {
                  await $.prompt.fill({ text: note.text, mode: 'insert' })
                }}
              />
              <Button
                key={`copy-${note.id}`}
                label="⧉"
                plain
                onPress={async press => {
                  const copied = await $.ui.copy({ text: note.text, surface: press.surface })
                  $.ui.toast(copied.isCopied ? 'Note copiée.' : 'Copie impossible ici.')
                }}
              />
              <Button
                key={`drop-${note.id}`}
                label="×"
                plain
                dimColor
                onPress={() => save(kept.filter(one => one.id !== note.id))}
              />
              <Text wrap="truncate-end">{note.text}</Text>
            </Box>
          ))}
          <Text dimColor>↳ insère dans le prompt, ⧉ copie, × supprime</Text>
        </Box>

        <Select
          key="signal"
          label="Fin de tour"
          options={SIGNALS}
          value={how}
          onSelect={async value => {
            if (!isSignal(value)) return
            await update($, signal, () => value)
            await $.store.set('signal', value)
            if (value !== 'status') $.ui.status(undefined)
          }}
        />
      </Box>
    )
  })
}
