import { ComethWallet } from '@cometh/connect-sdk'
import type { Abi } from 'abitype'
import {
  BaseError,
  Chain,
  Client,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  getContractError,
  SimulateContractParameters,
  SimulateContractReturnType,
  Transport
} from 'viem'


export type SimulateContractWithConnectParameters<
  TAbi extends Abi | readonly unknown[] = Abi | readonly unknown[],
  TFunctionName extends string = string,
  TChain extends Chain | undefined = Chain | undefined,
  TChainOverride extends Chain | undefined = undefined
> = SimulateContractParameters<
  TAbi,
  TFunctionName,
  TChain,
  TChainOverride
> & { wallet: ComethWallet }


export async function simulateContract<
  const TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChain extends Chain | undefined,
  TChainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, TChain>,
  {
    wallet,
    abi,
    address,
    args,
    dataSuffix,
    functionName,
    ...callRequest
  }: SimulateContractWithConnectParameters<
    TAbi,
    TFunctionName,
    TChain,
    TChainOverride
  >,
): Promise<
  SimulateContractReturnType<
    TAbi,
    TFunctionName,
    TChain,
    TChainOverride
  >
> {

  const calldata = encodeFunctionData({ abi, args, functionName } as unknown as EncodeFunctionDataParameters<TAbi, TFunctionName>)

  try {
    const { totalGasCost, txValue } = await wallet.estimateTxGasAndValue({ to: address, value: "0x00", data: calldata, operation: 0 })

    await wallet.verifyHasEnoughBalance(totalGasCost, txValue)

    const minimizedAbi = (abi as Abi).filter(
      (abiItem) =>
        'name' in abiItem && abiItem.name === functionName,
    )

    return {
      result: calldata,
      request: {
        abi: minimizedAbi,
        address,
        args,
        dataSuffix,
        functionName,
        ...callRequest,
      },
    } as unknown as SimulateContractReturnType<
      TAbi,
      TFunctionName,
      TChain,
      TChainOverride
    >
  } catch (error) {
    throw getContractError(error as BaseError, {
      abi: abi as any,
      address,
      args,
      docsPath: '/docs/contract/simulateContract',
      functionName,
      sender: address,
    })
  }
}