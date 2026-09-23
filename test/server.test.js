const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../src/index');

let server;
let baseUrl;

test.before(async () => {
  server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => new Promise(resolve => server.close(resolve)));

test('serves the application shell', async () => {
  const response = await fetch(baseUrl);
  const body = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.match(body, /California Food Need Map/);
});

test('serves all 58 California counties with rates and geometry', async () => {
  const response = await fetch(`${baseUrl}/api/counties`);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.features.length, 58);
  for (const feature of data.features) {
    assert.equal(feature.type, 'Feature');
    assert.ok(feature.geometry);
    assert.equal(typeof feature.properties.COUNTY_NM, 'string');
    assert.equal(typeof feature.properties.MMG_PCT_OVERALL_FI_RATE, 'number');
  }
});

test('serves statewide and county organizations', async () => {
  const response = await fetch(`${baseUrl}/api/organizations`);
  const data = await response.json();
  assert.ok(data.organizations.length >= 20);
  assert.ok(data.organizations.some(org => org.counties.includes('Statewide')));
  assert.ok(data.organizations.some(org => org.counties.includes('Los Angeles')));
});

test('blocks path traversal and returns JSON 404s', async () => {
  const response = await fetch(`${baseUrl}/missing-file`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Not found' });
});
