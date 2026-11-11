import { expect, mock, test } from 'claude-code/testing'

const PANE = {
  plugin: 'lab',
  component: 'Pane',
  requestId: 'lab',
  props: {
    title: 'Lab',
    isFocused: true,
    bodyColumns: 48,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

test('a note is added, kept in the store, and dropped', async ($, on) => {
  mock.clock(on, { now: 1000 })
  mock.store(on)

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })

    await ui.input({ key: 'note', text: `milk ${surface}`, kind: 'submit' })
    expect(await ui.find({ type: 'Text', text: new RegExp(`milk ${surface}`) })).toBeDefined()

    await ui.press({ key: 'drop-1000' })
    expect(await ui.find({ type: 'Text', text: new RegExp(`milk ${surface}`) })).toBeUndefined()
    await ui.unmount()
  }
})

test('picking a signal changes the Select', async ($, on) => {
  mock.store(on)

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.select({ key: 'signal', value: 'status' })
  expect((await ui.find({ key: 'signal' }))?.props.value).toBe('status')
  await ui.unmount()
})

test('a finished turn draws a bar and the context', async ($, on) => {
  mock.store(on)
  on('session.usage', () => ({ value: { startedAt: 0, context: { window: 200000, percent: 42 }, rateLimits: [] } }))
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('turn.complete', () => ({ text: 'ok' }))

  await $.turn.start({ text: 'hi', turnId: 't1' })
  await $.turn.complete({ turnId: 't1', reason: 'answer', answer: 'ok', durationMs: 12000, isAborted: false })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /dernier : 12 s, 0 outils/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /42 %/ })).toBeDefined()
  await ui.unmount()
})

test('/lab says where it draws and takes a note in words', async ($, on) => {
  mock.clock(on, { now: 7 })
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: false, reason: 'no-surface' } }))
  on('session.surfaces', () => ({ value: [] }))

  const run = (args: string) =>
    $.command.run({ command: 'lab', args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 80 } })

  expect((await run('note acheter du lait')).text).toBe('Note 1 ajoutée.')
  const report = (await run('')).text ?? ''
  expect(report).toContain('Surfaces : aucune')
  expect(report).toContain('en attente (no-surface)')
  expect(report).toContain('1. acheter du lait')
  expect((await run('rm 1')).text).toBe('Note supprimée : acheter du lait')
})
