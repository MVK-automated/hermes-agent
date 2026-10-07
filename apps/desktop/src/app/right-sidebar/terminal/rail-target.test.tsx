import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { atom } from 'nanostores'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { en } from '@/i18n/en'

const { createTerminal } = vi.hoisted(() => ({ createTerminal: vi.fn() }))
vi.mock('@/i18n', () => ({ useI18n: () => ({ t: en }) }))
vi.mock('@/store/keybinds', () => ({ $bindings: atom({}) }))
vi.mock('../store', () => ({ setTerminalTakeover: vi.fn() }))
vi.mock('./terminals', () => ({
  $activeTerminalId: atom(null),
  $terminals: atom([]),
  closeAllTerminals: vi.fn(),
  closeOtherTerminals: vi.fn(),
  closeTerminal: vi.fn(),
  createTerminal,
  selectTerminal: vi.fn()
}))

import { TerminalRail } from './rail'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('terminal target selection', () => {
  it('opens a Docker target through an in-app form without native browser prompts', async () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue(null)
    render(<TerminalRail />)
    fireEvent.keyDown(screen.getByRole('button', { name: 'New terminal' }), { key: 'ArrowDown' })
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Docker container on Pi' }))
    expect(prompt).not.toHaveBeenCalled()
    const host = await screen.findByLabelText('SSH host or alias')
    fireEvent.change(host, { target: { value: ' pi ' } })
    fireEvent.change(screen.getByLabelText('Docker container name'), { target: { value: ' hermes ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Open terminal' }))
    await waitFor(() => expect(createTerminal).toHaveBeenCalledWith('', {
      kind: 'docker', host: 'pi', container: 'hermes'
    }))
  })
})
