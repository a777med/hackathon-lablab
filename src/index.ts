import * as dotenv from "dotenv";
import { getOrders } from "./agent.ts";
import { uploadDoc } from "./manage-docs.ts";

dotenv.config();

getOrders();

uploadDoc();