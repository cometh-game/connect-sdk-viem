import { ComethWallet } from '@cometh/connect-sdk'
import {
  Account,
  Address,
  Chain,
  Client,
  createClient,
  createPublicClient,
  GetBlockNumberReturnType,
  Hash,
  Hex,
  http,
  Log,
  parseAbiItem,
  PublicClient,
  TransactionReceipt,
  Transport
} from 'viem'

import { sleep } from '../utils/utils'

const _catchSuccessEvent = async (
  client: PublicClient,
  address: Address,
  safeTxHash: Hash,
  currentBlockNumber: GetBlockNumberReturnType
): Promise<Log> => {
  const successTransactionLogs = await client.getLogs({
    address,
    event: parseAbiItem(
      'event ExecutionSuccess(bytes32 txHash, uint256 payment)'
    ),
    fromBlock: currentBlockNumber - 300n
  })

  const filteredTransactionEvent = successTransactionLogs.find(
    (e) => e.args.txHash == safeTxHash
  )

  return filteredTransactionEvent as Log
}

const _catchFailureEvent = async (
  client: PublicClient,
  address: Address,
  safeTxHash: Hash,
  currentBlockNumber: GetBlockNumberReturnType
): Promise<Log> => {
  const successTransactionLogs = await client.getLogs({
    address,
    event: parseAbiItem(
      'event ExecutionFailure(bytes32 txHash, uint256 payment)'
    ),
    fromBlock: currentBlockNumber - 300n
  })

  const filteredTransactionEvent = successTransactionLogs.find(
    (e) => e.args.txHash == safeTxHash
  )

  return filteredTransactionEvent as Log
}

export const getTransaction = async <
  TChain extends Chain | undefined,
  TAccount extends Account | undefined
>({
  client,
  wallet,
  safeTxHash,
  relayId,
  timeout = 60 * 1000
}: {
  client: Client<Transport, TChain, TAccount>
  wallet: ComethWallet
  safeTxHash: Hash
  relayId?: string
  timeout?: number
}): Promise<TransactionReceipt> => {
  const startDate = Date.now()
  const timeoutLimit = new Date(startDate + timeout).getTime()

  const publicClient = createPublicClient({
    chain: client.chain,
    transport: http(client.transport.rpcUrl)
  }) as PublicClient

  const currentBlockNumber = await publicClient.getBlockNumber()
  const from = wallet.getAddress() as Address

  let txSuccessEvent
  let txFailureEvent

  while (!txSuccessEvent && !txFailureEvent && Date.now() < timeoutLimit) {
    await sleep(3000)
    txSuccessEvent = await _catchSuccessEvent(
      publicClient,
      from,
      safeTxHash,
      currentBlockNumber
    )
    txFailureEvent = await _catchFailureEvent(
      publicClient,
      from,
      safeTxHash,
      currentBlockNumber
    )
  }

  const getTransactionReceipt = async (
    transactionHash: string
  ): Promise<TransactionReceipt> => {
    let txResponse: TransactionReceipt | null = null

    while (txResponse === null) {
      try {
        txResponse = await publicClient.getTransactionReceipt({
          hash: transactionHash as Hex
        })
      } catch {
        // Do nothing
      }

      await sleep(2000)
    }

    return txResponse
  }

  if (txSuccessEvent) {
    return await getTransactionReceipt(txSuccessEvent.transactionHash)
  }

  if (txFailureEvent) {
    return await getTransactionReceipt(txFailureEvent.transactionHash)
  }

  if (relayId) {
    try {
      const relayedTransaction = await wallet.getRelayedTransaction(relayId)
      if (relayedTransaction.status.confirmed) {
        const txResponse = await getTransactionReceipt(
          relayedTransaction.status.confirmed.hash
        )

        return txResponse
      }
      throw new Error(
        `The transaction has not been confirmed yet on the network, you can track its progress using its relayId:${relayId}`
      )
    } catch (e) {
      throw new Error(
        `The transaction has not been confirmed yet on the network, you can track its progress using its relayId:${relayId}`
      )
    }
  }

  throw new Error('Error during the relay of the transaction')
}
