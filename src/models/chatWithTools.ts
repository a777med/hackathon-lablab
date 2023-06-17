import { AgentExecutor, initializeAgentExecutorWithOptions } from "langchain/agents";
import { DynamicTool, Tool } from "langchain/tools";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import { Configuration } from "openai";
import { OpenAIApi } from "openai";
import { vectorStoreTool } from "./tools/vectorestoreQA.ts";
import { Api } from "@/types/Api.ts";

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
      new DynamicTool({
        name: 'search hotel services',
        description: 'a function to look up the currently available services in the hotel.',
        func: async () => {
          try {
            const api = new Api({
              baseUrl: `https://determined-boot-55a0a0a0d0.strapiapp.com/api`,
              baseApiParams: {
                headers: {
                  'Authorization': `Bearer ${process.env.STRAPI_API_KEY}`,
                  'accept': 'application/json',
                }
              }
            });
            const resp = await api.services.getServices();

            return JSON.stringify(resp.data);
          } catch (e) {
            console.error('strapi caught error', e);
            return "No good search result found";
          }
        }
      }),
      new DynamicTool({
        name: 'report an issue',
        description: `A function to report an issue to the hotel staff. The guest's room number should be known before calling this function. The input is a JSON string matching the following schema \`\`\`typescript
          roomn_number: number;
          title?: string;
          status?: "Active" | "Fixing" | "Solved";
          resolutiontime?: number;
          department?: "Housekeeping" | "Engineering" | "IT" | "Fooddepartment";
          description?: string;
        \`\`\`.`,
        func: async (input) => {
          try {
            const api = new Api({
              baseUrl: `https://determined-boot-55a0a0a0d0.strapiapp.com/api`,
              baseApiParams: {
                headers: {
                  'Authorization': `Bearer ${process.env.STRAPI_API_KEY}`,
                  'accept': 'application/json',
                }
              }
            });
            console.log('input 32', input);
            const parsedInput = JSON.parse(input);

            if (!parsedInput.room_number) {
              return "Please provide a room number in the JSON object input. Ask the user for the room number and then call this function again.";
            }

            const resp = await api.issuesReports.postIssuesReports({
              data: {
                ...parsedInput,
                roomnumber: parsedInput.room_number,
              }
            });

            return "Issue reported successfully";
          } catch (e) {
            console.error('strapi caught error while reporting an issue', e);
            return "An error occured while reporting an issue";
          }
        }
      }),
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
            systemMessage: "You are a hotel concierge. A guest who\'s staying in one of our rooms is going to ask you questions. Please, ask for the guest\'s name and room number before booking or reporting an issue."
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
