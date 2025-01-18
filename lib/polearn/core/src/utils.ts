export const isJSON = (value: any) => {
    try {
        JSON.parse(value);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * Removes the metadata appended to a smart contract's bytecode, 
 * typically used for storing IPFS hashes or other metadata.
 * This can change from contract to contract, hence remove to avoid 
 * different contract bytecode
 */
export const removeMetadata = (bytecode: `0x${string}`): `0x${string}` => {
    const metadataMarker = "a2646970667358";        // hex of "ipfs"
    const lastIndex = bytecode.lastIndexOf(metadataMarker);
    if (lastIndex !== -1) {
        return bytecode.slice(0, lastIndex) as `0x${string}`;
    }
    return bytecode;
};

/**
 * Replaces Ethereum addresses in the bytecode with a placeholder.
 * Ethereum addresses can vary between deployments, causing differences in bytecode.
 * Replacing these addresses with placeholders allows for uniformity during comparisons.
 *
 */
export const replaceAddresses = (bytecode: `0x${string}`) => {
    // Regular expression to match 12 zero bytes followed by 20 non-zero bytes (Ethereum addresses)
    const addressPattern = /7f000000000000000000000000([a-fA-F0-9]{40})/g;

    // Replace matched addresses with the placeholder
    const replacedBytecode = bytecode.replace(addressPattern, 'PUSH32_ADDRESS_PLACEHOLDER');

    return replacedBytecode as `0x${string}`;
}

/**
 * Replaces PUSH32 data in the bytecode with a placeholder.
 * PUSH32 data can include dynamic values, making bytecode comparisons inconsistent.
 * Replacing PUSH32 data with placeholders ensures consistency for testing or analysis.
 */
export const replacePushData = (bytecode: `0x${string}`) => {
    // Regular expression to match 12 zero bytes followed by 20 non-zero bytes (Ethereum addresses)
    const addressPattern = /7f[a-fA-F0-9]{64}/g

    // Replace matched addresses with the placeholder
    const replacedBytecode = bytecode.replace(addressPattern, 'PUSH32_DATA');

    return replacedBytecode as `0x${string}`;
}

export const cleanBytecode = (bytecode: `0x${string}`) => {
    bytecode = removeMetadata(bytecode)
    bytecode = replaceAddresses(bytecode)
    bytecode = replacePushData(bytecode)
    return bytecode
}