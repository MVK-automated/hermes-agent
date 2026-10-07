import { afterEach, describe, expect, it, vi } from 'vitest'

const { handlers, spawn } = vi.hoisted(() => ({
  handlers: new Map<string, (...args: any[]) => any>(),
  spawn: vi.fn((..._args: unknown[]) => ({ onData: vi.fn(), onExit: vi.fn(), kill: vi.fn(), pid: 42 }))
}))

vi.mock('electron', () => ({
  app: { getPath: () => process.cwd(), getVersion: () => '0.0.0-test' },
  ipcMain: { handle: (name: string, fn: (...args: any[]) => any) => handlers.set(name, fn) }
}))
vi.mock('node-pty', () => ({ default: { spawn } }))

import { registerTerminalIpc } from './terminal-ipc'

function setup(isWindows = false) {
  const activeSshTerminalTarget = vi.fn(() => { throw new Error('explicit targets must not consult gateway routing') })
  registerTerminalIpc({
    isWindows,
    findOnPath: (name: string) => name === 'pwsh.exe' ? 'pwsh.exe' : null,
    rememberLog: vi.fn(),
    activeSshTerminalTarget,
    sshBinary: () => 'ssh',
    ensureBackend: vi.fn(),
    getSshConnectionState: vi.fn()
  })

  const start = (target: unknown) => handlers.get('hermes:terminal:start')!({
    sender: { id: 1, once: vi.fn(), isDestroyed: () => false, send: vi.fn() }
  }, { target })

  return { start, activeSshTerminalTarget }
}

afterEach(() => vi.clearAllMocks())

describe('explicit terminal target IPC', () => {
  it('spawns a local shell independently of the gateway connection', async () => {
    const { start, activeSshTerminalTarget } = setup()
    await start({ kind: 'local' })
    expect(activeSshTerminalTarget).not.toHaveBeenCalled()
    expect(spawn).toHaveBeenCalledOnce()
    expect(spawn.mock.calls[0]?.[0]).not.toBe('ssh')
  })

  it('spawns Docker over SSH without consulting the gateway connection', async () => {
    const { start } = setup()
    const session = await start({ kind: 'docker', host: 'pi', container: 'hermes' })
    expect(spawn).toHaveBeenCalledWith('ssh', ['-tt', '--', 'pi', "docker exec -it 'hermes' /bin/sh"], expect.any(Object))
    expect(session.cwd).toBeNull()
  })

  it.runIf(process.platform === 'win32')('reports the explicitly selected Command Prompt rather than default PowerShell', async () => {
    const { start } = setup(true)
    const session = await start({ kind: 'local', shell: 'cmd' })
    const expectedCommand = process.env.COMSPEC || 'cmd.exe'
    expect(spawn).toHaveBeenCalledWith(expectedCommand, [], expect.any(Object))
    expect(session.shell).toBe('cmd.exe')
  })
})
