import { Api } from "@/types/Api.ts";
import { DynamicTool } from "langchain/tools";

export const reportIssuesTool = new DynamicTool({
  name: "report an issue",
  description: `useful for reporting an issue to the hotel staff. The input is a JSON string matching the following schema \`\`\`
          roomnumber: number;
          title?: string;
          status?: "Active" | "Fixing" | "Solved";
          resolutiontime?: number;
          department?: "Housekeeping" | "Engineering" | "IT" | "Fooddepartment";
          description?: string;
        \`\`\`.
        make sure you get the room number from the user.
        `,
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

      if (!parsedInput.roomnumber) {
        return "Ask the user for the room number and then call this function again.";
      }

      await api.issuesReports.postIssuesReports({
        data: {
          ...parsedInput,
        },
      });

      return "Issue reported successfully";
    } catch (e) {
      console.error("strapi caught error while reporting an issue", e);
      return "An error occured while reporting an issue";
    }
  },
});
