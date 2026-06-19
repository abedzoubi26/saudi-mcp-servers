import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { ZatcaClient } from "./client.js";
import { registerTools } from "./tools/register.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const client = new ZatcaClient(config);

  const server = new McpServer({
    name: "saudi-mcp-zatca",
    version: "0.1.0",
  });

  registerTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(
    `saudi-mcp-zatca ready${config.mock ? " (MOCK mode)" : ` (${config.environment})`}.`,
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
