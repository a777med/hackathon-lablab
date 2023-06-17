import { AgentExecutor, initializeAgentExecutorWithOptions } from "langchain/agents";
import { Tool } from "langchain/tools";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import { Configuration } from "openai";
import { OpenAIApi } from "openai";
import { vectorStoreTool } from "./tools/vectorestoreQA.ts";
import { reportIssuesTool } from "./tools/reportIssues.ts";
import { searchServicesTool } from "./tools/searchServices.ts";
import { bookServicesTool } from "./tools/bookServices.ts";
import { getFoodMenuTool, searchFoodMenuTool } from "./tools/searchFoodMenuTool.ts";
import { UpstashRedisChatMessageHistory } from "langchain/stores/message/upstash_redis";
import { orderFoodTool } from "./tools/orderFood.ts";

const openAIApiKey = process.env.OPENAI_API_KEY!;

const params = {
  temperature: 0,
  openAIApiKey,
  modelName: "gpt-3.5-turbo-16k",
  maxConcurrency: 1,
  maxTokens: 1000,
  maxRetries: 5,
};

export class Model {
  public tools: Tool[];

  public executors: {
    [sessionId: string]: AgentExecutor;
  };

  public openai: OpenAIApi;

  public model: ChatOpenAI;

  constructor() {
    const configuration = new Configuration({
      apiKey: openAIApiKey,
    });

    this.tools = [
      vectorStoreTool,
      searchServicesTool,
      reportIssuesTool,
      bookServicesTool,
      getFoodMenuTool,
      orderFoodTool,
      searchFoodMenuTool,
    ];
    this.openai = new OpenAIApi(configuration);
    this.model = new ChatOpenAI(params, configuration);

    this.executors = {};
  }

  public async call(input: string, sessionId: string) {
    if (!this.executors[sessionId]) {
      this.executors[sessionId] = await initializeAgentExecutorWithOptions(
        this.tools,
        this.model,
        {
          agentType: 'chat-conversational-react-description',
          memory : new BufferMemory({
            returnMessages: true,
            memoryKey: "chat_history",
            inputKey: "input",
            chatHistory: new UpstashRedisChatMessageHistory({
              sessionId, // Or some other unique identifier for the conversation
              // sessionTTL: 300, // 5 minutes, omit this parameter to make sessions never expire
              config: {
                url: process.env.UPSTASH_URL as string, 
                token: process.env.UPSTASH_TOKEN as string, 
              },
            })
          }),
          agentArgs: {
            systemMessage: `I want you to act as Karam, a caring concierge support staff for the Hotel Royal Oasis in Riyadh. A guest who\'s staying in one of our rooms is going to ask you questions. Please, ask for the guest\'s name and room number before booking or reporting an issue. the current date-time is ${new Date()}. When you want to include image in your response for food menu items, wrap the image URL in underscores.`,
          },
          verbose: true,
        }
      );
    }
    const response = await this.executors[sessionId].call({ input });

    console.log(`Model input: ${  input}`);
    console.log(`Model response: ${  response.output}`);

    return response.output;
  }

  public async clearChatHistory(sessionId: string) {
    // await this.executors[sessionId].agent.plan()
    const chatHistory = new UpstashRedisChatMessageHistory({
      sessionId, 
      config: {
        url: process.env.UPSTASH_URL as string, 
        token: process.env.UPSTASH_TOKEN as string, 
      },
    });
    chatHistory.clear();
  }
}
