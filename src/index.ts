import { getConnectViemAccount } from './account'
import type { ConnectClient, ConnectClientParams } from './client'
import { getConnectPublicViemClient } from './client'
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
  getConnectPublicViemClient as getConnectViemClient
}
