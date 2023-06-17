import * as dotenv from "dotenv";
import { storeDoc } from "./manage-docs.ts";
import { Telegraf } from "telegraf";
import { Model as ChatWithTools } from "./models/chatWithTools.ts";
import { existsSync, mkdirSync } from "fs";
import { downloadVoiceFile } from "./lib/downloadVoiceFile.ts";
import { postToWhisper } from "./lib/postToWhisper.ts";

dotenv.config();

// TODO: expose endpoint to store pdf in pinecone
// a possible solution to the problem of deleting pdfs from pinecone
// is to store the pdfs with their name as the namespace
// await storeDoc(new PDFLoader("docs/Hotel Name_ Royal Oasis Riyadh Description.pdf"), "royal-oasis-hotel");


// TODO: study removal, this will probably be replaced by the telegram bot 
// await queryDoc([
//   "What does the pdf talk about?",
//   "what is the main cause for inflation?",
// ], "test-namespace");


const workDir = "./tmp";
const telegramToken = process.env.TELEGRAM_TOKEN as string;

const bot = new Telegraf(telegramToken);
const model = new ChatWithTools();

if (!existsSync(workDir)) {
  mkdirSync(workDir);
}

bot.start((ctx) => {
  console.log("started:", ctx.from?.id);
 });

bot.command('clear', async (ctx) => {
  await model.clearChatHistory(ctx.chat.id.toString());
  await ctx.reply('Chat history cleared');
});

bot.help((ctx) => {
  ctx.reply("Send me a message and I will echo it back to you.");
});


bot.on("voice", async (ctx) => {

  const voice = ctx.message.voice;
  await ctx.sendChatAction("typing");

  let localFilePath;

  try {
    localFilePath = await downloadVoiceFile(workDir, voice.file_id, bot);
  } catch (error) {
    console.log(error);
    await ctx.reply(
      "Whoops! There was an error while downloading the voice file. Maybe ffmpeg is not installed?"
    );
    return;
  }

  const transcription = await postToWhisper(model.openai, localFilePath);

  await ctx.reply(`Transcription: ${transcription}`);
  await ctx.sendChatAction("typing");

  let response;
  try {
    response = await model.call(transcription, ctx.chat.id.toString());
  } catch (error) {
    console.log(error);
    await ctx.reply(
      "Whoops! There was an error while talking to OpenAI. See logs for details."
    );
    return;
  }

  console.log(response);

  await ctx.reply(response);
});

bot.on("message", async (ctx) => {
  const {text} = ctx.message as any;

  if (!text) {
    ctx.reply("Please send a text message.");
    return;
  }

  console.log("Input: ", text);

  await ctx.sendChatAction("typing");
  try {
    const response = await model.call(text, ctx.chat.id.toString());
    console.log('chat id: ', ctx.chat.id.toString());
    await ctx.reply(response);
  } catch (error) {
    console.log(error);

    const message = JSON.stringify(
      (error as any)?.response?.data?.error ?? "Unable to extract error"
    );

    console.log({ message });

    await ctx.reply(
      `Whoops! There was an error while talking to OpenAI. Error: ${  message}`
    );
  }
});


bot.launch().then(() => {
  console.log("Bot launched");
});

process.on("SIGTERM", () => {
  bot.stop();
});
