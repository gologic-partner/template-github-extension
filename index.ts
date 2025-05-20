import express from "express";
import { fetchConfluencePageContent } from "./confluenceClient";

const app = express();
app.use(express.json());

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("This is a GitHub Copilot Extension that can retrieve a confluence page");
});

app.get("/callback", ((req, res) => {
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("Authentication failed");
  }

  if (!code) {
    console.error("No code received");
    return res.status(400).send("No code received");
  }

  // Handle the authentication code here
  console.log("Received authentication code:", code);
  res.send("Authentication successful! You can close this window.");
}) as express.RequestHandler);

app.post("/", express.json(), async (req: express.Request, res: express.Response) => {
  // Identify the user, using the GitHub API token provided in the request headers.
  const tokenForUser = req.get("X-GitHub-Token");
  // @ts-ignore
  const { Octokit } = await import("@octokit/core");
  const octokit = new Octokit({ auth: tokenForUser });
  const user = await octokit.request("GET /user");
  console.log("User:", user.data.login);

  // Parse the request payload and log it.
  const payload = req.body;
  console.log("Payload:", payload);

  // Récupérer le pageId à partir du dernier message utilisateur
  let pageId: number | null = null;
  if (Array.isArray(payload.messages) && payload.messages.length > 0) {
    const lastMessage = payload.messages[payload.messages.length - 1];
    if (lastMessage && typeof lastMessage.content === "string") {
      // Extraire le premier entier trouvé dans le contenu du message
      const match = lastMessage.content.match(/\d+/);
      if (match) {
        pageId = parseInt(match[0], 10);
      }
    }
  }
  console.log("Page ID:", pageId);
  let confluenceContent = "";
  if (pageId) {
    try {
      confluenceContent = await fetchConfluencePageContent(pageId.toString());
    } catch (err: any) {
      console.error("Erreur Confluence:", err.message);
      res.status(400).json({ error: `Erreur lors de la récupération de la page Confluence: ${err.message}` });
      return;
    }
  }

  // Insérer le message système avec le contenu Confluence (si disponible)
  const messages = payload.messages;
  let systemContent = "You are a helpful assistant that sumarize the content of a Confluence page. You can also answer questions about the content of the page.";
  if (confluenceContent) {
    systemContent += `\n\nHere is the content of the Confluence page:\n${confluenceContent}`;
  }
  messages.unshift({
    role: "system",
    content: systemContent,
  });

  // Use Copilot's LLM to generate a response to the user's messages, with
  // our extra system messages attached.
  const copilotLLMResponse = await fetch(
    "https://api.githubcopilot.com/chat/completions",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${tokenForUser}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messages,
        stream: true,
      }),
    }
  );

  // Stream the response straight back to the user.
  // @ts-ignore
  const { Readable } = await import("node:stream");
  Readable.from(copilotLLMResponse.body as any).pipe(res);
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
