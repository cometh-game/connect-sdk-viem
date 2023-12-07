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
  avalanche,
  avalancheFuji,
  gnosis,
  gnosisChiado,
  polygon,
  polygonMumbai,
  polygonZkEvm,
  polygonZkEvmTestnet
} from 'viem/chains'

import { connectWalletActions } from '../customActions'
import { ComethAccountActions } from '../customActions/connectWalletActions'
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
  rpc?: string
}

export const getConnectViemClient = ({
  wallet,
  rpc
}: ConnectClientParams): ConnectClient => {
  const chain = supportedChains.find(
    (chain) => chain.id === wallet.chainId
  ) as Chain

  return createPublicClient({
    chain,
    transport: http(rpc)
  }).extend(connectWalletActions(wallet))
}
