// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Fashn from 'fashn-sdk';

const client = new Fashn({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource run', () => {
  // Prism tests are disabled
  test.skip('createPrediction: only required params', async () => {
    const responsePromise = client.run.createPrediction({
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
  test.skip('createPrediction: required and optional params', async () => {
    const response = await client.run.createPrediction({
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
});
