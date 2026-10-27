import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

const PLUGIN = 'crew'
const pane = { title: '', isFocused: false, bodyColumns: 80, placement: 'dock', scroll: { offset: 0, bodyRows: 60 }, view: {} } as const

// One running subagent per type, in order; returns the costume each row draws.
const costumes = async ($: Engine, on: On, types: string[]): Promise<string[]> => {
  mock.clock(on)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  let n = 0
  on('agent.spawn', () => ({ model: 'claude-opus-5-5', agentId: `a${++n}` }))
  for (const [i, type] of types.entries()) {
    await $.agent.spawn({ tool_use_id: `t${i}`, prompt: 'p', description: `Task ${i}`, subagentType: type, provider: 'engine', parentModel: 'claude-opus-5-5', background: false, fork: false } as never)
  }
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'savvy-agents', props: pane })
  const rows = (await ui.findAll({ type: 'Svg' })).map(el => String(el.props.source)).filter(src => src.includes('Task '))
  await ui.unmount()
  // Rows list the latest run first.
  return rows.reverse().map(src => /class="c-([a-z]+)/.exec(src)?.[1] ?? '')
}

test('costumes: savvy tiers keep theirs, built-in types wear their own', async ($, on) => {
  const types = ['savvy-flow:savvy-light', 'savvy-heavy', 'Explore', 'Plan', 'claude-code-guide', 'statusline-setup', 'general-purpose']
  expect(await costumes($, on, types)).toEqual(['light', 'heavy', 'explore', 'scientist', 'wizard', 'painter', 'ninja'])
})

test('costumes: any other type wears a spare one, the same each time', async ($, on) => {
  const [first, again, plugin] = await costumes($, on, ['reviewer', 'reviewer', 'my-plugin:reviewer'])
  expect(['photo', 'dj', 'banker']).toContain(first)
  expect(again).toBe(first)
  expect(plugin).toBe(first)
})
