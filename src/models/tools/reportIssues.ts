import { Api } from "@/types/Api.ts";
import { DynamicTool } from "langchain/tools";

export const reportIssuesTool = new DynamicTool({
  name: "report an issue",
  description: `A function to report an issue to the hotel staff. The guest's room number must be known before calling this function. The input is a JSON string matching the following schema \`\`\`typescript
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
            Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
            accept: "application/json",
          },
        },
      });
      console.log("input 32", input);
      const parsedInput = JSON.parse(input);

      if (!parsedInput.room_number) {
        return "Please provide a room number in the JSON object input. Ask the user for the room number and then call this function again.";
      }

      await api.issuesReports.postIssuesReports({
        data: {
          ...parsedInput,
          roomnumber: parsedInput.room_number,
        },
      });

      return "Issue reported successfully";
    } catch (e) {
      console.error("strapi caught error while reporting an issue", e);
      return "An error occured while reporting an issue";
    }
  },
});
