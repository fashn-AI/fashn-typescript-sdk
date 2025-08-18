// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Fashn from 'fashn-sdk';

const client = new Fashn({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource predictions', () => {
  // Prism tests are disabled
  test.skip('create: only required params', async () => {
    const responsePromise = client.predictions.create({
      inputs: {
        garment_image: 'https://example.com/garment.jpg',
        model_image: 'https://example.com/model.jpg',
      },
      model_name: 'tryon-v1.6',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('create: required and optional params', async () => {
    const response = await client.predictions.create({
      inputs: {
        garment_image: 'https://example.com/garment.jpg',
        model_image: 'https://example.com/model.jpg',
        category: 'auto',
        garment_photo_type: 'auto',
        mode: 'performance',
        moderation_level: 'conservative',
        num_samples: 1,
        output_format: 'png',
        return_base64: true,
        seed: 0,
        segmentation_free: true,
      },
      model_name: 'tryon-v1.6',
      webhook_url: 'https://example.com/webhook',
    });
  });

  // Prism tests are disabled
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
