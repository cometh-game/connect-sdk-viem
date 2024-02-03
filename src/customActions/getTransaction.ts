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
  safeTxHash
}: {
  client: any
  wallet: ComethWallet
  safeTxHash: Hash
}): Promise<TransactionReceipt> => {
  const currentBlockNumber = await client.getBlockNumber()
  const from = wallet.getAddress() as Address

  let txSuccessEvent
  let txFailureEvent

  while (!txSuccessEvent && !txFailureEvent) {
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

  if (txSuccessEvent) {
    let txResponse: TransactionReceipt | null = null
    while (txResponse === null) {
      sleep(1000)
      try {
        txResponse = await client.getTransactionReceipt({
          hash: txSuccessEvent.transactionHash as Hash
        })
      } catch (err) {
        console.log(err)
      }
    }

    return txResponse
  }
  if (txFailureEvent) {
    let txResponse: TransactionReceipt | null = null
    while (txResponse === null) {
      sleep(1000)
      try {
        txResponse = await client.getTransactionReceipt({
          hash: txSuccessEvent.transactionHash as Hash
        })
      } catch (err) {
        console.log(err)
      }
    }

    return txResponse
  }

  sleep(3000)
  return getTransaction({ client, wallet, safeTxHash })
}
