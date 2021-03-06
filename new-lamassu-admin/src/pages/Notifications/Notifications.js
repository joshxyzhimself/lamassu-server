import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import React, { useState } from 'react'

import TitleSection from 'src/components/layout/TitleSection'
import { fromNamespace, toNamespace, namespaces } from 'src/utils/config'

import Section from '../../components/layout/Section'

import NotificationsCtx from './NotificationsContext'
import CryptoBalanceAlerts from './sections/CryptoBalanceAlerts'
import CryptoBalanceOverrides from './sections/CryptoBalanceOverrides'
import FiatBalanceAlerts from './sections/FiatBalanceAlerts'
import FiatBalanceOverrides from './sections/FiatBalanceOverrides'
import Setup from './sections/Setup'
import TransactionAlerts from './sections/TransactionAlerts'

const GET_INFO = gql`
  query getData {
    config
    machines {
      name
      deviceId
    }
    cryptoCurrencies {
      code
      display
    }
  }
`

const SAVE_CONFIG = gql`
  mutation Save($config: JSONObject) {
    saveConfig(config: $config)
  }
`

const Notifications = ({ name: SCREEN_KEY }) => {
  const [section, setSection] = useState(null)
  const [error, setError] = useState(null)
  const [editingKey, setEditingKey] = useState(null)

  const { data } = useQuery(GET_INFO)

  const [saveConfig] = useMutation(SAVE_CONFIG, {
    refetchQueries: ['getData'],
    onCompleted: () => setEditingKey(null),
    onError: error => setError({ error })
  })

  const config = fromNamespace(SCREEN_KEY)(data?.config)
  const machines = data?.machines
  const cryptoCurrencies = data?.cryptoCurrencies

  const currency = R.path(['fiatCurrency'])(
    fromNamespace(namespaces.LOCALE)(data?.config)
  )

  const save = R.curry((section, rawConfig) => {
    const config = toNamespace(SCREEN_KEY)(rawConfig)
    setSection(section)
    setError(null)
    return saveConfig({ variables: { config } })
  })

  const setEditing = (key, state) => {
    if (!state) {
      setError(null)
    }
    setEditingKey(state ? key : null)
  }

  const isEditing = key => editingKey === key
  const isDisabled = key => editingKey && editingKey !== key

  const contextValue = {
    save,
    error,
    editingKey,
    data: config,
    currency,
    isEditing,
    isDisabled,
    setEditing,
    setSection,
    machines,
    cryptoCurrencies
  }

  return (
    <NotificationsCtx.Provider value={contextValue}>
      <TitleSection title="Notifications" />

      <Section title="Setup" error={error && !section}>
        <Setup />
      </Section>

      <Section title="Transaction alerts" error={error && section === 'tx'}>
        <TransactionAlerts section="tx" />
      </Section>

      <Section title="Fiat balance alerts" error={error && section === 'fiat'}>
        <FiatBalanceAlerts section="fiat" />
        <FiatBalanceOverrides section="fiat" />
      </Section>

      <Section
        title="Crypto balance alerts"
        error={error && section === 'crypto'}>
        <CryptoBalanceAlerts section="crypto" />
        <CryptoBalanceOverrides section="crypto" />
      </Section>
    </NotificationsCtx.Provider>
  )
}

export default Notifications
