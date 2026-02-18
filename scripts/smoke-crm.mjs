#!/usr/bin/env node
import assert from 'assert';
import fetch from 'node-fetch';

const BASE = process.env.BASE_URL || 'http://localhost:4310';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || '';

async function postLead() {
  const payload = {
    name: 'Smoke Test User',
    email: `smoke+${Date.now()}@example.com`,
    phone: '9998887777',
    requirement: 'Smoke test capture',
    city: 'TestCity',
    usersDevices: 5,
    pageUrl: '/smoke-test'
  };

  const res = await fetch(`${BASE}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`POST /api/leads failed ${res.status} ${JSON.stringify(json)}`);
  console.log('POST ->', json);
  assert(json && json.ok && json.leadId, 'Expected leadId in response');
  return json.leadId;
}

async function findInAdmin(leadId) {
  const headers = {};
  if (ADMIN_PASS) headers['x-admin-pass'] = ADMIN_PASS;
  const res = await fetch(`${BASE}/api/leads`, { headers });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`/api/leads GET failed ${res.status} ${JSON.stringify(json)}`);
  const leads = json?.leads || [];
  const found = leads.find((l) => l.leadId === leadId);
  console.log('GET -> found?', Boolean(found));
  return found;
}

(async function main() {
  try {
    const id = await postLead();
    // give a short delay for DB write propagation if needed
    await new Promise((r) => setTimeout(r, 500));
    const found = await findInAdmin(id);
    if (!found) {
      console.error('Lead not found in admin list.');
      process.exitCode = 2;
    } else {
      console.log('Sanity check passed: lead visible in admin list.');
    }
  } catch (err) {
    console.error('Smoke test failed:', err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
})();
