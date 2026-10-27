import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

const PLUGIN = 'crew'
const pane = { title: '', isFocused: false, bodyColumns: 80, placement: 'dock', scroll: { offset: 0, bodyRows: 30 }, view: {} } as const

// A session with one savvy worker, a1, running; every tool call answers after `toolMs`.
const worker = async ($: Engine, on: On, toolMs = 0) => {
  const clock = mock.clock(on)
  mock.env(on, { LANG: 'en_US.UTF-8' })
  on('settings.read', async () => ({ value: {} }) as never)
  on('session.start', async () => ({ cwd: '/repo' }) as never)
  on('tool.register', async () => ({ value: { tool: 'progress' } }) as never)
  on('command.register', async () => ({ value: { command: 'agents-info' } }) as never)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('agent.spawn', () => ({ model: 'claude-opus-5-5', agentId: 'a1' }))
  on('tool.call', async () => {
    if (toolMs) await clock.sleep(toolMs)
    return { result: 'ok' } as never
  })
  await $.session.start({ source: 'startup', cwd: '/repo', surface: 'terminal', isInteractive: true } as never)
  await $.agent.spawn({ tool_use_id: 't1', prompt: 'p', description: 'Run the tests', subagentType: 'savvy-light', provider: 'engine', parentModel: 'claude-opus-5-5', background: false, fork: false } as never)
  return clock
}

// The pane as drawn on `surface`, flattened to one string.
const drawn = async ($: Engine, surface: 'terminal' | 'desktop'): Promise<string> => {
  const ui = await $.ui.mount({ plugin: PLUGIN, surface, component: 'Pane', requestId: 'savvy-agents', props: pane })
  const tree = JSON.stringify(await ui.drawn())
  await ui.unmount()
  return tree
}

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: a running tool shows under its agent, timed`, async ($, on) => {
    // The agent has run 10s when the tool starts: its own clock and the tool's differ.
    const clock = await worker($, on, 60_000)
    await clock.advance(10_000)
    const call = $.tool.call({ tool: 'Bash', command: 'npm  test\n  -- --watch=false', agentId: 'a1', tool_use_id: 'u1' } as never)
    await clock.advance(42_000)
    const during = await drawn($, surface)
    expect(during).toContain('Bash · npm test -- --watch=false')
    expect(during).toContain('0:42')
    expect(during).toContain('0:52')

    // Returned: the label stays, the tool's clock goes; the agent's reads 1:10.
    await clock.advance(18_000)
    await call
    const after = await drawn($, surface)
    expect(after).toContain('Bash · npm test -- --watch=false')
    expect(after).toContain('1:10')
    expect(after).not.toContain('1:00')
  })
}

test('labels: a file shows its name, an MCP tool its server and tool', async ($, on) => {
  await worker($, on)
  await $.tool.call({ tool: 'Edit', file_path: '/repo/plugins/x/hooks/register.tsx', old_string: 'a', new_string: 'b', agentId: 'a1' } as never)
  expect(await drawn($, 'terminal')).toContain('Edit · register.tsx')
  await $.tool.call({ tool: 'mcp__HubSpot__search_crm_objects', objectType: 'contacts', agentId: 'a1' } as never)
  expect(await drawn($, 'terminal')).toContain('HubSpot · search_crm_objects')
})

test('scope: the main session and the step tool leave the activity alone', async ($, on) => {
  await worker($, on)
  await $.tool.call({ tool: 'Grep', pattern: 'TODO', agentId: 'a1' } as never)
  await $.tool.call({ tool: 'Bash', command: 'git status' } as never)
  await $.tool.call({ tool: 'mcp__crew__step', done: 1, total: 3, agentId: 'a1' } as never)
  const tree = await drawn($, 'terminal')
  expect(tree).toContain('Grep · TODO')
  expect(tree).not.toContain('git status')
})

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: the pane has no collapse button`, async ($, on) => {
    await worker($, on)
    const ui = await $.ui.mount({ plugin: PLUGIN, surface, component: 'Pane', requestId: 'savvy-agents', props: pane })
    expect(await ui.find({ key: 'compact' })).toBeUndefined()
    expect(JSON.stringify(await ui.drawn())).not.toContain('Collapse')
  })
}
