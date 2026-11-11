export type Turn = { seconds: number; tools: number }

export type Note = { id: string; text: string }

export type Signal = 'off' | 'toast' | 'status'

declare module 'claude-code' {
  interface PluginState {
    lab: {
      turns: Shaped<Turn[]>
      notes: Shaped<Note[]>
      signal: Signal
      context: number
    }
  }
}
