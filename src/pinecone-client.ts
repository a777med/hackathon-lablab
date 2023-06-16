import { PineconeClient } from "@pinecone-database/pinecone";

const client = new PineconeClient();
await client.init({
  apiKey: process.env.PINECONE_API_KEY || "",
  environment: process.env.PINECONE_ENVIRONMENT || "",
});

export const pinecone = client;
export const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME || "");