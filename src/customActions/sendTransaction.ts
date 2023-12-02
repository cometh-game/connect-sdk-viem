import { ComethWallet } from '@cometh/connect-sdk'
import {
  Account,
  Chain,
  Client,
  Hash,
  SendTransactionParameters,
  SendTransactionReturnType,
  Transport
} from 'viem'

import { getTransaction } from '../customActions/getTransaction'

export type SendTransactionWithConnectParameters<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined
> = SendTransactionParameters<TChain, TAccount, TChainOverride> & {
  wallet: ComethWallet
}

export async function sendTransaction<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined
>(
  client: Client<Transport, TChain, TAccount>,
  args: SendTransactionWithConnectParameters<TChain, TAccount, TChainOverride>
): Promise<SendTransactionReturnType> {
  const { data, to, wallet } = args

  const result = await wallet.sendTransaction({
    to: to as string,
    value: '0x00',
    data: data as string
  })

  const txReceipt = await getTransaction(
    client,
    wallet,
    result.safeTxHash as Hash
  )

  return txReceipt.transactionHash as Hash
}
