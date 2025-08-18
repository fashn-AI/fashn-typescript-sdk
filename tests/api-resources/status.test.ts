// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import FashnSDK from 'fashn-sdk';

const client = new FashnSDK({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource status', () => {
  // Prism tests are disabled
  test.skip('retrieve', async () => {
    const responsePromise = client.status.retrieve('123a87r9-4129-4bb3-be18-9c9fb5bd7fc1-u1');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
