import * as dotenv from "dotenv";
import { getOrders } from "./agent.ts";
import { queryDoc, storeDoc } from "./manage-docs.ts";

dotenv.config();

getOrders();

await storeDoc();

await queryDoc([
  "What does the pdf talk about?",
  "what is the main cause for inflation?",
]);