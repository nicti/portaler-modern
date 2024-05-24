import cn from 'clsx'
import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { animated, useSpring } from 'react-spring'

import { IconButton, makeStyles, Tab, Tabs, Theme } from '@material-ui/core'
import AddLocationIcon from '@material-ui/icons/AddLocation'
import HideIcon from '@material-ui/icons/FirstPage'
import FindPathIcon from '@material-ui/icons/CompareArrows'
import HelpIcon from '@material-ui/icons/HelpOutline'
import TopWalkersIcon from '@material-ui/icons/BarChart'
import InfoIcon from '@material-ui/icons/InfoOutlined'
import SettingsIcon from '@material-ui/icons/Settings'

import useToken from '../common/hooks/useToken'
import { portalerSmall } from '../common/images'
import LoginButton from '../LoginButton'
import MapInfo from '../MapInfo'
import TopWalkers from '../TopWalkers'
import FindPath from '../FindPath'
import PortalForm from '../PortalForm'
import { RootState } from '../reducers'
import { SidebarActionTypes } from '../reducers/sideBarReducer'
import UserSettings from '../UserSettings'
import Help from './Help'
import styles from './styles.module.scss'
import usePermission from '../common/hooks/usePermission'

type TabOpts = 'form' | 'find' | 'info' | 'top' | 'help' | 'settings'

const tabMap = (tabVal: number, permission: number): TabOpts => {
  switch (tabVal) {
    case 0:
      return permission === 2 ? 'form' : 'info'
    case 1:
      return permission === 2 ? 'info' : 'top'
    case 2:
      return permission === 2 ? 'top' : 'help'
    case 3:
      return permission === 2 ? 'help' : 'settings'
    case 4:
      return 'settings'
    default:
      return permission === 2 ? 'form' : 'info'
  }
}

const getTabVal = (tabOpt: TabOpts, permission: number): number => {
  switch (tabOpt) {
    case 'form':
      return 0
    case 'info':
      return permission === 2 ? 1 : 0
    case 'top':
      return permission === 2 ? 2 : 1
    case 'help':
      return permission === 2 ? 3 : 2
    case 'settings':
      return permission === 2 ? 4 : 3
    default:
      return permission === 2 ? 0 : 1
  }
}

const useStyles = makeStyles((theme: Theme) => ({
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  tab: {
    minWidth: 0,
  },
  selected: {
    backgroundColor: `rgba(255, 255, 255, 0.05)`,
  },
}))

const SideBar = () => {
  const token = useToken()
  const permission = usePermission() ?? 0
  const dispatch = useDispatch()

  const [tabValue, setTabValue] = useState<TabOpts>(tabMap(0, permission))

  const handleChange = useCallback(
    (_: any, newValue: number) => {
      setTabValue(tabMap(newValue, permission))
    },
    [permission]
  )

  const handleSlide = useCallback(() => {
    dispatch({ type: SidebarActionTypes.TOGGLE })
  }, [dispatch])

  const classes = useStyles()

  const sideBar = useSelector((state: RootState) => state.sideBar)

  const opacity = useSpring({
    opacity: sideBar ? 1 : 0,
    config: { duration: sideBar ? 420 : 50 },
  })

  const props = useSpring({
    width: sideBar ? 'inherit' : 0,
    marginLeft: sideBar ? 'inherit' : 0,
    marginRight: sideBar ? 'inherit' : 0,
  })

  const headerProps = useSpring({
    paddingLeft: sideBar ? 'inherit' : 0,
    paddingRight: sideBar ? 'inherit' : 0,
  })

  return !token ? (
    <LoginButton />
  ) : (
    <aside className={styles.searchSide}>
      <animated.div style={headerProps} className={styles.header}>
        <animated.div style={props}>
          <animated.img
            style={opacity}
            alt="logo"
            src={portalerSmall}
            className={styles.logo}
          />
        </animated.div>
        <div className={cn({ [styles.expand]: !sideBar })}>
          <IconButton onClick={handleSlide} aria-label="hide">
            <HideIcon fontSize="large" className={styles.hideIcon} />
          </IconButton>
        </div>
      </animated.div>
      <animated.div style={props} className={styles.content}>
        <animated.div
          style={opacity}
          className={cn(styles.mainContent, {
            [styles.help]: tabValue === 'help',
          })}
        >
          {tabValue === 'form' && permission === 2 && <PortalForm />}
          {tabValue === 'info' && <MapInfo />}
          {tabValue === 'top' && <TopWalkers />}
          {tabValue === 'help' && <Help />}
          {tabValue === 'settings' && <UserSettings />}
        </animated.div>
        <animated.div style={opacity} className={styles.nav}>
          <Tabs
            orientation="vertical"
            value={getTabVal(tabValue, permission)}
            textColor="secondary"
            indicatorColor="secondary"
            onChange={handleChange}
            aria-label="panel options"
            className={classes.tabs}
          >
            {permission === 2 ? (
              <Tab
                className={classes.tab}
                icon={<AddLocationIcon />}
                aria-label="Add location"
                title="Add location"
              />
            ) : null}
            <Tab
              className={classes.tab}
              icon={<InfoIcon />}
              aria-label="Zone Info"
              title="Zone Info"
            />
            <Tab
              className={classes.tab}
              icon={<TopWalkersIcon />}
              aria-label="Top of Mist Walkers"
              title="Top of Mist Walkers"
            />
            <Tab
              className={classes.tab}
              icon={<HelpIcon />}
              aria-label="Portaler Help"
              title="Portaler Help"
            />
            <Tab
              className={classes.tab}
              icon={<SettingsIcon />}
              aria-label="Settings"
              title="Settings"
            />
          </Tabs>
        </animated.div>
      </animated.div>
    </aside>
  )
}

export default SideBar
