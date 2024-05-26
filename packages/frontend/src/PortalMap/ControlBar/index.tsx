import React, { forwardRef } from 'react'

import { Zone } from '@portaler/types'

import { CytoEdgeData } from '../'
import DeleteNode from './DeleteNode'
import HomeButton from './HomeButton'
import ReloadMap from './ReloadMap'
import Search from './Search'
import styles from './styles.module.scss'
import ZoneInfo from './ZoneInfo'
import PrintMap from './PrintMap'
import DeadendNode from './DeadendNode'

interface ControlBarProps {
  handleHome: (zone: Zone) => void
  reloadMap: () => void
  printMap: () => void
  zone: Zone | null
  edgeData: CytoEdgeData[]
}

const ControlBar = forwardRef<HTMLDivElement, ControlBarProps>(
  ({ handleHome, reloadMap, printMap, zone, edgeData }, ref) => (
    <div ref={ref} className={styles.bar}>
      <div>
        <ZoneInfo />
      </div>
      <div className={styles.controls}>
        <DeadendNode edgeData={edgeData} zoneName={zone?.name} />
        <DeleteNode edgeData={edgeData} zoneName={zone?.name} />
        <Search />
        <HomeButton handleHome={handleHome} />
        <PrintMap handleClick={printMap} />
        <ReloadMap handleClick={reloadMap} />
      </div>
    </div>
  )
)

export default ControlBar
