import { ComethWallet } from '@cometh/connect-sdk'
import {
  Account,
  Address,
  Chain,
  Client,
  Hash,
  Hex,
  SendTransactionReturnType,
  Transport
} from 'viem'

import { deepHexlify } from '../utils/utils'
import { getTransaction } from './getTransaction'

export type sendBatchTransactionsWithConnectParameters = {
  transactions: { to: Address; value: bigint; data: Hex }[]
} & {
  wallet: ComethWallet
}

export async function sendBatchTransactions<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined
>(
  client: Client<Transport, TChain, TAccount>,
  args: sendBatchTransactionsWithConnectParameters
): Promise<SendTransactionReturnType> {
  const { transactions, wallet } = args

  const result = await wallet.sendBatchTransactions(deepHexlify(transactions))

  const txReceipt = await getTransaction({
    client,
    wallet,
    safeTxHash: result.safeTxHash as Hash
  })

  return txReceipt.transactionHash as Hash
}
