import * as dotenv from "dotenv";
import { Telegraf } from "telegraf";
import { Model as ChatWithTools } from "./models/chatWithTools.ts";

dotenv.config();


// TODO: expose endpoint to store pdf in pinecone
// a possible solution to the problem of deleting pdfs from pinecone
// is to store the pdfs with their name as the namespace
// await storeDoc(new PDFLoader("docs/april-2023.pdf"), "test-namespace");


// TODO: study removal, this will probably be replaced by the telegram bot 
// await queryDoc([
//   "What does the pdf talk about?",
//   "what is the main cause for inflation?",
// ], "test-namespace");


const telegramToken = process.env.TELEGRAM_TOKEN!;

const bot = new Telegraf(telegramToken);
const model = new ChatWithTools();

bot.start((ctx) => {
  console.log("started:", ctx.from?.id);
});

bot.help((ctx) => {
  ctx.reply("Send me a message and I will echo it back to you.");
});

bot.on("message", async (ctx) => {
  const text = (ctx.message as any).text;

  if (!text) {
    ctx.reply("Please send a text message.");
    return;
  }

  console.log("Input: ", text);

  await ctx.sendChatAction("typing");
  try {
    const response = await model.call(text);

    await ctx.reply(response);
  } catch (error) {
    console.log(error);

    const message = JSON.stringify(
      (error as any)?.response?.data?.error ?? "Unable to extract error"
    );

    console.log({ message });

    await ctx.reply(
      "Whoops! There was an error while talking to OpenAI. Error: " + message
    );
  }
});


bot.launch().then(() => {
  console.log("Bot launched");
});

process.on("SIGTERM", () => {
  bot.stop();
});
