import { getConnectViemAccount } from './account'
import type { ConnectClient, ConnectClientParams } from './client'
import { getConnectViemClient } from './client'
import type { WagmiConfigConnectorParams } from './wagmi'
import {
  comethConnectConnector,
  comethConnectWallet,
  getComethConnectConnector
} from './wagmi'

export type { ConnectClient, ConnectClientParams, WagmiConfigConnectorParams }

export {
  comethConnectConnector,
  comethConnectWallet,
  getComethConnectConnector,
  getConnectViemAccount,
  getConnectViemClient
}
