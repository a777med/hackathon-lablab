import { Api } from "@/types/Api.ts";
import { DynamicTool } from "langchain/tools";

export const bookServicesTool = new DynamicTool({
  name: "order a service",
  // TODO: update description to always have the room number, datetime, and service from user input
  //  at the moment the model creates mostly a random room number and datetime
  description: `useful for booking a service from the available hotel services. input is a JSON string matching the following schema \`\`\`typescript
            room_number: string;
            datetime: string;
            pax?: number;
            special_note?: string;
            service: number;
        \`\`\`.
        if you don't have room_number, datetime, and service, ask the user for them. format the datetime as a string in the format \`YYYY-MM-DD HH:MM:SS\``,
  func: async (input) => {
    try {
      const api = new Api({
        baseUrl: `https://determined-boot-55a0a0a0d0.strapiapp.com/api`,
        baseApiParams: {
          headers: {
            Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
            accept: "application/json",
          },
        },
      });
      console.log("input 32", input);
      const parsedInput = JSON.parse(input);

      if (!parsedInput.room_number) {
        return "Ask the user for the room number and then call this function again.";
      }

      await api.serviceOrders.postServiceOrders({
        data: {
          ...parsedInput,
          service: parsedInput.service_id,
        },
      });

      return "service booked successfully";
    } catch (e) {
      console.error("strapi caught error while booking a service", e);
      console.log('error' + e);
      return "An error occured while booking a service" + e;
    }
  },
});
