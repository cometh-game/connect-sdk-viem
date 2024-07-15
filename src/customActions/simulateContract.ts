import { ComethWallet } from '@cometh/connect-sdk'
import type { Abi } from 'abitype'
import {
  Account,
  BaseError,
  Chain,
  Client,
  ContractFunctionArgs,
  ContractFunctionName,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  getContractError,
  SimulateContractParameters,
  SimulateContractReturnType,
  Transport
} from 'viem'


export type SimulateContractWithConnectParameters<
  TAbi extends Abi | readonly unknown[] = Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<
    TAbi,
    "nonpayable" | "payable"
  > = ContractFunctionName<TAbi, "nonpayable" | "payable">,
  TArgs extends ContractFunctionArgs<
    TAbi,
    "nonpayable" | "payable",
    TFunctionName
  > = ContractFunctionArgs<TAbi, "nonpayable" | "payable", TFunctionName>,
  TChain extends Chain | undefined = Chain | undefined,
  TChainOverride extends Chain | undefined = undefined
> = SimulateContractParameters<
  TAbi,
  TFunctionName,
  TArgs,
  TChain,
  TChainOverride
> & { wallet: ComethWallet }


export async function simulateContract<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  const TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<
    TAbi,
    "nonpayable" | "payable"
  > = ContractFunctionName<TAbi, "nonpayable" | "payable">,
  TArgs extends ContractFunctionArgs<
    TAbi,
    "nonpayable" | "payable",
    TFunctionName
  > = ContractFunctionArgs<TAbi, "nonpayable" | "payable", TFunctionName>,
  TChainOverride extends Chain | undefined = undefined
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
    TArgs,
    TChain,
    TChainOverride
  >,
): Promise<
  SimulateContractReturnType<
    TAbi,
    TFunctionName,
    TArgs,
    TChain,
    TAccount,
    TChainOverride
  >
> {

  const calldata = encodeFunctionData<TAbi, TFunctionName>({ abi, args, functionName } as EncodeFunctionDataParameters<TAbi, TFunctionName>)

  try {

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
      TArgs,
      TChain,
      TAccount,
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