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
import { GetAccountParameter } from 'viem/_types/types/account'

import { deepHexlify } from '../utils/utils'

export type SendTransactionsWithConnectParameters<
  TAccount extends Account | undefined = Account | undefined
> = {
  transactions: { to: Address; value: bigint; data: Hex }[]
} & GetAccountParameter<TAccount> & {
    wallet: ComethWallet
  }

export async function sendTransactions<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined
>(
  client: Client<Transport, TChain, TAccount>,
  args: SendTransactionsWithConnectParameters<TAccount>
): Promise<SendTransactionReturnType> {
  const { transactions, wallet } = args

  const result = await wallet.sendBatchTransactions(deepHexlify(transactions))
  return result.safeTxHash as Hash
}
