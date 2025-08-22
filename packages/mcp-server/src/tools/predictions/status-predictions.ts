// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { maybeFilter } from 'fashn-mcp/filtering';
import { Metadata, asTextContentResult } from 'fashn-mcp/tools/types';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import Fashn from 'fashn';

export const metadata: Metadata = {
  resource: 'predictions',
  operation: 'read',
  tags: [],
  httpMethod: 'get',
  httpPath: '/v1/status/{id}',
  operationId: 'getPredictionStatus',
};

export const tool: Tool = {
  name: 'status_predictions',
  description:
    "When using this tool, always use the `jq_filter` parameter to reduce the response size and improve performance.\n\nOnly omit if you're sure you don't need the data.\n\nPoll for the status of a specific prediction using its ID. Use this endpoint to track prediction progress and retrieve results.\n\n**Status States:**\n- `starting` - Prediction is being initialized\n- `in_queue` - Prediction is waiting to be processed  \n- `processing` - Model is actively generating your result\n- `completed` - Generation finished successfully, output available\n- `failed` - Generation failed, check error details\n\n**Output Availability:**\n- **CDN URLs** (default): Available for 72 hours after completion\n- **Base64 outputs** (when `return_base64: true`): Available for 60 minutes after completion\n\n\n# Response Schema\n```json\n{\n  type: 'object',\n  properties: {\n    id: {\n      type: 'string',\n      description: 'The unique prediction ID'\n    },\n    error: {\n      type: 'object',\n      description: 'Structured error object with name and message fields',\n      properties: {\n        message: {\n          type: 'string',\n          description: 'Detailed error message explaining the specific failure'\n        },\n        name: {\n          type: 'string',\n          description: 'Error type/category with troubleshooting guidance:\\n\\n**ImageLoadError** - Unable to load image from provided inputs\\n- *Cause*: Pipeline cannot load model/garment/reference image\\n- *Solution*: For URLs - ensure public accessibility and correct Content-Type headers. For Base64 - include proper data:image/format;base64 prefix\\n\\n**ContentModerationError** - Prohibited content detected (try-on models only)\\n- *Cause*: Content moderation flagged garment image\\n- *Solution*: Adjust moderation_level to \\'permissive\\' or \\'none\\' if appropriate for your use case\\n\\n**PoseError** - Unable to detect body pose (try-on models only)  \\n- *Cause*: Body pose not detectable in model or garment image\\n- *Solution*: Improve image quality following model photo guidelines\\n\\n**LoRALoadError** - Failed to load LoRA weights (model-create, model-variation, model-swap only)\\n- *Cause*: Cannot download or load LoRA file\\n- *Solution*: Ensure URL is public, file is valid .safetensors under 256MB, compatible with FLUX.1-dev\\n\\n**InputValidationError** - Invalid parameter combination (reframe only)\\n- *Cause*: Missing required parameters or invalid values for selected mode\\n- *Solution*: Ensure target_aspect_ratio is provided when mode is \\'aspect_ratio\\'. Check aspect ratio values are from supported list\\n\\n**PipelineError** - Unexpected pipeline execution error\\n- *Cause*: Internal processing failure\\n- *Solution*: Retry request (no charge for failures). Contact support@fashn.ai with prediction ID if persists\\n\\n**ThirdPartyError** - Third-party processor failure\\n- *Cause*: External service restrictions (content/prompt limitations)\\n- *Model-specific solutions*:\\n  - *Try-on*: Modify image inputs for captioning restrictions\\n  - *Model-swap*: Try different inputs or disable prompt enhancement\\n  - *Background-change*: Modify image inputs or background prompt\\n  - *Reframe*: Try different image inputs for captioning restrictions\\n- Contact support@fashn.ai with prediction ID if persists\\n\\n**3rdPartyProviderError** - Third-party provider failure (fallback error type)\\n- *Cause*: External provider error without specific classification\\n- *Solution*: Retry request. Contact support@fashn.ai with prediction ID if persists\\n\\n**InternalServerError** - General server error (fallback error type)\\n- *Cause*: Unexpected server-side failure\\n- *Solution*: Retry request. Contact support@fashn.ai with prediction ID if persists',\n          enum: [            'ImageLoadError',\n            'ContentModerationError',\n            'PoseError',\n            'LoRALoadError',\n            'InputValidationError',\n            'PipelineError',\n            'ThirdPartyError',\n            '3rdPartyProviderError',\n            'InternalServerError'\n          ]\n        }\n      },\n      required: [        'message',\n        'name'\n      ]\n    },\n    status: {\n      type: 'string',\n      description: 'Current status of the prediction',\n      enum: [        'starting',\n        'in_queue',\n        'processing',\n        'completed',\n        'failed',\n        'canceled',\n        'time_out'\n      ]\n    },\n    output: {\n      anyOf: [        {\n          type: 'array',\n          description: 'Array of CDN URLs to generated images',\n          items: {\n            type: 'string'\n          }\n        },\n        {\n          type: 'array',\n          description: 'Array of base64-encoded images with proper data URI prefix',\n          items: {\n            type: 'string'\n          }\n        }\n      ],\n      description: 'Generated images - format depends on original request\\'s return_base64 setting'\n    }\n  },\n  required: [    'id',\n    'error',\n    'status'\n  ]\n}\n```",
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      jq_filter: {
        type: 'string',
        title: 'jq Filter',
        description:
          'A jq filter to apply to the response to include certain fields. Consult the output schema in the tool description to see the fields that are available.\n\nFor example: to include only the `name` field in every object of a results array, you can provide ".results[].name".\n\nFor more information, see the [jq documentation](https://jqlang.org/manual/).',
      },
    },
    required: ['id'],
  },
  annotations: {
    readOnlyHint: true,
  },
};

export const handler = async (client: Fashn, args: Record<string, unknown> | undefined) => {
  const { id, jq_filter, ...body } = args as any;
  return asTextContentResult(await maybeFilter(jq_filter, await client.predictions.status(id)));
};

export default { metadata, tool, handler };
