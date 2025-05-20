import express = require("express");
import type { Request, Response } from "express";
// @ts-ignore
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { fetchConfluencePageContent } from "./confluenceClient";
import { z } from "zod";               // + ajout

const app = express();
app.use(express.json());

// MCP server instance
const mcpServer = new McpServer({
  name: "Confluence MCP Server",
  version: "1.0.0"
});

mcpServer.tool(
  "confluence-page",                   // nom du tool
  { id: z.string() },                  // schéma des paramètres
  async ({ id }) => {
    try {
      const content = await fetchConfluencePageContent(id);
      return {
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `Erreur lors de la récupération de la page Confluence : ${err.message}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// ==============================
// Transports SSE en cours
// ==============================
const transports: Record<string, SSEServerTransport> = {};

// --------------------------------------------------------------------
// Établissement du flux SSE (GET /mcp)
// --------------------------------------------------------------------
app.get("/mcp", async (req: Request, res: Response) => {
  // Le client utilisera ensuite POST /messages?sessionId=xxx
  const transport = new SSEServerTransport("/messages", res);
  const sessionId = transport.sessionId;
  transports[sessionId] = transport;

  // Nettoyage si le client ferme le flux
  transport.onclose = () => {
    delete transports[sessionId];
  };

  // Démarre le transport et connecte le serveur MCP
  const server = mcpServer;
  await server.connect(transport); // connect() appelle start() du transport
});

// --------------------------------------------------------------------
// Réception des messages JSON-RPC du client (POST /messages)
// --------------------------------------------------------------------
app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string | undefined;
  const transport = sessionId ? transports[sessionId] : undefined;

  if (!transport) {
    res.status(400).send("Session inconnue ou absente");
    return;
  }

  // Le corps JSON est déjà parsé par express.json()
  await transport.handlePostMessage(req, res, req.body);
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`MCP server running on port ${port}`);
});
