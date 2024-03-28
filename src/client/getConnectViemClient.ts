import { ComethWallet } from '@cometh/connect-sdk'
import {
  Account,
  Chain,
  Client,
  createPublicClient,
  http,
  Transport
} from 'viem'
import { Prettify } from 'viem/_types/types/utils'
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  gnosis,
  gnosisChiado,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai
} from 'viem/chains'

import { ComethAccountActions, connectWalletActions } from '../customActions'
import {
  muster,
  musterTestnet,
  redstoneHolesky,
  xlNetwork
} from '../customChains'

const supportedChains = [
  arbitrum,
  arbitrumSepolia,
  polygon,
  polygonMumbai,
  avalanche,
  avalancheFuji,
  gnosis,
  gnosisChiado,
  base,
  baseSepolia,
  muster,
  musterTestnet,
  redstoneHolesky,
  optimism,
  optimismSepolia,
  xlNetwork
]

export type ConnectClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined
> = Prettify<
  Client<
    transport,
    chain,
    account,
    undefined,
    ComethAccountActions<chain, account>
  >
>

export type ConnectClientParams = {
  wallet: ComethWallet
  apiKey: string
  rpc?: string
}

export const getConnectViemClient = ({
  wallet,
  apiKey,
  rpc
}: ConnectClientParams): any => {
  const chain = supportedChains.find(
    (chain) => chain.id === wallet.chainId
  ) as Chain

  return createPublicClient({
    chain,
    transport: http(rpc)
  }).extend(connectWalletActions(wallet, apiKey))
}
