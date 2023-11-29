import { ComethWallet } from '@cometh/connect-sdk'
import {
  Chain,
  createPublicClient,
  extractChain,
  http,
  PublicClient,
  Transport
} from 'viem'
import {
  avalanche,
  avalancheFuji,
  gnosis,
  gnosisChiado,
  polygon,
  polygonMumbai,
  polygonZkEvm,
  polygonZkEvmTestnet
} from 'viem/chains'

import { ConnectWalletActions, connectWalletActions } from '../customActions'
import { musterTestnet, redstoneHolesky } from '../customChains'

const supportedChains = [
  polygon,
  polygonMumbai,
  avalanche,
  avalancheFuji,
  gnosis,
  gnosisChiado,
  polygonZkEvm,
  polygonZkEvmTestnet,
  musterTestnet,
  redstoneHolesky
]

export type ComethClient = PublicClient<Transport, Chain> & ConnectWalletActions

export const getConnectViemClient = (
  wallet: ComethWallet,
  rpc?: string
): ComethClient => {
  const chain: Chain = extractChain({
    chains: supportedChains,
    id: wallet.chainId as any
  })

  return createPublicClient({
    chain,
    transport: http(rpc)
    /* eslint-disable */
    /* @ts-ignore */
  }).extend(connectWalletActions(wallet))
}
