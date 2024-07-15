import { ComethWallet } from '@cometh/connect-sdk'
import { Account, Hex, SignableMessage } from 'viem'
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

export async function signMessage<TAccount extends Account | undefined>(
  args: SignMessageWithConnectParameters<TAccount>
): Promise<SignMessageReturnType> {
  const { message, wallet } = args

  const account = getConnectViemAccount(wallet)

  return await account.signMessage({ message })
}
