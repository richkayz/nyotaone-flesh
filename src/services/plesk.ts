
import 'dotenv/config';

const PLESK_URL = process.env.PLESK_URL;
const PLESK_API_KEY = process.env.PLESK_API_KEY;

export async function getPleskDomains() {
  if (!PLESK_URL || !PLESK_API_KEY) {
    throw new Error('Plesk API configuration is missing.');
  }

  const response = await fetch(
    `${PLESK_URL.replace(/\/$/, '')}/api/v2/domains`,
    {
      method: 'GET',
      headers: {
        'X-API-Key': PLESK_API_KEY,
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Plesk API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
