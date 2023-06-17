import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pineconeIndex } from "./pinecone-client.js";

// TODO: accept filePath as an argument
export const storeDoc = async (loader: any, namespace: string) => {
  if (!loader) {
    throw new Error("loader is required");
  }
  const rawDocs = await loader.load();

  /* Split text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await textSplitter.splitDocuments(rawDocs);

  console.log("creating vector store...");
  /*create and store the embeddings in the vectorStore*/
  await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
    pineconeIndex,
    namespace
  });
};


export const queryDoc = async (questions: string[], namespace: string) => {
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex, namespace }
  );

  // Initialize the LLM to use to answer the question.
  const model = new OpenAI({
    modelName: "gpt-3.5-turbo-16k",
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Create a chain that uses the OpenAI LLM and pinecone vector store.
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
  for (const question of questions) {
    const res = await chain.call({ query: question });
    console.log({ question });
    console.log({ res });
  }
};
