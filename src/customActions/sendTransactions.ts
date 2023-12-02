import { deepHexlify } from '@alchemy/aa-core'
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

  const formattedTransactions = deepHexlify(transactions)

  const result = await wallet.sendBatchTransactions(formattedTransactions)
  return result.safeTxHash as Hash
}
