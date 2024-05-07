import { getConnectViemAccount } from './account'
import type { ConnectClient, ConnectClientParams } from './client'
import { getConnectViemClient } from './client'
import {
  muster,
  musterTestnet,
  redstoneHolesky,
  xlNetwork
} from './customChains'
import type { WagmiConfigConnectorParams } from './wagmi'
import {
  comethConnectConnector,
  getComethConnectConnector,
  getComethConnectWallet
} from './wagmi'

export type { ConnectClient, ConnectClientParams, WagmiConfigConnectorParams }

export { muster, musterTestnet, redstoneHolesky, xlNetwork }

export {
  comethConnectConnector,
  getComethConnectConnector,
  getComethConnectWallet,
  getConnectViemAccount,
  getConnectViemClient
}
