import React, { FC, useCallback, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
} from '@material-ui/core'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'

import { CytoEdgeData } from '../'
import styles from './styles.module.scss'
import useDeadendZone from '../hooks/useDeadendZone'

interface DeadendNodeProps {
  edgeData: CytoEdgeData[]
  zoneName: string | undefined
}

const DeadendNode: FC<DeadendNodeProps> = ({ edgeData, zoneName }) => {
  const deadendZone = useDeadendZone()
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleClose = useCallback(
    (doDeadendZone: boolean) => {
      if (doDeadendZone && zoneName) {
        deadendZone(zoneName)
      }

      setIsOpen(false)
    },
    [deadendZone, zoneName]
  )

  return edgeData.length > 0 ? (
    <div className={styles.control}>
      <IconButton
        onClick={() => setIsOpen(true)}
        aria-label="delete"
        title="delete"
      >
        <HighlightOffIcon fontSize="large" color="secondary" />
      </IconButton>
      <Dialog
        open={isOpen}
        onClose={() => handleClose(false)}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          {`Are you sure you want to deadend zone "${zoneName}"?`}
        </DialogTitle>
        <DialogActions>
          <Button
            onClick={() => handleClose(false)}
            color="secondary"
            autoFocus
          >
            Disagree
          </Button>
          <Button onClick={() => handleClose(true)} color="secondary">
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  ) : null
}

export default DeadendNode
