import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

const PLUGIN = 'savvy-progress'
const BAND = { component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100 } as never } as const

// A session started under `env` and Claude Code `settings`, with one flow reported.
async function session($: Engine, on: On, env: Record<string, string>, settings: Record<string, unknown> = {}) {
  mock.clock(on, { now: Date.parse('2026-10-10T02:00:00Z') })
  mock.env(on, env)
  on('settings.read', async () => ({ value: settings }) as never)
  on('session.start', async () => ({ cwd: '/repo' }) as never)
  on('tool.register', async () => ({ value: { tool: 'progress' } }) as never)
  on('command.register', async () => ({ value: { command: 'agents-info' } }) as never)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  await $.session.start({ source: 'startup', cwd: '/repo', surface: 'terminal', isInteractive: true } as never)
  return $.tool.call({ tool: 'mcp__savvy-progress__progress', title: 'Livrer', total: 4, done: 1, phase: 'delegate' } as never)
}

async function label($: Engine, text: RegExp): Promise<number> {
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', ...BAND })
  const found = await ui.findAll({ type: 'Text', text })
  await ui.unmount()
  return found.length
}

test('fr: a French locale draws the band in French', async ($, on) => {
  expect(await session($, on, { LANG: 'fr_CA.UTF-8' })).toMatchObject({ result: 'ok: Tâches 1/4' })
  expect(await label($, /^Tâches 1\/4$/)).toBe(1)
  expect(await $.tool.call({ tool: 'mcp__savvy-progress__progress', phase: 'review' } as never)).toMatchObject({ result: 'ok: Révision 1/4' })
})

test('fr: Claude Code’s language setting wins over the locale', async ($, on) => {
  expect(await session($, on, { LANG: 'en_US.UTF-8' }, { language: 'français' })).toMatchObject({ result: 'ok: Tâches 1/4' })
})

test('fr: the option wins over both', { options: { language: 'fr' } }, async ($, on) => {
  expect(await session($, on, { LANG: 'ru_RU.UTF-8' }, { language: 'english' })).toMatchObject({ result: 'ok: Tâches 1/4' })
  const toggled = await $.command.run({ command: 'agents-info', args: 'open' } as never)
  expect(toggled).toMatchObject({ text: 'Panneau des agents ouvert.' })
})

test('en: an English locale stays English', async ($, on) => {
  expect(await session($, on, { LANG: 'en_US.UTF-8' })).toMatchObject({ result: 'ok: Tasks 1/4' })
  expect(await label($, /^Tasks 1\/4$/)).toBe(1)
})
