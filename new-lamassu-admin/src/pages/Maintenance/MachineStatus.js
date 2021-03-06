import { useQuery } from '@apollo/react-hooks'
import { makeStyles } from '@material-ui/core'
import { gql } from 'apollo-boost'
import moment from 'moment'
import * as R from 'ramda'
import React from 'react'

import DataTable from 'src/components/tables/DataTable'

import { MainStatus } from '../../components/Status'
import Title from '../../components/Title'
import { ReactComponent as WarningIcon } from '../../styling/icons/status/pumpkin.svg'
import { ReactComponent as ErrorIcon } from '../../styling/icons/status/tomato.svg'
import { mainStyles } from '../Transactions/Transactions.styles'

import MachineDetailsRow from './MachineDetailsCard'

const GET_MACHINES = gql`
  {
    machines {
      name
      deviceId
      paired
      cashbox
      cassette1
      cassette2
      statuses {
        label
        type
      }
    }
  }
`

const useStyles = makeStyles(mainStyles)

const MachineStatus = () => {
  const classes = useStyles()

  const { data: machinesResponse } = useQuery(GET_MACHINES)

  const elements = [
    {
      header: 'Machine Name',
      width: 232,
      size: 'sm',
      textAlign: 'left',
      view: m => m.name
    },
    {
      header: 'Status',
      width: 349,
      size: 'sm',
      textAlign: 'left',
      view: m => <MainStatus statuses={m.statuses} />
    },
    {
      header: 'Last ping',
      width: 192,
      size: 'sm',
      textAlign: 'left',
      view: m => moment(m.lastPing).fromNow()
    },
    {
      header: 'Ping Time',
      width: 155,
      size: 'sm',
      textAlign: 'left',
      view: m => m.pingTime || 'unknown'
    },
    {
      header: 'Software Version',
      width: 201,
      size: 'sm',
      textAlign: 'left',
      view: m => m.softwareVersion || 'unknown'
    }
  ]

  return (
    <>
      <div className={classes.titleWrapper}>
        <div className={classes.titleAndButtonsContainer}>
          <Title>Machine Status</Title>
        </div>
        <div className={classes.headerLabels}>
          <div>
            <WarningIcon />
            <span>Warning</span>
          </div>
          <div>
            <ErrorIcon />
            <span>Error</span>
          </div>
        </div>
      </div>
      <DataTable
        elements={elements}
        data={R.path(['machines'])(machinesResponse)}
        Details={MachineDetailsRow}
        expandable
      />
    </>
  )
}

export default MachineStatus
