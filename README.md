# confluenceze-extension

This extension provides an example of integrating a GitHub Copilot Extension with Confluence. It retrieves the content of a Confluence page and summarizes it or answers questions about it using Copilot's LLM API. The repository demonstrates the building blocks of a Copilot Extension with external API integration. See [index.js](/index.js) for the main logic.

## Development

Install dependencies:

```bash
npm install
```

To run:

```bash
npm start
```

To run the mcp server:

```bash
npm start:mcp
```

## Documentation
- [Using Copilot Extensions](https://docs.github.com/en/copilot/using-github-copilot/using-extensions-to-integrate-external-tools-with-copilot-chat)
- [About building Copilot Extensions](https://docs.github.com/en/copilot/building-copilot-extensions/about-building-copilot-extensions)
- [Set up process](https://docs.github.com/en/copilot/building-copilot-extensions/setting-up-copilot-extensions)
- [Communicating with the Copilot platform](https://docs.github.com/en/copilot/building-copilot-extensions/building-a-copilot-agent-for-your-copilot-extension/configuring-your-copilot-agent-to-communicate-with-the-copilot-platform)
- [Communicating with GitHub](https://docs.github.com/en/copilot/building-copilot-extensions/building-a-copilot-agent-for-your-copilot-extension/configuring-your-copilot-agent-to-communicate-with-github)
