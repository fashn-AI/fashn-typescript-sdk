import Fashn from 'fashn';

const client = new Fashn({
  apiKey: process.env['FASHN_API_KEY'], // This is the default and can be omitted
});

async function main() {
  const params: Fashn.PredictionSubscribeParams = {
    inputs: {
      garment_image: 'https://example.com/garment.jpg',
      model_image: 'https://example.com/model.jpg',
    },
    model_name: 'tryon-v1.6',
  };
  const response = await client.predictions.subscribe(params);
  console.log(response);
}

main();
