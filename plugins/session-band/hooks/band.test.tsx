import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

const PLUGIN = 'session-band'
const BAND = { component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 4, bodyColumns: 100 } as never } as const

// A session started under `env` and Claude Code `settings`, one answer in.
async function session($: Engine, on: On, env: Record<string, string>, settings: Record<string, unknown> = {}) {
  mock.clock(on, { now: Date.parse('2026-10-10T02:00:00Z') })
  mock.env(on, env)
  on('settings.read', async () => ({ value: settings }) as never)
  on('session.usage', async () => ({ value: { startedAt: 0, context: { percent: 12 }, rateLimits: [], cost: { usd: 0.5 } } }) as never)
  on('session.start', async () => ({ cwd: '/repo' }) as never)
  on('command.register', async () => ({ value: { command: 'session_data' } }) as never)
  on('turn.start', async () => ({ turnId: 't1' }) as never)
  await $.session.start({ source: 'startup', cwd: '/repo', surface: 'terminal', isInteractive: true } as never)
  await $.turn.start({ text: 'hi', turnId: 't1' } as never)
}

async function shows($: Engine, surface: 'terminal' | 'desktop', text: RegExp): Promise<number> {
  const ui = await $.ui.mount({ plugin: PLUGIN, surface, ...BAND })
  const found = await ui.findAll({ type: 'Text', text })
  await ui.unmount()
  return found.length
}

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: a French locale draws the band in French`, async ($, on) => {
    await session($, on, { LANG: 'fr_CA.UTF-8' })
    expect(await shows($, surface, /^Tour$/)).toBe(1)
    expect(await shows($, surface, /^Turn$/)).toBe(0)
  })

  test(`${surface}: an English locale stays English`, async ($, on) => {
    await session($, on, { LANG: 'en_US.UTF-8' })
    expect(await shows($, surface, /^Turn$/)).toBe(1)
  })
}

test('fr: Claude Code’s language setting wins over the locale', async ($, on) => {
  await session($, on, { LANG: 'en_US.UTF-8' }, { language: 'French' })
  expect(await $.command.run({ command: 'session_data', args: '' } as never)).toMatchObject({ text: 'Bandeau de session masqué.' })
})

test('fr: the option wins over both', { options: { language: 'fr' } }, async ($, on) => {
  await session($, on, { LANG: 'en_US.UTF-8' }, { language: 'english' })
  expect(await $.command.run({ command: 'session_data', args: 'demo 7' } as never)).toMatchObject({
    text: 'Démo du cache : 7 min restantes, la prochaine réponse le réinitialise.',
  })
})

// Off by default: no money in the band; the option brings the turn and session cost back.
for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: no cost unless the option asks for it`, async ($, on) => {
    await session($, on, { LANG: 'en_US.UTF-8' })
    expect(await shows($, surface, /\$/)).toBe(0)
  })

  test(`${surface}: the option shows the cost`, { options: { showCost: true } }, async ($, on) => {
    await session($, on, { LANG: 'en_US.UTF-8' })
    expect(await shows($, surface, /^\$0\.50$/)).toBe(1)
  })
}
