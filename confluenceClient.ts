import axios from 'axios';
import 'dotenv/config';

/**
 * Récupère le contenu d'une page Confluence par son ID
 * @param pageId L'identifiant de la page Confluence
 * @returns Le contenu HTML de la page
 */
export async function fetchConfluencePageContent(pageId: string): Promise<string> {
  const baseUrl = process.env.CONFLUENCE_BASE_URL;
  const email = process.env.CONFLUENCE_EMAIL;
  const apiToken = process.env.CONFLUENCE_API_TOKEN;

  if (!baseUrl || !email || !apiToken) {
    throw new Error('Confluence credentials (CONFLUENCE_BASE_URL, CONFLUENCE_EMAIL, CONFLUENCE_API_TOKEN) are not set');
  }

  const url = `${baseUrl}/rest/api/content/${pageId}?expand=body.storage`;
  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });
    const content = response?.data?.body?.storage?.value;
    if (!content) {
      throw new Error('No content found for this page');
    }
    return content;
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      throw new Error('Page not found');
    }
    throw new Error('Failed to fetch Confluence page');
  }
}

export {};
