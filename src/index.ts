import { getConnectViemAccount } from './account'
import type { ConnectClient, ConnectClientParams } from './client'
import { getConnectViemClient } from './client'
import type {
  RainbowKitConnectorParams,
  WagmiConfigConnectorParams
} from './wagmi'
import { ComethConnectConnector, rainbowkitComethConnect } from './wagmi'

export type {
  ConnectClient,
  ConnectClientParams,
  RainbowKitConnectorParams,
  WagmiConfigConnectorParams
}

export {
  ComethConnectConnector,
  getConnectViemAccount,
  getConnectViemClient,
  rainbowkitComethConnect
}
