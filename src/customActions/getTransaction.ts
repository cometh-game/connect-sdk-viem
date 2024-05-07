import { ComethWallet } from '@cometh/connect-sdk'
import {
  Address,
  Chain,
  GetBlockNumberReturnType,
  Hash,
  parseAbiItem,
  PublicClient,
  TransactionReceipt,
  Transport
} from 'viem'

import { sleep } from '../utils/utils'

const _catchSuccessEvent = async (
  client: PublicClient<Transport, Chain>,
  address: Address,
  safeTxHash: Hash,
  currentBlockNumber: GetBlockNumberReturnType
): Promise<any> => {
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

  return filteredTransactionEvent
}

const _catchFailureEvent = async (
  client: PublicClient<Transport, Chain>,
  address: Address,
  safeTxHash: Hash,
  currentBlockNumber: GetBlockNumberReturnType
): Promise<any> => {
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

  return filteredTransactionEvent
}

export const getTransaction = async ({
  client,
  wallet,
  safeTxHash,
  relayId,
  timeout = 60 * 1000
}: {
  client: any
  wallet: ComethWallet
  safeTxHash: Hash
  relayId?: string
  timeout?: number
}): Promise<TransactionReceipt> => {
  const startDate = Date.now()
  const timeoutLimit = new Date(startDate + timeout).getTime()

  const currentBlockNumber = await client.getBlockNumber()
  const from = wallet.getAddress() as Address

  let txSuccessEvent
  let txFailureEvent

  while (!txSuccessEvent && !txFailureEvent && Date.now() < timeoutLimit) {
    sleep(3000)
    txSuccessEvent = await _catchSuccessEvent(
      client,
      from,
      safeTxHash,
      currentBlockNumber
    )
    txFailureEvent = await _catchFailureEvent(
      client,
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
      txResponse = await client.getTransactionReceipt(transactionHash)
      sleep(2000)
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
