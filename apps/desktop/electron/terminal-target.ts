export type InteractiveTerminalTarget =
  | { kind: 'local'; shell?: 'default' | 'cmd' | 'powershell' }
  | { kind: 'ssh'; host: string }
  | { kind: 'docker'; host: string; container: string }

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}

function validSshHost(host: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9_.@:-]*$/.test(host)
}

function validContainerName(container: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(container)
}

/** Build argv for a terminal target using the user's native OpenSSH config/auth. */
export function interactiveSshArgs(target: Exclude<InteractiveTerminalTarget, { kind: 'local' }>): string[] {
  if (!validSshHost(target.host)) {
    throw new Error('SSH host must be a host name or alias from your SSH config')
  }

  if (target.kind === 'ssh') {
    return ['-tt', '--', target.host]
  }

  if (!validContainerName(target.container)) {
    throw new Error('Container name contains unsupported characters')
  }

  return ['-tt', '--', target.host, `docker exec -it ${shellQuote(target.container)} /bin/sh`]
}
