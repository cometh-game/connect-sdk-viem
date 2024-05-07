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
import { deepHexlify } from '../utils/utils'

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
  const { to, value, data, wallet } = args

  const result = await wallet.sendTransaction(
    deepHexlify({
      to: to,
      value: value || 0n,
      data: data || 0n
    })
  )


  const txReceipt = await getTransaction({
    client,
    wallet,
    safeTxHash: result.safeTxHash as Hash,
    relayId: result.relayId
  })


  return txReceipt.transactionHash as Hash
}
