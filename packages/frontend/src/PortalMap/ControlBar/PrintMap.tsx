import React, { FC } from 'react'

import { IconButton } from '@material-ui/core'
import PrintIcon from '@material-ui/icons/Print'

import styles from './styles.module.scss'

export interface HomeButtonProps {
  handleClick: () => void
}

const HomeButton: FC<HomeButtonProps> = ({ handleClick }) => (
  <div className={styles.control}>
    <IconButton onClick={handleClick} aria-label="home" title="reload map">
      <PrintIcon fontSize="large" color="secondary" />
    </IconButton>
  </div>
)

export default HomeButton
