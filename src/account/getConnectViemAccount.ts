import { ComethWallet } from '@cometh/connect-sdk'
import {
  Address,
  CustomSource,
  Hash,
  PrivateKeyAccount,
  SignableMessage,
  toHex
} from 'viem'
import { toAccount } from 'viem/accounts'

export const getConnectViemAccount = (
  wallet: ComethWallet
): PrivateKeyAccount => {
  const address = wallet.getAddress() as Address
  const source: CustomSource = {
    address,
    async signMessage({
      message
    }: {
      message: SignableMessage
    }): Promise<Hash> {
      const signedMessage = await wallet.signMessage(message.toString())
      return `0x${signedMessage}`
    },
    /* eslint-disable */
    /* @ts-ignore */
    async signTransaction(transaction) {
      const safeTxDataTyped = await wallet.buildTransaction({
        to: transaction.to as string,
        value: toHex(transaction.value as bigint),
        data: transaction.data as string
      })

      return await wallet.signTransaction(safeTxDataTyped)
    },

    async signTypedData({ domain, types, primaryType, message }) {
      throw new Error('method not available')
    }
  }

  return {
    ...toAccount(source),
    publicKey: address,
    source: 'privateKey'
  }
}
