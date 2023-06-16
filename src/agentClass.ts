import { Tool } from "langchain/tools";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { BufferMemory } from "langchain/memory";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { Configuration } from "openai";
import { OpenAIApi } from "openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { pineconeIndex } from "./pinecone-client.ts";

const namespace = "food-menu-test";

const question = `
You are a hotel concierge. Below between the line seperators is our SOP document. Please answer the following questions based on the SOP document. Below the document the guest who's staying in one of our rooms is going to ask you a question. 
----------------
Procedure AI agent food ordering

Greeting and Introduction:

Start the conversation by greeting the guest politely and introducing yourself as the hotel's AI order-taking agent.

Menu Familiarization:

Provide the guest with a link or attachment to the digital version of the in-room dining menu.

Offer assistance in navigating the menu, highlighting popular items, and providing brief descriptions upon request.

Answer any menu-related queries from the guest promptly and accurately.

Inquiry and Recommendations:

Ask the guest if they have any specific dietary preferences, restrictions, or allergies.

Based on the guest's preferences, make appropriate recommendations, considering popular dishes, dietary restrictions, or chef's specialties.

Provide detailed information about ingredients, spiciness levels, and allergens to ensure the guest can make an informed choice.


Order Placement:

Encourage the guest to specify their desired items by mentioning the dish's name, item number, or providing a brief description.
Confirm the guest's selections by repeating their order back to them.
Offer any optional extras or side dishes that complement the selected items.
Record the order accurately, including special requests, customization, and any dietary considerations.
Try to upsell a dessert if they haven’t ordered one.

Confirmation and Details:

Provide the guest with an estimated time for food preparation and delivery.
Confirm the guest's room number, name, and contact details (if necessary).
Reiterate any special requests or dietary considerations to ensure they are correctly noted.
Confirm the total amount payable and provide details for payment (if applicable).



Closing and Farewell:

Thank the guest for their order and express gratitude for choosing the hotel's in-room dining service.

Inform the guest that their order has been successfully placed and will be delivered to their room shortly.

Offer assistance or address any additional questions or concerns the guest may have.
End the conversation with a polite farewell and well wishes.

Post-Order Follow-up:

Maintain communication with the guest, providing updates if there are any delays or changes to their order.
Monitor the progress of the order and coordinate with the kitchen and delivery staff to ensure timely delivery.
----------------
`;


export class QaDocModel {
  public tools: Tool[] = [];
  
  public chain: ConversationalRetrievalQAChain;

  public openai: OpenAIApi;

  constructor() {
  }

  public async init() {
    const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings(),
        { pineconeIndex, namespace }
    );

    // const configuration = new Configuration({
    //     apiKey: openAIApiKey,
    //   });
  
    //   this.openai = new OpenAIApi(configuration);
      const model = new ChatOpenAI({
        modelName: "gpt-3.5-turbo-16k",
        openAIApiKey: process.env.OPENAI_API_KEY,
        });
  
    //   const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    //     SystemMessagePromptTemplate.fromTemplate(
    //       question
    //     ),
    //     // new MessagesPlaceholder("history"),
    //     HumanMessagePromptTemplate.fromTemplate("{question}"),
    //   ]);

    this.chain = ConversationalRetrievalQAChain.fromLLM(
        model,
        vectorStore.asRetriever(),
        {
            memory: new BufferMemory({
            memoryKey: "chat_history", // Must be set to "chat_history"
            }),
            // qaChainOptions: {
            //     // prompt: chatPrompt,
            //     type: 'stuff',
            //     verbose: true,
            // }
            // qaChainOptions: {
            //   questionPrompt
            // }
        }
        );    
    }

  public async call(input: string) {
    const output = await this.chain.call({ question: input });
    console.log('output', output)
    return output.text;
  }
}
