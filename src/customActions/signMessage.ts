import { ComethWallet } from '@cometh/connect-sdk'
import { Account, Chain, Client, Hex, SignableMessage, Transport } from 'viem'
import { ErrorType } from 'viem/_types/errors/utils'
import { GetAccountParameter } from 'viem/_types/types/account'
import {
  ParseAccountErrorType,
  RequestErrorType,
  ToHexErrorType
} from 'viem/utils'

import { getConnectViemAccount } from '../account'

export type SignMessageWithConnectParameters<
  TAccount extends Account | undefined = Account | undefined
> = GetAccountParameter<TAccount> & {
  message: SignableMessage
} & { wallet: ComethWallet }

export type SignMessageReturnType = Hex

export type SignMessageErrorType =
  | ParseAccountErrorType
  | RequestErrorType
  | ToHexErrorType
  | ErrorType

export async function signMessage<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined
>(
  client: Client<Transport, TChain, TAccount>,
  args: SignMessageWithConnectParameters<TAccount>
): Promise<SignMessageReturnType> {
  const { message, wallet } = args

  const account = getConnectViemAccount(wallet)

  return await account.signMessage({ message })
}
