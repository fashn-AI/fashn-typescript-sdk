// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, asTextContentResult } from 'fashn-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Fashn from 'fashn';

export const metadata: Metadata = {
  resource: 'predictions',
  operation: 'write',
  tags: [],
  httpMethod: 'post',
  httpPath: '/v1/run',
  operationId: 'createPrediction',
};

export const tool: Tool = {
  name: 'run_predictions',
  description:
    'Submit a prediction request for AI-powered fashion processing. Supports multiple model types including:\n- Virtual try-on (tryon-v1.6)\n- Model creation (model-create)\n- Model variation (model-variation)\n- Model swap (model-swap)\n- Product to model (product-to-model)\n- Background operations (background-remove, background-change)\n- Image reframing (reframe)\n\nAll requests use the versioned format with model_name and inputs structure.\n',
  inputSchema: {
    type: 'object',
    anyOf: [
      {
        type: 'object',
        properties: {
          inputs: {
            type: 'object',
            properties: {
              garment_image: {
                type: 'string',
                description:
                  'Reference image of the clothing item to be tried on the `model_image`. Base64 images must include the proper prefix (e.g., `data:image/jpg;base64,<YOUR_BASE64>`)',
              },
              model_image: {
                type: 'string',
                description:
                  'Primary image of the person on whom the virtual try-on will be performed. Models Studio users can use their saved models by passing `saved:<model_name>`. Base64 images must include the proper prefix (e.g., `data:image/jpg;base64,<YOUR_BASE64>`)',
              },
              category: {
                type: 'string',
                description:
                  'Use `auto` to enable automatic classification of the garment type. For flat-lay or ghost mannequin images, the system detects the garment type automatically. For on-model images, full-body shots default to a full outfit swap. For focused shots (upper or lower body), the system selects the most likely garment type (tops or bottoms).',
                enum: ['auto', 'tops', 'bottoms', 'one-pieces'],
              },
              garment_photo_type: {
                type: 'string',
                description:
                  'Specifies the type of garment photo to optimize internal parameters for better performance. `model` is for photos of garments on a model, `flat-lay` is for flat-lay or ghost mannequin images, and `auto` attempts to automatically detect the photo type.',
                enum: ['auto', 'flat-lay', 'model'],
              },
              mode: {
                type: 'string',
                description:
                  'Specifies the mode of operation.\n- `performance` mode is faster but may compromise quality (5 seconds).\n- `balanced` mode is a perfect middle ground between speed and quality (8 seconds).\n- `quality` mode is slower, but delivers the highest quality results (12–17 seconds).',
                enum: ['performance', 'balanced', 'quality'],
              },
              moderation_level: {
                type: 'string',
                description:
                  'Sets the content moderation level for garment images.\n- `conservative` enforces stricter modesty standards suitable for culturally sensitive contexts. Blocks underwear, swimwear, and revealing outfits.\n- `permissive` allows swimwear, underwear, and revealing garments, while still blocking explicit nudity.\n- `none` disables all content moderation.\n\n**This technology is designed for ethical virtual try-on applications. Misuse—such as generating inappropriate imagery without consent—violates our Terms of Service. Setting moderation_level: none does not remove your responsibility for ethical and lawful use. Violations may result in service denial.**',
                enum: ['conservative', 'permissive', 'none'],
              },
              num_samples: {
                type: 'integer',
                description:
                  'Number of images to generate in a single run. Image generation has a random element in it, so trying multiple images at once increases the chances of getting a good result.',
              },
              output_format: {
                type: 'string',
                description:
                  'Specifies the desired output image format.\n- `png`: Delivers the highest quality image, ideal for use cases such as content creation where quality is paramount.\n- `jpeg`: Provides a faster response with a slightly compressed image, more suitable for real-time applications like consumer virtual try-on experiences.',
                enum: ['png', 'jpeg'],
              },
              return_base64: {
                type: 'boolean',
                description:
                  'When set to `true`, the API will return the generated image as a base64-encoded string instead of a CDN URL. The base64 string will be prefixed according to the `output_format` (e.g., `data:image/png;base64,...` or `data:image/jpeg;base64,...`). This option offers enhanced privacy as user-generated outputs are not stored on our servers when `return_base64` is enabled.',
              },
              seed: {
                type: 'integer',
                description:
                  'Sets random operations to a fixed state. Use the same seed to reproduce results with the same inputs, or different seed to force different results.',
              },
              segmentation_free: {
                type: 'boolean',
                description:
                  'Direct garment fitting without clothing segmentation, enabling bulkier garment try-ons with improved preservation of body shape and skin texture. Set to `false` if original garments are not removed properly.',
              },
            },
            required: ['garment_image', 'model_image'],
          },
          model_name: {
            type: 'string',
            description:
              'Virtual Try-On v1.6 enables realistic garment visualization using just a single photo of a person and a garment',
            enum: ['tryon-v1.6'],
          },
          webhook_url: {
            type: 'string',
            description: 'Optional webhook URL to receive completion notifications',
          },
        },
        required: ['inputs', 'model_name'],
      },
      {
        type: 'object',
        properties: {
          inputs: {
            type: 'object',
            properties: {
              product_image: {
                type: 'string',
                description:
                  'URL or base64 encoded image of the product to be worn. Supports clothing, accessories, shoes, and other wearable fashion items. Base64 images must include the proper prefix (e.g., data:image/jpg;base64,<YOUR_BASE64>)',
              },
              aspect_ratio: {
                type: 'string',
                description:
                  "Desired aspect ratio for the output image. Only applies when `model_image` is not provided (standard product-to-model mode).\n\nWhen `model_image` is provided (try-on mode), this parameter is ignored and the output will match the `model_image`'s aspect ratio.\n            \n**Default:** product_image's aspect ratio (standard mode only)",
                enum: ['1:1', '2:3', '3:4', '4:5', '5:4', '4:3', '3:2', '16:9', '9:16'],
              },
              model_image: {
                type: 'string',
                description:
                  'URL or base64 encoded image of the person to wear the product. When provided, enables try-on mode. When omitted, generates a new person wearing the product. Base64 images must include the proper prefix (e.g., data:image/jpg;base64,<YOUR_BASE64>)\n',
              },
              output_format: {
                type: 'string',
                description:
                  'Specifies the desired output image format.\n- `png`: Delivers the highest quality image, ideal for use cases such as content creation where quality is paramount.\n- `jpeg`: Provides a faster response with a slightly compressed image, more suitable for real-time applications.',
                enum: ['png', 'jpeg'],
              },
              prompt: {
                type: 'string',
                description:
                  'Additional instructions for person appearance (when `model_image` is not provided), styling preferences, or background.\n\n**Examples:** "man with tattoos", "tucked-in", "open jacket", "rolled-up sleeves", "studio background", "professional office setting"\n\n**Default:** None\n',
              },
              return_base64: {
                type: 'boolean',
                description:
                  'When set to `true`, the API will return the generated image as a base64-encoded string instead of a CDN URL. The base64 string will be prefixed `data:image/png;base64,....`\n\nThis option offers enhanced privacy as user-generated outputs are not stored on our servers when `return_base64` is enabled.\n',
              },
              seed: {
                type: 'integer',
                description:
                  'Seed for reproducible results. Use the same seed to reproduce results with the same inputs, or different seed to force different results. Must be between 0 and 2^32-1.',
              },
            },
            required: ['product_image'],
          },
          model_name: {
            type: 'string',
            description:
              'Product to Model endpoint transforms product images into people wearing those products. It supports dual-mode operation: standard product-to-model (generates new person) and try-on mode (adds product to existing person)',
            enum: ['product-to-model'],
          },
          webhook_url: {
            type: 'string',
            description: 'Optional webhook URL to receive completion notifications',
          },
        },
        required: ['inputs', 'model_name'],
      },
      {
        type: 'object',
        properties: {
          inputs: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description:
                  'Prompt for the model image generation. Describes the desired fashion model, clothing, pose, and scene.',
              },
              aspect_ratio: {
                type: 'string',
                description:
                  "Defines the width-to-height ratio of the generated image. This parameter controls the canvas dimensions for text-only generation. When image_reference is provided, the output inherits the reference image's aspect ratio and this parameter is ignored.\n\n**Supported Resolutions**\n\nEach aspect ratio corresponds to a specific resolution optimized for ~1MP output:\n\n| Aspect Ratio | Resolution | Use Case |\n|--------------|------------|----------|\n| 1:1 | 1024 × 1024 | Square format, social media |\n| 2:3 | 832 × 1248 | Portrait, fashion photography |\n| 3:4 | 880 × 1176 | Standard portrait |\n| 4:5 | 912 × 1144 | Instagram portrait |\n| 5:4 | 1144 × 912 | Landscape portrait |\n| 4:3 | 1176 × 880 | Traditional landscape |\n| 3:2 | 1176 × 784 | Wide landscape |\n| 16:9 | 1360 × 768 | Widescreen, banners |\n| 9:16 | 760 × 1360 | Vertical video format |",
                enum: ['1:1', '2:3', '3:4', '4:5', '5:4', '4:3', '3:2', '16:9', '9:16'],
              },
              disable_prompt_enhancement: {
                type: 'boolean',
                description:
                  'Disable prompt enhancement. When true, the prompt will be used as is, or a default prompt will be used if no prompt is provided.',
              },
              image_reference: {
                type: 'string',
                description:
                  "Optional reference image that guides the generation process. The model extracts structural information from this image to control the output composition.\n\nProcessing Behavior:\n- Aspect Ratio: Output automatically matches the reference image's dimensions.\n- Guidance Type: Controlled by the reference_type parameter (pose or silhouette)\n- Image Processing: Automatically resized while preserving aspect ratio\n\nBase64 images must include the proper prefix (e.g., data:image/jpg;base64,<YOUR_BASE64>)\n",
              },
              lora_url: {
                type: 'string',
                description:
                  'URL to a FLUX-based LoRA weights file (.safetensors) for custom identity generation. When provided, the LoRA will be loaded and applied during generation to maintain consistent character appearance across generations. Must be FLUX-compatible LoRA weights in .safetensors format, under 256MB.',
              },
              output_format: {
                type: 'string',
                description:
                  'Specifies the desired output image format.\n- `png`: Delivers the highest quality image, ideal for use cases such as content creation where quality is paramount.\n- `jpeg`: Provides a faster response with a slightly compressed image, more suitable for real-time applications.',
                enum: ['png', 'jpeg'],
              },
              reference_type: {
                type: 'string',
                description:
                  'Type of reference to use when image_reference is provided.\n- `pose` matches the body position and stance from the reference image.\n- `silhouette` matches the outline and shape from the reference image.\n\n**Default is applied only if image_reference is provided**',
                enum: ['pose', 'silhouette'],
              },
              return_base64: {
                type: 'boolean',
                description:
                  'When set to `true`, the API will return the generated image as a base64-encoded string instead of a CDN URL. The base64 string will be prefixed according to the `output_format` (e.g., `data:image/png;base64,...` or `data:image/jpeg;base64,...`). This option offers enhanced privacy as user-generated outputs are not stored on our servers when `return_base64` is enabled.',
              },
              seed: {
                type: 'integer',
                description: 'Random seed for reproducible results',
              },
            },
            required: ['prompt'],
          },
          model_name: {
            type: 'string',
            description: 'Model creation endpoint',
            enum: ['model-create'],
          },
          webhook_url: {
            type: 'string',
            description: 'Optional webhook URL to receive completion notifications',
          },
        },
        required: ['inputs', 'model_name'],
      },
      {
        type: 'object',
        properties: {
          inputs: {
            type: 'object',
            properties: {
              model_image: {
                type: 'string',
                description:
                  'Source fashion model image to create variations from. The variation will maintain the core composition while introducing controlled modifications. Base64 images must include the proper prefix (e.g., data:image/jpg;base64,<YOUR_BASE64>)',
              },
              lora_url: {
                type: 'string',
                description:
                  'URL to a FLUX-based LoRA weights file (.safetensors) for custom identity generation. When provided, the LoRA will be loaded and applied during generation to maintain consistent character appearance across generations. Must be FLUX-compatible LoRA weights in .safetensors format, under 256MB.',
              },
              output_format: {
                type: 'string',
                description:
                  'Specifies the desired output image format.\n- `png`: Delivers the highest quality image, ideal for use cases such as content creation where quality is paramount.\n- `jpeg`: Provides a faster response with a slightly compressed image, more suitable for real-time applications.',
                enum: ['png', 'jpeg'],
              },
              return_base64: {
                type: 'boolean',
                description:
                  'When set to `true`, the API will return the generated image as a base64-encoded string instead of a CDN URL. The base64 string will be prefixed according to the `output_format` (e.g., `data:image/png;base64,...` or `data:image/jpeg;base64,...`). This option offers enhanced privacy as user-generated outputs are not stored on our servers when `return_base64` is enabled.',
              },
              seed: {
                type: 'integer',
                description:
                  'Sets random operations to a fixed state. Use the same seed to reproduce results with the same inputs, or different seed to force different results.',
              },
              variation_strength: {
                type: 'string',
                description:
                  'Controls the intensity of variations applied to the source image.\n- `subtle` - Minor adjustments that preserve most of the original characteristics while introducing small variations.\n- `strong` - More significant modifications that create noticeable differences while maintaining the core composition.',
                enum: ['subtle', 'strong'],
              },
            },
            required: ['model_image'],
          },
          model_name: {
            type: 'string',
            description: 'Model variation endpoint for creating variations from existing model images',
            enum: ['model-variation'],
          },
          webhook_url: {
            type: 'string',
            description: 'Optional webhook URL to receive completion notifications',
          },
        },
        required: ['inputs', 'model_name'],
      },
      {
        type: 'object',
        properties: {
          inputs: {
            type: 'object',
            properties: {
              model_image: {
                type: 'string',
                description:
                  "Source fashion model image containing the clothing and pose to preserve. The model's identity (face, skin tone, hair) will be transformed while keeping the outfit exactly as shown. Base64 images must include the proper prefix (e.g., data:image/jpg;base64,<YOUR_BASE64>)",
              },
              background_change: {
                type: 'boolean',
                description:
                  'Controls whether the background should be modified according to the prompt or preserved from the original image. When enabled, include background descriptions in your prompt.\n- `true` - Background will be changed according to the prompt description.\n- `false` - Original background will be preserved exactly as in the source image.\n',
              },
              disable_prompt_enhancement: {
                type: 'boolean',
                description:
                  'Disable prompt enhancement. When true, the prompt will be used exactly as provided, or a default prompt will be used if no prompt is provided.',
              },
              lora_url: {
                type: 'string',
                description:
                  'URL to a FLUX-based LoRA weights file (.safetensors) for custom identity generation. When provided, the LoRA will be loaded and applied during generation to maintain consistent character appearance across generations. Must be FLUX-compatible LoRA weights in .safetensors format, under 256MB.',
              },
              output_format: {
                type: 'string',
                description:
                  'Specifies the desired output image format.\n- `png`: Delivers the highest quality image, ideal for use cases such as content creation where quality is paramount.\n- `jpeg`: Provides a faster response with a slightly compressed image, more suitable for real-time applications.',
                enum: ['png', 'jpeg'],
              },
              prompt: {
                type: 'string',
                description:
                  'Description of the desired model identity transformation. Specify ethnicity, facial features, hair color, and other physical characteristics.\n\n**Default: Empty string (Random identity change)**\n',
              },
              return_base64: {
                type: 'boolean',
                description:
                  'When set to `true`, the API will return the generated image as a base64-encoded string instead of a CDN URL. The base64 string will be prefixed according to the `output_format` (e.g., `data:image/png;base64,...` or `data:image/jpeg;base64,...`). This option offers enhanced privacy as user-generated outputs are not stored on our servers when `return_base64` is enabled.',
              },
              seed: {
                type: 'integer',
                description:
                  'Sets random operations to a fixed state. Use the same seed to reproduce results with the same inputs, or different seed to force different results.',
              },
            },
            required: ['model_image'],
          },
          model_name: {
            type: 'string',
            description:
              'Model swap endpoint for transforming model identity while preserving clothing and pose',
            enum: ['model-swap'],
          },
          webhook_url: {
            type: 'string',
            description: 'Optional webhook URL to receive completion notifications',
          },
        },
        required: ['inputs', 'model_name'],
      },
      {
        type: 'object',
        properties: {
          inputs: {
            type: 'object',
            properties: {
              image: {
                type: 'string',
                description:
                  'Source image to extend or reframe. The AI will intelligently generate new content to expand the image based on the selected mode and parameters.\n\nResolution Handling: Output resolution is limited to 1MP. If your image is already at or above this size, it will be downsampled so that, after any extensions are applied, the final result fits within the 1MP limit.\n\nBase64 Format: Base64 images must include the proper prefix (e.g., data:image/jpg;base64,<YOUR_BASE64>)\n',
              },
              mode: {
                type: 'string',
                description:
                  'Selects the reframing operation mode.\n- `direction` - Directed zoom-out: extend image in specific directions to reveal more content.\n- `aspect_ratio` - Canvas adjustment: transform image to match a target aspect ratio.\n\n**Note: direction mode requires target_direction, aspect_ratio mode requires target_aspect_ratio.**"',
                enum: ['direction', 'aspect_ratio'],
              },
              output_format: {
                type: 'string',
                description:
                  'Specifies the desired output image format.\n- `png`: Delivers the highest quality image, ideal for use cases such as content creation where quality is paramount.\n- `jpeg`: Provides a faster response with a slightly compressed image, more suitable for real-time applications.',
                enum: ['png', 'jpeg'],
              },
              return_base64: {
                type: 'boolean',
                description:
                  'When set to `true`, the API will return the generated image as a base64-encoded string instead of a CDN URL. The base64 string will be prefixed according to the `output_format` (e.g., `data:image/png;base64,...` or `data:image/jpeg;base64,...`). This option offers enhanced privacy as user-generated outputs are not stored on our servers when `return_base64` is enabled.',
              },
              seed: {
                type: 'integer',
                description:
                  'Sets random operations to a fixed state. Use the same seed to reproduce results with the same inputs, or different seed to force different results.',
              },
              target_aspect_ratio: {
                type: 'string',
                description:
                  "Target aspect ratio for the output canvas when using mode: 'aspect_ratio'. This parameter is ignored when mode: 'direction'.\n\n**Supported Aspect Ratios**\n\nEach aspect ratio corresponds to a specific resolution optimized for ~1MP output:\n\n| Aspect Ratio | Resolution | Use Case |\n|--------------|------------|----------|\n| 1:1 | 1024 × 1024 | Square format, social media |\n| 2:3 | 832 × 1248 | Portrait, fashion photography |\n| 3:2 | 1248 × 832 | Standard landscape |\n| 3:4 | 880 × 1176 | Standard portrait |\n| 4:3 | 1176 × 880 | Traditional landscape |\n| 4:5 | 912 × 1144 | Instagram portrait |\n| 5:4 | 1144 × 912 | Instagram landscape |\n| 9:16 | 760 × 1360 | Vertical video format |\n| 16:9 | 1360 × 760 | Horizontal video format |",
                enum: ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9'],
              },
              target_direction: {
                type: 'string',
                description:
                  "Direction of image extension when using mode: 'direction'. This parameter is ignored when mode: 'aspect_ratio'.\n- `both` - Expand in both directions (zoom out effect).\n- `down` - Expand only downward (reveal lower content, e.g., show full body from upper body shot).\n- `up` - Expand only upward (reveal upper content, e.g., show face from headless shot).",
                enum: ['both', 'down', 'up'],
              },
            },
            required: ['image'],
          },
          model_name: {
            type: 'string',
            description: 'Image reframing endpoint',
            enum: ['reframe'],
          },
          webhook_url: {
            type: 'string',
            description: 'Optional webhook URL to receive completion notifications',
          },
        },
        required: ['inputs', 'model_name'],
      },
      {
        type: 'object',
        properties: {
          inputs: {
            type: 'object',
            properties: {
              image: {
                type: 'string',
                description:
                  'Source image containing the subject to preserve. The AI will automatically detect and separate the foreground subject from the background. Base64 images must include the proper prefix (e.g., data:image/jpg;base64,<YOUR_BASE64>)',
              },
              background_prompt: {
                type: 'string',
                description:
                  'Text description of the desired background environment. The AI generates a new background based on this description and harmonizes it with the preserved foreground subject."\n\n**Default: Empty string (Natural background for the subject)**\n',
              },
              disable_prompt_enhancement: {
                type: 'boolean',
                description:
                  'Disable prompt enhancement for the background description. When `true`, the background prompt will be used exactly as provided.',
              },
              output_format: {
                type: 'string',
                description:
                  'Specifies the desired output image format.\n- `png`: Delivers the highest quality image, ideal for use cases such as content creation where quality is paramount.\n- `jpeg`: Provides a faster response with a slightly compressed image, more suitable for real-time applications.',
                enum: ['png', 'jpeg'],
              },
              return_base64: {
                type: 'boolean',
                description:
                  'When set to `true`, the API will return the generated image as a base64-encoded string instead of a CDN URL. The base64 string will be prefixed according to the `output_format` (e.g., `data:image/png;base64,...` or `data:image/jpeg;base64,...`). This option offers enhanced privacy as user-generated outputs are not stored on our servers when `return_base64` is enabled.',
              },
              seed: {
                type: 'integer',
                description:
                  'Sets random operations to a fixed state. Use the same seed to reproduce results with the same inputs, or different seed to force different results.',
              },
            },
            required: ['image'],
          },
          model_name: {
            type: 'string',
            description: 'Background change endpoint',
            enum: ['background-change'],
          },
          webhook_url: {
            type: 'string',
            description: 'Optional webhook URL to receive completion notifications',
          },
        },
        required: ['inputs', 'model_name'],
      },
      {
        type: 'object',
        properties: {
          inputs: {
            type: 'object',
            properties: {
              image: {
                type: 'string',
                description:
                  'Source image to remove the background from. The AI will automatically detect the main subject and create a clean cutout with transparent background. Base64 images must include the proper prefix (e.g., data:image/jpg;base64,<YOUR_BASE64>)',
              },
              return_base64: {
                type: 'boolean',
                description:
                  'When set to `true`, the API will return the generated image as a base64-encoded string instead of a CDN URL. The base64 string will be prefixed `data:image/png;base64,...`. This option offers enhanced privacy as user-generated outputs are not stored on our servers when `return_base64` is enabled.',
              },
            },
            required: ['image'],
          },
          model_name: {
            type: 'string',
            description: 'Background removal endpoint',
            enum: ['background-remove'],
          },
          webhook_url: {
            type: 'string',
            description: 'Optional webhook URL to receive completion notifications',
          },
        },
        required: ['inputs', 'model_name'],
      },
    ],
  },
  annotations: {},
};

export const handler = async (client: Fashn, args: Record<string, unknown> | undefined) => {
  const body = args as any;
  return asTextContentResult(await client.predictions.run(body));
};

export default { metadata, tool, handler };
