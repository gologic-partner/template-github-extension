import axios from 'axios';
import 'dotenv/config';

/**
 * Fetch Confluence page content by pageId
 * @param {string} pageId - The Confluence page ID
 * @returns {Promise<string>} - The page content (HTML)
 */
export async function fetchConfluencePageContent(pageId) {
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
    console.log('Confluence response status code:', response.status);
    console.log('Confluence response:', response.data);
    const content = response?.data?.body?.storage?.value;
    console.log('Confluence content:', content);
    if (!content) {
      throw new Error('No content found for this page');
    }
    return content;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      console.error('Error fetching Confluence page:', err);
      throw new Error('Page not found');
    }
    console.error('Error fetching Confluence page:', err);
    throw new Error('Failed to fetch Confluence page');
  }
}