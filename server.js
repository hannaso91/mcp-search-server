import { createServer, defineFunction } from '@modelcontextprotocol/sdk';
import { z } from 'zod';
import fetch from 'node-fetch';

const searchBrave = defineFunction({
  name: 'searchBrave',
  description: 'Søk etter informasjon via Brave search API',
  inputSchema: z.object({
    q: z.string().describe('Søkeordet brukeren vil søke på')
  }),
  outputSchema: z.object({
    resultater: z.array(
      z.object({
        tittel: z.string(),
        lenke: z.string(),
        beskrivelse: z.string()
      })
    )
  }),
  handler: async ({q}) => {
    const params = new URLSearchParams({q})

    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': 'BSAywgQshX3Hr_uSmrMbevOf7RTkVrj'
      }
    });

    const data = await response.json()

    const resultater = data.web?.results?.map(r => ({
      tittel: r.title,
      lenke: r.url,
      beskrivelse: r.description
    })) || []

    return {resultater}
  }
})

createServer({
  functions: [searchBrave]
}).listen(3000, () => {
  console.log(`MCP-server kjører på localhost:3000`)
})
