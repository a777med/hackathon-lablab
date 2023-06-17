import { Tool } from "langchain/tools";
import { Api, ServiceListResponse } from "@/types/Api.ts";


type UrlParameters = Record<
  string,
  string | number | boolean | undefined | null
>;

/**
 * Wrapper around SerpAPI.
 *
 * To use, you should have the `serpapi` package installed and the SERPAPI_API_KEY environment variable set.
 */
export class StrapiTool extends Tool {
  toJSON(): any {
      return this.toJSONNotImplemented();
  }

  protected key: string;

//   protected params: Partial<SerpAPIParameters>;

//   protected baseUrl: string;

//   constructor(
//     // apiKey: string | undefined = getEnvironmentVariable("SERPAPI_API_KEY"),
//     params: Partial<SerpAPIParameters> = {},
//     baseUrl = "https://serpapi.com"
//   ) {
//     super(...arguments);

//     // this.key = apiKey;
//     this.params = params;
//     this.baseUrl = baseUrl;
//   }

  name = "search hotel services"; 

  /** @ignore */
  async _call(input: string) {
    // const { timeout, ...params } = this.params;
    // const resp = await fetch(
    //   this.buildUrl(
    //     "search",
    //     {
    //       ...params,
    //       api_key: this.key,
    //       q: input,
    //     },
    //     this.baseUrl
    //   ),
    //   {
    //     signal: timeout ? AbortSignal.timeout(timeout) : undefined,
    //   }
    // );
    try {
      const api = new Api({
        baseUrl: `https://determined-boot-55a0a0a0d0.strapiapp.com/api`,
        baseApiParams: {
          headers: {
            'Authorization': `Bearer e9a6bf8cfd2b4d799cba75db0a66c5a62d931d3114e48d45fe9af0095173b75b9950fe97e69e0ea024ca134fd04238d8a4687466722ec8eca9bbf9731beabce302c3d6e6ff4153127e93e47112eb7bfb954ab4d4df2e57ab07b4e3a98b51035a164909545e3018481bec078c98f4f00b7fdb2c7e349d82e947b6f08564477495`,
            'accept': 'application/json',
          }
        }
      });
      const resp = await api.services.getServices();

      // const res: ServiceListResponse = await resp.json();

      // if (!res.data) {
      //     console.error('strapi error', res);
      //   throw new Error(`Got error from strapi API`);
      // }

      // return JSON.stringify(res.data);


      // console.log('strapi resp', resp);
      // const text = await resp.text();
      // return text;

      return JSON.stringify(resp.data);

      return "No good search result found";
    } catch (e) {
      console.error('strapi caught error', e);
      return "No good search result found";
    }
  }

  description =
    "a function to look up the currently available services in the hotel.";
}
