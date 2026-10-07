import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/i18n'

import { createTerminal } from './terminals'

interface TerminalTargetDialogProps {
  kind: 'ssh' | 'docker'
  onClose: () => void
}

export function TerminalTargetDialog({ kind, onClose }: TerminalTargetDialogProps) {
  const { t } = useI18n()
  const [host, setHost] = useState('')
  const [container, setContainer] = useState('')

  return (
    <Dialog onOpenChange={open => { if (!open) {onClose()} }} open>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t.rightSidebar.terminalTargetTitle}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={event => {
          event.preventDefault()

          if (!host.trim() || (kind === 'docker' && !container.trim())) {return}
          createTerminal('', kind === 'ssh'
            ? { kind, host: host.trim() }
            : { kind, host: host.trim(), container: container.trim() })
          onClose()
        }}>
          <label className="grid gap-1">
            {t.rightSidebar.terminalTargetHost}
            <Input onChange={event => setHost(event.target.value)} required value={host} />
          </label>
          {kind === 'docker' && <label className="grid gap-1">
            {t.rightSidebar.terminalTargetContainer}
            <Input onChange={event => setContainer(event.target.value)} required value={container} />
          </label>}
          <DialogFooter>
            <Button onClick={onClose} type="button" variant="text">{t.common.cancel}</Button>
            <Button disabled={!host.trim() || (kind === 'docker' && !container.trim())} type="submit">
              {t.rightSidebar.terminalTargetOpen}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
