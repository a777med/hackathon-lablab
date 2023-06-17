import { Api } from "@/types/Api.ts";
import { DynamicTool } from "langchain/tools";

export const searchFoodMenuTool = new DynamicTool({
  name: "search food menu",
  description:
    "a function to look up the currently available food menu items in the hotel.",
  func: async () => {
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
      const resp = await api.inRoomDiningFoodMenus.getInRoomDiningFoodMenus();

      return JSON.stringify(resp.data);
    } catch (e) {
      console.error("strapi caught error", e);
      return "No good search result found";
    }
  },
});
