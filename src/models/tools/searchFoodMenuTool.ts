import { DynamicTool } from "langchain/tools";
import qs from "qs";
import { Api } from "@/types/Api.ts";

export const getFoodMenuTool = new DynamicTool({
  name: "get food menu",
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

export const searchFoodMenuTool = new DynamicTool({
  name: "search food menu",
  description:
    "a function to search the food menu items to get the IDs and details. Input is a string of the food item name",
  func: async (input: string) => {
    try {
      const query = qs.stringify({
        filters: {
          $or: [
            {
              dishname: {
                '$containsi': input,
              },
            },
            {
              ingredients: {
                '$containsi': input,
              },
            },
          ]
        }
      });
  
      const resp = await fetch(`https://determined-boot-55a0a0a0d0.strapiapp.com/api/in-room-dining-food-menus?${query}`, {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
          accept: "application/json",
        },
      });
      const data = await resp.json();
  
      console.log('food search data', data);
  
      return JSON.stringify(data);
    } catch (e) {
      console.error("strapi caught error", e);
      return "No search result found with the given input, please try a different input.";
    }
  },
});
