import { pineconeIndex } from "@/pinecone-client.ts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { VectorStoreQATool } from "langchain/tools";
import { PineconeStore } from "langchain/vectorstores/pinecone";

const llm = new ChatOpenAI({temperature: 0});
const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex, namespace: "food-menu-test" }
);
export const vectorStoreTool = new VectorStoreQATool(
  "Vector Store QA Tool",
  "This is Vectore Store. Use this tool to search general information about the hotel. Input should be a string",
  {
    vectorStore,
    llm
  });

