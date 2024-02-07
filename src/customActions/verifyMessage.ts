import { ComethWallet } from '@cometh/connect-sdk'
import type { Address } from 'abitype'
import {
  ByteArray,
  Chain,
  Client,
  HashMessageErrorType,
  Hex,
  SignableMessage,
  Transport,
  VerifyHashErrorType
} from 'viem'
import { ErrorType } from 'viem/_types/errors/utils'

import { getConnectApi } from '../services/API'

export type VerifyMessageWithConnectParameters = {
  /** The address that signed the original message. */
  address: Address
  /** The message to be verified. */
  message: SignableMessage
  /** The signature that was generated by signing the message with the address's private key. */
  signature: Hex | ByteArray
} & {
  apiKey: string
  wallet: ComethWallet
}

export type VerifyMessageReturnType = boolean

export type VerifyMessageErrorType =
  | HashMessageErrorType
  | VerifyHashErrorType
  | ErrorType

/**
 * Verify that a message was signed by the provided address.
 *
 * Compatible with Smart Contract Accounts & Externally Owned Accounts via [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492).
 *
 * - Docs {@link https://viem.sh/docs/actions/public/verifyMessage}
 *
 * @param client - Client to use.
 * @param parameters - {@link VerifyMessageParameters}
 * @returns Whether or not the signature is valid. {@link VerifyMessageReturnType}
 */
export async function verifyMessage<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  {
    address,
    message,
    signature,
    apiKey,
    wallet
  }: VerifyMessageWithConnectParameters
): Promise<VerifyMessageReturnType> {
  const api = getConnectApi(apiKey)

  console.log(address)
  console.log(wallet.getAddress())

  const walletAddress = address || wallet.getAddress()

  const response = await api.post(
    `/wallets/${walletAddress}/is-valid-signature`,
    {
      message,
      signature
    }
  )

  return response.data.result
}
