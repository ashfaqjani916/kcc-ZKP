import { ThirdwebStorage } from "@thirdweb-dev/storage";

// Initialize storage
const storage = new ThirdwebStorage({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT, // Get from thirdweb dashboard
});

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const uri = await storage.upload(file);
    const ipfsHash = uri.replace("ipfs://", "");
    console.log("Uploaded to IPFS:", ipfsHash);
    return ipfsHash;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
};

export const uploadMultipleToIPFS = async (files: File[]): Promise<string[]> => {
  try {
    const uris = await storage.uploadBatch(files);
    const ipfsHashes = uris.map((uri) => uri.replace("ipfs://", ""));
    return ipfsHashes;
  } catch (error) {
    console.error("Error uploading batch to IPFS:", error);
    throw error;
  }
};

export const getIPFSUrl = (hash: string): string => {
  return `https://ipfs.io/ipfs/${hash}`;
  // OR use thirdweb gateway
  // return storage.resolveScheme(`ipfs://${hash}`);
};
