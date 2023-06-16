import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pinecone } from "./pinecone-client.js";


const filePath = "docs/april-2023.pdf";


export const uploadDoc = async () => {
    const loader = new PDFLoader(filePath);
    const rawDocs = await loader.load();

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME || "");

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);

    console.log("creating vector store...");
    /*create and store the embeddings in the vectorStore*/
    const vectorStore = await PineconeStore.fromDocuments(
      docs,
      new OpenAIEmbeddings(),
      {
        pineconeIndex,
      }
    );

    // Initialize the LLM to use to answer the question.
    const model = new OpenAI({
      modelName: "gpt-3.5-turbo-16k",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Create a chain that uses the OpenAI LLM and pinecone vector store.
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
    const res = await chain.call({
      query: "What does the pdf talk about?",
    });
    console.log({ res });

    const res2 = await chain.call({
      query: "what is the main cause for inflation?",
    });
    console.log({ res2 });
};
