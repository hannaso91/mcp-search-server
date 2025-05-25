import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "search",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});


async function makeRequest(url) {
  const headers = {
        'Accept': 'application/json',
        'X-Subscription-Token': 'BSAywgQshX3Hr_uSmrMbevOf7RTkVrj'
    };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json());
  } catch (error) {
    console.error("Error making request:", error);
    return null;
  }
}

// interface SearchFeature {
//   properties : {
//     tittel: string;
//     lenke: string;
//     beskrivelse: string;
//   }
// }


// interface SearchResponse {
//   features: SearchFeature[];
// }

// const searchBrave = defineFunction({
//   name: 'searchBrave',
//   description: 'Søk etter informasjon via Brave search API',
//   inputSchema: z.object({
//     q: z.string().describe('Søkeordet brukeren vil søke på')
//   }),
//   outputSchema: z.object({
//     resultater: z.array(
//       z.object({
//         tittel: z.string(),
//         lenke: z.string(),
//         beskrivelse: z.string()
//       })
//     )
//   }),
//   handler: async ({q}) => {
//     const params = new URLSearchParams({q})

//     const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
//       headers: {
//         'Accept': 'application/json',
//         'X-Subscription-Token': 'BSAywgQshX3Hr_uSmrMbevOf7RTkVrj'
//       }
//     });

//     const data = await response.json()

//     const resultater = data.web?.results?.map(r => ({
//       tittel: r.title,
//       lenke: r.url,
//       beskrivelse: r.description
//     })) || []

//     return {resultater}
//   }
// })

// createServer({
//   functions: [searchBrave]
// }).listen(3000, () => {
//   console.log(`MCP-server kjører på localhost:3000`)
// })

// Register weather tools
server.tool(
  "search",
  "Hent søkeresultat",
  {
    search: z.string().describe('Søkeordet brukeren vil søke på'),
  },
  async ({ search }) => {
    const alertsUrl = `https://api.search.brave.com/res/v1/web/search?q=${search}`;
    const searchData = await makeRequest(alertsUrl);

    if (!searchData || !searchData.web || !Array.isArray(searchData.web.results)) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve search data",
          },
        ],
      };
    }

    const features = searchData || [];
    if (features.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No data`,
          },
        ],
      };
    }

    const results = searchData.web.results
  
    const formattedResults = results.map((item, index) =>
      `${index + 1}. ${item.title}\n${item.url}\n${item.description || ""}`
    ).join("\n\n");

    const searchText = `Resultater for '${search}':\n\n${formattedResults}`;

    return {
      content: [
        {
          type: "text",
          text: searchText,
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Search MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});