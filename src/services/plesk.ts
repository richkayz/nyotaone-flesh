import 'dotenv/config';

const PLESK_URL = process.env.PLESK_BASE_URL;
const PLESK_API_KEY = process.env.PLESK_API_KEY;

const BASE_URL = PLESK_URL?.replace(/\/+$/, '');

async function pleskRequest(endpoint: string) {
  if (!BASE_URL || !PLESK_API_KEY) {
    throw new Error('Plesk API configuration is missing.');
  }

  const url = `${BASE_URL}/api/v2/${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': PLESK_API_KEY,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Plesk API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Plesk request failed: ${url}`);

    if (error instanceof Error) {
      console.error('Error:', error.message);

      if (error.cause) {
        console.error('Underlying cause:', error.cause);
      }
    }

    throw error;
  }
}

export async function getPleskDomains() {
  return pleskRequest('domains');
}

export async function getPleskCustomers() {
  const customers = await pleskRequest('clients');

  if (!Array.isArray(customers)) {
    throw new Error('Unexpected Plesk customers response.');
  }

  return customers.filter(
    (customer: any) => customer.type === 'customer'
  );
}


export async function updatePleskCustomer(
  customerId: number | string,
  updates: Record<string, unknown>
) {
  if (!BASE_URL || !PLESK_API_KEY) {
    throw new Error('Plesk API configuration is missing.');
  }

  const url = `${BASE_URL}/api/v2/clients/${customerId}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'X-API-Key': PLESK_API_KEY,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Plesk update failed: ${response.status} ${responseText}`
    );
  }

  return responseText ? JSON.parse(responseText) : {};
}