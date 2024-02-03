import { ComethWallet } from '@cometh/connect-sdk'
import {
  Abi,
  Account,
  Chain,
  Client,
  SendTransactionParameters,
  SimulateContractParameters,
  Transport,
  WriteContractParameters
} from 'viem'

import { getTransaction } from './getTransaction'
import { sendBatchTransactions, sendBatchTransactionsWithConnectParameters } from './sendBatchTransactions'
import {
  sendTransaction,
  SendTransactionWithConnectParameters
} from './sendTransaction'
import { signMessage, SignMessageWithConnectParameters } from './signMessage'
import { simulateContract, SimulateContractWithConnectParameters } from './simulateContract'
import { verifyMessage, VerifyMessageWithConnectParameters } from './verifyMessage'
import {
  writeContract,
  WriteContractWithConnectParameters
} from './writeContract'

export type ComethAccountActions<
  TChain extends Chain | undefined = Chain | undefined,
  TSmartAccount extends Account | undefined = Account | undefined
> = {
  /**
   * Creates, signs, and sends a new transaction to the network.
   * This function also allows you to sponsor this transaction if sender is a smartAccount
   *
   * - Docs: https://viem.sh/docs/actions/wallet/sendTransaction.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions/sending-transactions
   * - JSON-RPC Methods:
   *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
   *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
   *
   * @param args - {@link SendTransactionParameters}
   * @returns The [Transaction](https://viem.sh/docs/glossary/terms.html#transaction) hash. {@link SendTransactionReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const hash = await client.sendTransaction({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: 1000000000000000000n,
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const hash = await client.sendTransaction({
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: 1000000000000000000n,
   * })
   */
  sendTransaction: <TChainOverride extends Chain | undefined>(
    args: SendTransactionParameters<TChain, TSmartAccount, TChainOverride>
  ) => ReturnType<
    typeof sendTransaction<TChain, TSmartAccount, TChainOverride>
  >
  /**
   * Executes a write function on a contract.
   * This function also allows you to sponsor this transaction if sender is a smartAccount
   *
   * - Docs: https://viem.sh/docs/contract/writeContract.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/contracts/writing-to-contracts
   *
   * A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms.html) is needed to be broadcast in order to change the state.
   *
   * Internally, uses a [Wallet Client](https://viem.sh/docs/clients/wallet.html) to call the [`sendTransaction` action](https://viem.sh/docs/actions/wallet/sendTransaction.html) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData.html).
   *
   * __Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract.html#usage) before you execute it.__
   *
   * @param args - {@link WriteContractParameters}
   * @returns A [Transaction Hash](https://viem.sh/docs/glossary/terms.html#hash). {@link WriteContractReturnType}
   *
   * @example
   * import { createWalletClient, custom, parseAbi } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const hash = await client.writeContract({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
   *   functionName: 'mint',
   *   args: [69420],
   * })
   *
   * @example
   * // With Validation
   * import { createWalletClient, custom, parseAbi } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const { request } = await client.simulateContract({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
   *   functionName: 'mint',
   *   args: [69420],
   * }
   * const hash = await client.writeContract(request)
   */
  writeContract: <
    const TAbi extends Abi | readonly unknown[],
    TFunctionName extends string,
    TChainOverride extends Chain | undefined = undefined
  >(
    args: WriteContractParameters<
      TAbi,
      TFunctionName,
      TChain,
      TSmartAccount,
      TChainOverride
    >
  ) => ReturnType<
    typeof writeContract<
      TChain,
      TSmartAccount,
      TAbi,
      TFunctionName,
      TChainOverride
    >
  >
  /**
  * Creates, signs, and sends a new transaction to the network.
  * This function also allows you to sponsor this transaction if sender is a smartAccount
  *
  * - Docs: https://viem.sh/docs/actions/wallet/sendTransaction.html
  * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions/sending-transactions
  * - JSON-RPC Methods:
  *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
  *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
  *
  * @param args - {@link SendTransactionParameters}
  * @returns The [Transaction](https://viem.sh/docs/glossary/terms.html#transaction) hash. {@link SendTransactionReturnType}
  *
  * @example
  * import { createWalletClient, custom } from 'viem'
  * import { mainnet } from 'viem/chains'
  *
  * const client = createWalletClient({
  *   chain: mainnet,
  *   transport: custom(window.ethereum),
  * })
  * const hash = await client.sendTransaction([{
  *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  *   value: 1000000000000000000n
  * }, {
  *   to: '0x61897970c51812dc3a010c7d01b50e0d17dc1234',
  *   value: 10000000000000000n
  * })
  *
  * @example
  * // Account Hoisting
  * import { createWalletClient, http } from 'viem'
  * import { privateKeyToAccount } from 'viem/accounts'
  * import { mainnet } from 'viem/chains'
  *
  * const client = createWalletClient({
  *   account: privateKeyToAccount('0x…'),
  *   chain: mainnet,
  *   transport: http(),
  * })
  * const hash = await client.sendTransaction([{
  *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  *   value: 1000000000000000000n
  * }, {
  *   to: '0x61897970c51812dc3a010c7d01b50e0d17dc1234',
  *   value: 10000000000000000n
  * }])
  */
  sendBatchTransactions: (
    args: sendBatchTransactionsWithConnectParameters
  ) => ReturnType<typeof sendBatchTransactions<TChain, TSmartAccount>>,

  signMessage: (
    args: SignMessageWithConnectParameters<TSmartAccount>
  ) => ReturnType<typeof signMessage>,

  verifyMessage: (
    args: VerifyMessageWithConnectParameters
  ) => ReturnType<typeof verifyMessage>,

  simulateContract: <
    TChain extends Chain | undefined,
    const TAbi extends Abi | readonly unknown[],
    TFunctionName extends string,
    TChainOverride extends Chain | undefined = undefined,
  >(
    args: SimulateContractParameters<
      TAbi,
      TFunctionName,
      TChain,
      TChainOverride
    >
  ) => ReturnType<
    any
  >

}


export const connectWalletActions =
  (wallet: ComethWallet, apiKey: string) =>
    <
      TTransport extends Transport,
      TChain extends Chain | undefined = Chain | undefined,
      TSmartAccount extends Account | undefined = Account | undefined
    >(
      client: Client<TTransport, TChain, TSmartAccount>
    ): ComethAccountActions<TChain, TSmartAccount> => ({
      sendTransaction: (args) =>
        sendTransaction(client, {
          ...args,
          wallet
        } as SendTransactionWithConnectParameters),
      sendBatchTransactions: (args) =>
        sendBatchTransactions(client, {
          ...args,
          wallet
        } as sendBatchTransactionsWithConnectParameters),
      writeContract: (args) =>
        writeContract(client, {
          ...args,
          wallet
        } as WriteContractWithConnectParameters),
      signMessage: (args) =>
        signMessage(client, {
          ...args,
          wallet
        } as SignMessageWithConnectParameters),
      verifyMessage: (args) =>
        verifyMessage(client, {
          ...args,
          apiKey
        } as VerifyMessageWithConnectParameters),
      simulateContract: (args) =>
        simulateContract(client, {
          ...args,
          wallet
        } as SimulateContractWithConnectParameters)
    })

export { getTransaction, sendBatchTransactions, sendTransaction, simulateContract, verifyMessage,writeContract }
