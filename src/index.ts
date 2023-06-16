import * as dotenv from "dotenv";
import { getOrders } from "./agent.ts";
import { queryDoc, storeDoc } from "./manage-docs.ts";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

dotenv.config();

getOrders();

await storeDoc(new PDFLoader("docs/april-2023.pdf"), "test-namespace");

await queryDoc([
  "What does the pdf talk about?",
  "what is the main cause for inflation?",
], "test-namespace");