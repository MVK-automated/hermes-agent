import { describe, expect, it } from 'vitest'

import { interactiveSshArgs } from './terminal-target'

describe('interactive SSH terminal targets', () => {
  it('opens an interactive shell through a configured SSH alias', () => {
    expect(interactiveSshArgs({ kind: 'ssh', host: 'pi' })).toEqual(['-tt', '--', 'pi'])
  })

  it('runs an interactive shell inside a named Docker container on the SSH host', () => {
    expect(interactiveSshArgs({ kind: 'docker', host: 'pi', container: 'hermes-gateway' })).toEqual([
      '-tt',
      '--',
      'pi',
      "docker exec -it 'hermes-gateway' /bin/sh"
    ])
  })

  it('rejects SSH option injection in the host field', () => {
    expect(() => interactiveSshArgs({ kind: 'ssh', host: '-oProxyCommand=evil' })).toThrow(/host name or alias/)
  })

  it('rejects shell metacharacters in the Docker container name', () => {
    expect(() => interactiveSshArgs({ kind: 'docker', host: 'pi', container: 'x; touch /tmp/pwned' })).toThrow(
      /unsupported characters/
    )
  })
})
