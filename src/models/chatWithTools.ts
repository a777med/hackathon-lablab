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

const openAIApiKey = process.env.OPENAI_API_KEY!;

const params = {
  verbose: true,
  temperature: 0,
  openAIApiKey,
  modelName: "gpt-3.5-turbo-16k",
  maxConcurrency: 1,
  maxTokens: 1000,
  maxRetries: 5,
};

export class Model {
  public tools: Tool[];
  public executor?: AgentExecutor;
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
      bookServicesTool
    ];
    this.openai = new OpenAIApi(configuration);
    this.model = new ChatOpenAI(params, configuration);
  }

  public async call(input: string) {
    if (!this.executor) {
      this.executor = await initializeAgentExecutorWithOptions(
        this.tools,
        this.model,
        {
          agentType: 'chat-conversational-react-description',
          memory : new BufferMemory({
            returnMessages: true,
            memoryKey: "chat_history",
            inputKey: "input",
          }),
          agentArgs: {
            systemMessage: `You are a hotel concierge. A guest who\'s staying in one of our rooms is going to ask you questions. Please, ask for the guest\'s name and room number before booking or reporting an issue. the current date-time is ${new Date()}.`
          }
        }
      );
    }

    const response = await this.executor!.call({ input });

    console.log("Model input: " + input);
    console.log("Model response: " + response.output);

    return response.output;
  }
}
