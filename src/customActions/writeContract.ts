import { ComethWallet } from "@cometh/connect-sdk"
import { Abi, Account, Chain, Client, encodeFunctionData, EncodeFunctionDataParameters, Hash, Transport, WriteContractParameters } from "viem"

import { getAction } from "../utils/getActions"
import { sendTransaction, SendTransactionWithConnectParameters } from "./sendTransaction"

export type WriteContractWithConnectParameters<
    TAbi extends Abi | readonly unknown[] = Abi | readonly unknown[],
    TChain extends Chain | undefined = Chain | undefined,
    TAccount extends Account | undefined = Account | undefined,
    TFunctionName extends string = string,
    TChainOverride extends Chain | undefined = undefined
> = WriteContractParameters<
    TAbi,
    TFunctionName,
    TChain,
    TAccount,
    TChainOverride
> & { wallet: ComethWallet }

export async function writeContract<
    TChain extends Chain | undefined,
    TAccount extends Account | undefined,
    const TAbi extends Abi | readonly unknown[],
    TFunctionName extends string,
    TChainOverride extends Chain | undefined = undefined,
>(
    client: Client<Transport, TChain, TAccount>,
    {
        abi,
        address,
        args,
        dataSuffix,
        functionName,
        ...request
    }: WriteContractWithConnectParameters<
        TAbi,
        TChain,
        TAccount,
        TFunctionName,
        TChainOverride
    >,
): Promise<Hash> {
    const data = encodeFunctionData({
        abi,
        args,
        functionName,
    } as unknown as EncodeFunctionDataParameters<TAbi, TFunctionName>)

    const hash = await getAction(
        client,
        sendTransaction<TChain, TAccount, TChainOverride>
    )({
        data: `${data}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
        to: address,
        ...request
    } as unknown as SendTransactionWithConnectParameters<
        TChain,
        TAccount,
        TChainOverride
    >)

    return hash as Hash
}


