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

server.tool(
  "search",
  "Hent søkeresultat",
  {
    search: z.string().describe('Søkeordet brukeren vil søke på'),
  },
  async ({ search }) => {
    const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=${search}`;
    const searchData = await makeRequest(searchUrl);

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