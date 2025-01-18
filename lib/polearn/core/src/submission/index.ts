import { decodeFunctionData, encodeFunctionData, isAddressEqual, PublicClient, sha256 } from "viem";
import {
    ContractData, Deployment, NativeValue,
    SubmissionBody,
    SubmissionOpt,
    Transaction,
    SubmissionReceipt,
    defaultOpts
} from "./interface";
import { cleanBytecode } from "../utils";
import { generateDataHashFromContract } from "../main";

export const processDeploymentSubmission = async (
    client: PublicClient,
    payload: SubmissionBody,
    submission: Deployment,
    opts: SubmissionOpt = defaultOpts): Promise<SubmissionReceipt> => {
    const transaction = await client.getTransactionReceipt({
        hash: payload.transactionHash
    })

    if (!opts.testing && !isAddressEqual(payload.user, transaction.from))
        throw new Error("Transaction not from user")

    if (!transaction.contractAddress)
        throw new Error("Contract not deployed")

    let bytecode = await client.getCode({
        address: transaction.contractAddress
    }) as `0x${string}`
    bytecode = cleanBytecode(bytecode)

    const bytehash = sha256(bytecode as `0x${string}`)
    if (bytehash !== submission.bytecode)
        throw new Error("Invalid Transaction Hash")

    return { result: true };
}

export const processDeployTransaction = async (client: PublicClient,
    payload: SubmissionBody,
    submission: Transaction,
    opts: SubmissionOpt = defaultOpts): Promise<SubmissionReceipt> => {
    const transaction = await client.getTransaction({
        hash: payload.transactionHash
    })

    if (!opts.testing && !isAddressEqual(payload.user, transaction.from))
        throw new Error("Transaction not from user")

    let errMsg = ""
    /** 
     * We can Decode but there is possible that the signature is not found
     * Hence we'll encode what given, as this is a requirement and just compare to transaction input
     */
    try {
        const { functionName, args } = decodeFunctionData({
            abi: submission.abi,
            data: transaction.input
        })

        if (!JSON.stringify(submission.abi).includes(functionName))
            errMsg = "Invalid Function Name"

        // Optionally, if submission requires specific arguments
        if (submission.args) {
            if (!arraysEqual(submission.args, args as any[]))
                errMsg = "Invalid Arguments"
        }
    } catch (e: any) {
        errMsg = ""
        console.log(e)
        const data = encodeFunctionData({
            abi: [submission.abi[0]],
            functionName: submission.abi[0].name,
            args: submission.args
        })

        if (data !== transaction.input) {
            throw new Error("Incorrect Transaction")
        }
    }

    if (errMsg)
        throw new Error(errMsg)

    // If submission requires to call from a specific contract
    if (submission.contract) {
        if (!isAddressEqual(submission.contract as `0x${string}`, transaction.to || "0x"))
            errMsg = "Invalid Contract Address"
    }

    // Typically if decodeFunctionData is successful, we can assume the transaction is correct
    return { result: true };
}

export const processNativeValueTransaction = async (client: PublicClient,
    payload: SubmissionBody,
    submission: NativeValue,
    opts: SubmissionOpt = defaultOpts): Promise<SubmissionReceipt> => {
    const transaction = await client.getTransaction({
        hash: payload.transactionHash
    })

    console.log(transaction)

    if (!transaction.to)
        throw new Error("Invalid to from user")

    if (!opts.testing && !isAddressEqual(payload.user, transaction.to))
        throw new Error("Transaction not from user")

    if (!isAddressEqual(submission.from, transaction.from))
        throw new Error("Incorrect Transaction")

    let symbol = "eq"
    if (submission.symbol)
        symbol = submission.symbol

    let isValid = false
    let value = BigInt(submission.value)
    switch (symbol) {
        case "eq":
            if (transaction.value === value)
                isValid = true
            break;
        case "lt":
            if (transaction.value < value)
                isValid = true
            break;
        case "gt":
            if (transaction.value > value)
                isValid = true
            break;
        case "lte":
            if (transaction.value <= value)
                isValid = true
            break;
        case "gte":
            if (transaction.value >= value)
                isValid = true
            break;
    }

    if (!isValid)
        throw new Error("Incorrect Transaction")

    return { result: true };
}

export const processContractData = async (client: PublicClient,
    payload: SubmissionBody,
    submission: ContractData,
    opts: SubmissionOpt = defaultOpts): Promise<SubmissionReceipt> => {
    const data = await client.readContract({
        address: submission.contract as `0x${string}`,
        abi: submission.abi,
        functionName: submission.variable,
        args: submission.args || [],
    })

    const contractData = generateDataHashFromContract(data);

    if (payload.transactionHash !== contractData) {
        throw new Error("Incorrect Data")
    }
    return { result: true };
}

function arraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;
    
    for (let i = 0; i < arr1.length; i++) {
        // "_" meaning we can skip
        if (arr1[i].toString() === '_') {
            continue;
        }

        if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
            if (!arraysEqual(arr1[i], arr2[i])) return false;
        } else if (typeof arr2[i] === "bigint") {
            if (arr1[i] !== arr2[i].toString()) return false;
        } else if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}