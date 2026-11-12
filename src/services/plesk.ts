
import 'dotenv/config';

const PLESK_URL = process.env.PLESK_BASE_URL;
const PLESK_API_KEY = process.env.PLESK_API_KEY;

const BASE_URL = PLESK_URL?.replace(/\/+$/, '');

interface PleskCliResult {
  code: number;
  stdout: string;
  stderr: string;
}

export interface PleskMailbox {
  email: string;
  name: string;
  domain: string;
}

// =====================================================
// GENERAL PLESK API REQUEST
// =====================================================

async function pleskRequest(endpoint: string): Promise<any> {
  if (!BASE_URL || !PLESK_API_KEY) {
    throw new Error('Plesk API configuration is missing.');
  }

  const url = `${BASE_URL}/api/v2/${endpoint}`;

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

  return response.json();
}

// =====================================================
// PLESK CLI REQUEST
// =====================================================

async function pleskCliRequest(
  utility: string,
  params: string[]
): Promise<PleskCliResult> {
  if (!BASE_URL || !PLESK_API_KEY) {
    throw new Error('Plesk API configuration is missing.');
  }

  const url = `${BASE_URL}/api/v2/cli/${utility}/call`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-Key': PLESK_API_KEY,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ params }),
  });

  const raw = await response.text();

  let result: any;

  try {
    result = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error('Plesk returned an unreadable response.');
  }

  if (!response.ok) {
    throw new Error(
      result?.stderr ||
      result?.message ||
      `Plesk API error: ${response.status}`
    );
  }

  if (Number(result.code ?? 0) !== 0) {
    throw new Error(
      result.stderr ||
      result.stdout ||
      'Plesk command failed.'
    );
  }

  return {
    code: Number(result.code ?? 0),
    stdout: String(result.stdout ?? ''),
    stderr: String(result.stderr ?? ''),
  };
}

// =====================================================
// DOMAINS
// =====================================================

export async function getPleskDomains() {
  return pleskRequest('domains');
}

// =====================================================
// CUSTOMERS
// =====================================================

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

// =====================================================
// BUSINESS EMAIL - MAILBOX PARSING
// =====================================================

function parsePleskMailboxes(output: string): PleskMailbox[] {
  const emailPattern =
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

  const matches = output.match(emailPattern) || [];

  const uniqueEmails = [...new Set(
    matches.map(email => email.toLowerCase())
  )];

  return uniqueEmails.map(email => {
    const [name, domain] = email.split('@');

    return {
      email,
      name,
      domain,
    };
  });
}

// =====================================================
// RETRIEVE MAILBOXES
// =====================================================

export async function getPleskMailboxes(): Promise<PleskMailbox[]> {
  const result = await pleskCliRequest('mail', ['--list']);

  return parsePleskMailboxes(result.stdout);
}

// =====================================================
// CREATE MAILBOX
// =====================================================

export async function createPleskMailbox(
  emailAddress: string,
  password: string
) {
  if (!emailAddress || !password) {
    throw new Error('Email address and password are required.');
  }

  return pleskCliRequest('mail', [
    '--create',
    emailAddress,
    '-passwd',
    password,
    '-mailbox',
    'true',
  ]);
}
