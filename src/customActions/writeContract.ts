import { ComethWallet } from "@cometh/connect-sdk"
import { Abi, Account, Chain, Client, ContractFunctionArgs, ContractFunctionName, encodeFunctionData, EncodeFunctionDataParameters, Hash, Transport, WriteContractParameters, WriteContractReturnType } from "viem"

import { getAction } from "../utils/getActions"
import { sendTransaction, SendTransactionWithConnectParameters } from "./sendTransaction"

export type WriteContractWithConnectParameters<
    abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'payable' | 'nonpayable'>,
    args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
    TChainOverride extends Chain | undefined = undefined,
    TChain extends Chain | undefined = Chain | undefined,
    TAccount extends Account | undefined = Account | undefined,
> = WriteContractParameters<
    abi,
    functionName,
    args,
    TChain,
    TAccount,
    TChainOverride
> & { wallet: ComethWallet }

type WriteContract = <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'payable' | 'nonpayable'>,
    args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
    TChainOverride extends Chain | undefined = undefined,
    TChain extends Chain | undefined = Chain | undefined,
    TAccount extends Account | undefined = Account | undefined,
>(
    client: Client<Transport, TChain, TAccount>,
    args: WriteContractParameters<
        abi,
        functionName,
        args,
        TChain,
        TAccount,
        TChainOverride
    > & { wallet: ComethWallet },
) => Promise<WriteContractReturnType>

export const writeContract: WriteContract = async (
    client,
    {
        abi,
        address,
        args,
        dataSuffix,
        functionName,
        ...request
    },
) => {
    const data = encodeFunctionData({
        abi,
        args,
        functionName,
    } as unknown as EncodeFunctionDataParameters)

    const hash = await getAction(
        client,
        sendTransaction
    )({
        data: `${data}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
        to: address,
        ...request
    } as unknown as SendTransactionWithConnectParameters)

    return hash
}


