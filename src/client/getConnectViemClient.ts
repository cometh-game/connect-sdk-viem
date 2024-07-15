import { ComethWallet } from '@cometh/connect-sdk'
import { Account, Chain, Client, createClient, http, Transport } from 'viem'
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
  polygonAmoy,
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
  polygonAmoy,
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

export const getConnectViemClient = <
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined
>({
  wallet,
  apiKey,
  rpc
}: ConnectClientParams): ConnectClient<transport, chain, account> => {
  const chain = supportedChains.find(
    (chain) => chain.id === wallet.chainId
  ) as Chain

  return createClient({
    chain,
    transport: http(rpc)
  }).extend(connectWalletActions(wallet, apiKey)) as unknown as ConnectClient<
    transport,
    chain,
    account
  >
}
