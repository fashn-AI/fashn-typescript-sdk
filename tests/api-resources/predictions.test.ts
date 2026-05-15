// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Fashn from 'fashn';

const client = new Fashn({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource predictions', () => {
  // Mock server tests are disabled
  test.skip('run: only required params', async () => {
    const responsePromise = client.predictions.run({
      inputs: {
        model_image: 'https://example.com/model.jpg',
        product_image: 'https://example.com/garment.jpg',
      },
      model_name: 'tryon-max',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
  test.skip('run: required and optional params', async () => {
    const response = await client.predictions.run({
      inputs: {
        model_image: 'https://example.com/model.jpg',
        product_image: 'https://example.com/garment.jpg',
        aspect_ratio: '21:9',
        generation_mode: 'balanced',
        num_images: 1,
        output_format: 'png',
        prompt: 'prompt',
        resolution: '1k',
        return_base64: true,
        seed: 0,
      },
      model_name: 'tryon-max',
      webhook_url: 'https://example.com/webhook',
    });
  });

  // Mock server tests are disabled
  test.skip('status', async () => {
    const responsePromise = client.predictions.status('123a87r9-4129-4bb3-be18-9c9fb5bd7fc1-u1');
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });
});
