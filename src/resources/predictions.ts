// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';
import { APIConnectionTimeoutError } from '../core/error';

const DEFAULT_POLL_INTERVAL = 1000;
const DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_RETRIES = 3;

export class Predictions extends APIResource {
  /**
   * Submit a prediction request for AI-powered fashion processing. Supports multiple
   * model types including:
   *
   * - Virtual try-on (tryon-v1.6)
   * - Model creation (model-create)
   * - Model variation (model-variation)
   * - Model swap (model-swap)
   * - Product to model (product-to-model)
   * - Face to model (face-to-model)
   * - Background operations (background-remove, background-change)
   * - Image reframing (reframe)
   *
   * All requests use the versioned format with model_name and inputs structure.
   *
   * @example
   * ```ts
   * const response = await client.predictions.run({
   *   inputs: {
   *     model_image: 'https://example.com/model.jpg',
   *     garment_image: 'https://example.com/garment.jpg',
   *   },
   *   model_name: 'tryon-v1.6',
   * });
   * ```
   */
  run(params: PredictionRunParams, options?: RequestOptions): APIPromise<PredictionRunResponse> {
    const { webhook_url, ...body } = params;
    return this._client.post('/v1/run', { query: { webhook_url }, body, ...options });
  }

  /**
   * Poll for the status of a specific prediction using its ID. Use this endpoint to
   * track prediction progress and retrieve results.
   *
   * **Status States:**
   *
   * - `starting` - Prediction is being initialized
   * - `in_queue` - Prediction is waiting to be processed
   * - `processing` - Model is actively generating your result
   * - `completed` - Generation finished successfully, output available
   * - `failed` - Generation failed, check error details
   *
   * **Output Availability:**
   *
   * - **CDN URLs** (default): Available for 72 hours after completion
   * - **Base64 outputs** (when `return_base64: true`): Available for 60 minutes
   *   after completion
   *
   * @example
   * ```ts
   * const response = await client.predictions.status(
   *   '123a87r9-4129-4bb3-be18-9c9fb5bd7fc1-u1',
   * );
   * ```
   */
  status(id: string, options?: RequestOptions): APIPromise<PredictionStatusResponse> {
    return this._client.get(path`/v1/status/${id}`, options);
  }

  /**
   * Submit a prediction request and automatically poll for completion. Combines
   * the `run` and `status` endpoints into a single call with real-time progress
   * updates via callbacks.
   *
   * Polls every 1 second by default with a 5-minute timeout. Automatically stops
   * polling when prediction reaches a terminal state and returns the final result.
   *
   * **Returned Status Values:**
   * - `completed` - Generation finished successfully, output available
   * - `failed` - Generation failed, check error details
   * - `canceled` - Prediction was canceled
   * - `time_out` - Prediction timed out
   *
   * Note: `starting`, `in_queue`, and `processing` statuses are only available
   * via the `onQueueUpdate` callback during polling, never in the final response.
   *
   * @example
   * ```ts
   *
   * const result = await client.predictions.subscribe({
   *   inputs: {
   *     model_image: 'https://example.com/model.jpg',
   *     garment_image: 'https://example.com/garment.jpg',
   *   },
   *   model_name: 'tryon-v1.6',
   *   onEnqueued: (requestId) => console.log('Started:', requestId),
   *   onQueueUpdate: (status) => console.log('Status:', status.status),
   * });
   * // result.status will be one of: 'completed', 'failed', 'canceled', 'time_out'
   * ```
   */
  async subscribe(
    body: PredictionSubscribeParams,
    options?: RequestOptions,
  ): Promise<PredictionSubscribeResponse> {
    const response = await this._client.predictions.run(body, options);

    if (body.onEnqueued) body.onEnqueued(response.id);

    return this.subscribeToStatus(response.id, body, options);
  }

  private subscribeToStatus(
    id: string,
    body: PredictionSubscribeParams,
    options?: RequestOptions,
  ): Promise<PredictionSubscribeResponse> {
    return new Promise((resolve, reject) => {
      const pollInterval = body.pollInterval ?? DEFAULT_POLL_INTERVAL;
      const timeout = body.timeout ?? DEFAULT_TIMEOUT;
      const maxRetries = body.maxRetries ?? DEFAULT_MAX_RETRIES;

      let pollIntervalId: NodeJS.Timeout;
      let timeoutId: NodeJS.Timeout;

      const clearScheduledTasks = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (pollIntervalId) clearTimeout(pollIntervalId);
      };

      if (timeout) {
        timeoutId = setTimeout(() => {
          clearScheduledTasks();
          // TODO: Cancel prediction on server when cancellation API is available
          reject(new APIConnectionTimeoutError({ message: 'Timeout' }));
        }, timeout);
      }

      const pool = async () => {
        try {
          const status = await this._client.predictions.status(id, {
            ...options,
            maxRetries,
          });
          if (body.onQueueUpdate) {
            body.onQueueUpdate(status);
          }

          if (
            status.status !== 'starting' &&
            status.status !== 'in_queue' &&
            status.status !== 'processing'
          ) {
            clearScheduledTasks();
            return resolve(status as PredictionSubscribeResponse);
          }

          pollIntervalId = setTimeout(pool, pollInterval);
        } catch (error) {
          clearScheduledTasks();
          reject(error);
        }
      };

      pool().catch(reject);
    });
  }
}

export interface PredictionRunResponse {
  /**
   * Unique prediction identifier
   */
  id: string;

  /**
   * Error message if prediction failed to start
   */
  error: string | null;
}

export interface PredictionStatusResponse {
  /**
   * The unique prediction ID
   */
  id: string;

  /**
   * Structured error object with name and message fields
   */
  error: PredictionStatusResponse.Error | null;

  /**
   * Current status of the prediction
   */
  status: 'starting' | 'in_queue' | 'processing' | 'completed' | 'failed' | 'canceled' | 'time_out';

  /**
   * Generated images - format depends on original request's return_base64 setting
   */
  output?: Array<string> | Array<string> | null;
}

export namespace PredictionStatusResponse {
  /**
   * Structured error object with name and message fields
   */
  export interface Error {
    /**
     * Detailed error message explaining the specific failure
     */
    message: string;

    /**
     * Error type/category with troubleshooting guidance:
     *
     * **ImageLoadError** - Unable to load image from provided inputs
     *
     * - _Cause_: Pipeline cannot load product image, model image, garment image, or
     *   reference image
     * - _Solution_: For URLs - ensure public accessibility and correct Content-Type
     *   headers. For Base64 - include proper data:image/format;base64 prefix
     *
     * **ContentModerationError** - Prohibited content detected
     *
     * - _Cause_: Content moderation flagged product, garment, or model image. More
     *   sensitive when model_image contains an actual person (virtual try-on mode)
     * - _Solution_: For try-on models - adjust moderation_level to 'permissive' or
     *   'none' if appropriate. For product-to-model - explicit or inappropriate
     *   imagery is prohibited, particularly with real people. For intimate apparel
     *   (lingerie/swimwear), use FASHN Virtual Try-On endpoint with full moderation
     *   control. Product generation without model_image operates under more permissive
     *   policies. Contact support@fashn.ai with prediction ID if content was
     *   incorrectly flagged
     *
     * **PoseError** - Unable to detect body pose (try-on models only)
     *
     * - _Cause_: Body pose not detectable in model or garment image
     * - _Solution_: Improve image quality following model photo guidelines
     *
     * **LoRALoadError** - Failed to load LoRA weights (model-create, model-variation,
     * model-swap only)
     *
     * - _Cause_: Cannot download or load LoRA file
     * - _Solution_: Ensure URL is public, file is valid .safetensors under 256MB,
     *   compatible with FLUX.1-dev
     *
     * **InputValidationError** - Invalid parameter combination (reframe only)
     *
     * - _Cause_: Missing required parameters or invalid values for selected mode
     * - _Solution_: Ensure target_aspect_ratio is provided when mode is
     *   'aspect_ratio'. Check aspect ratio values are from supported list
     *
     * **PipelineError** - Unexpected pipeline execution error
     *
     * - _Cause_: Internal processing failure
     * - _Solution_: Retry request (no charge for failures). Contact support@fashn.ai
     *   with prediction ID if persists
     *
     * **ThirdPartyError** - Third-party processor failure
     *
     * - _Cause_: External service restrictions (content/prompt limitations)
     * - _Model-specific solutions_:
     *   - _Try-on_: Modify image inputs for captioning restrictions
     *   - _Product-to-model_: Try modifying image inputs, most likely caused by
     *     content restrictions in image captioning
     *   - _Model-swap_: Try different inputs or disable prompt enhancement
     *   - _Background-change_: Modify image inputs or background prompt
     *   - _Reframe_: Try different image inputs for captioning restrictions
     * - Contact support@fashn.ai with prediction ID if persists
     *
     * **3rdPartyProviderError** - Third-party provider failure (fallback error type)
     *
     * - _Cause_: External provider error without specific classification
     * - _Solution_: Retry request. Contact support@fashn.ai with prediction ID if
     *   persists
     *
     * **InternalServerError** - General server error (fallback error type)
     *
     * - _Cause_: Unexpected server-side failure
     * - _Solution_: Retry request. Contact support@fashn.ai with prediction ID if
     *   persists
     */
    name:
      | 'ImageLoadError'
      | 'ContentModerationError'
      | 'PoseError'
      | 'LoRALoadError'
      | 'InputValidationError'
      | 'PipelineError'
      | 'ThirdPartyError'
      | '3rdPartyProviderError'
      | 'InternalServerError';
  }
}

export type PredictionRunParams =
  | PredictionRunParams.TryOnRequest
  | PredictionRunParams.ProductToModelRequest
  | PredictionRunParams.FaceToModelRequest
  | PredictionRunParams.ModelCreateRequest
  | PredictionRunParams.ModelVariationRequest
  | PredictionRunParams.ModelSwapRequest
  | PredictionRunParams.ReframeRequest
  | PredictionRunParams.BackgroundChangeRequest
  | PredictionRunParams.BackgroundRemoveRequest;

export declare namespace PredictionRunParams {
  export interface TryOnRequest {
    /**
     * Body param:
     */
    inputs: TryOnRequest.Inputs;

    /**
     * Body param: Virtual Try-On v1.6 enables realistic garment visualization using
     * just a single photo of a person and a garment
     */
    model_name: 'tryon-v1.6';

    /**
     * Query param: Optional webhook URL to receive completion notifications
     */
    webhook_url?: string;
  }

  export namespace TryOnRequest {
    export interface Inputs {
      /**
       * Reference image of the clothing item to be tried on the `model_image`. Base64
       * images must include the proper prefix (e.g.,
       * `data:image/jpg;base64,<YOUR_BASE64>`)
       */
      garment_image: string;

      /**
       * Primary image of the person on whom the virtual try-on will be performed. Models
       * Studio users can use their saved models by passing `saved:<model_name>`. Base64
       * images must include the proper prefix (e.g.,
       * `data:image/jpg;base64,<YOUR_BASE64>`)
       */
      model_image: string;

      /**
       * Use `auto` to enable automatic classification of the garment type. For flat-lay
       * or ghost mannequin images, the system detects the garment type automatically.
       * For on-model images, full-body shots default to a full outfit swap. For focused
       * shots (upper or lower body), the system selects the most likely garment type
       * (tops or bottoms).
       */
      category?: 'auto' | 'tops' | 'bottoms' | 'one-pieces';

      /**
       * Specifies the type of garment photo to optimize internal parameters for better
       * performance. `model` is for photos of garments on a model, `flat-lay` is for
       * flat-lay or ghost mannequin images, and `auto` attempts to automatically detect
       * the photo type.
       */
      garment_photo_type?: 'auto' | 'flat-lay' | 'model';

      /**
       * Specifies the mode of operation.
       *
       * - `performance` mode is faster but may compromise quality (5 seconds).
       * - `balanced` mode is a perfect middle ground between speed and quality (8
       *   seconds).
       * - `quality` mode is slower, but delivers the highest quality results (12–17
       *   seconds).
       */
      mode?: 'performance' | 'balanced' | 'quality';

      /**
       * Sets the content moderation level for garment images.
       *
       * - `conservative` enforces stricter modesty standards suitable for culturally
       *   sensitive contexts. Blocks underwear, swimwear, and revealing outfits.
       * - `permissive` allows swimwear, underwear, and revealing garments, while still
       *   blocking explicit nudity.
       * - `none` disables all content moderation.
       *
       * **This technology is designed for ethical virtual try-on applications.
       * Misuse—such as generating inappropriate imagery without consent—violates our
       * Terms of Service. Setting moderation_level: none does not remove your
       * responsibility for ethical and lawful use. Violations may result in service
       * denial.**
       */
      moderation_level?: 'conservative' | 'permissive' | 'none';

      /**
       * Number of images to generate in a single run. Image generation has a random
       * element in it, so trying multiple images at once increases the chances of
       * getting a good result.
       */
      num_samples?: number;

      /**
       * Specifies the desired output image format.
       *
       * - `png`: Delivers the highest quality image, ideal for use cases such as content
       *   creation where quality is paramount.
       * - `jpeg`: Provides a faster response with a slightly compressed image, more
       *   suitable for real-time applications like consumer virtual try-on experiences.
       */
      output_format?: 'png' | 'jpeg';

      /**
       * When set to `true`, the API will return the generated image as a base64-encoded
       * string instead of a CDN URL. The base64 string will be prefixed according to the
       * `output_format` (e.g., `data:image/png;base64,...` or
       * `data:image/jpeg;base64,...`). This option offers enhanced privacy as
       * user-generated outputs are not stored on our servers when `return_base64` is
       * enabled.
       */
      return_base64?: boolean;

      /**
       * Sets random operations to a fixed state. Use the same seed to reproduce results
       * with the same inputs, or different seed to force different results.
       */
      seed?: number;

      /**
       * Direct garment fitting without clothing segmentation, enabling bulkier garment
       * try-ons with improved preservation of body shape and skin texture. Set to
       * `false` if original garments are not removed properly.
       */
      segmentation_free?: boolean;
    }
  }

  export interface ProductToModelRequest {
    /**
     * Body param:
     */
    inputs: ProductToModelRequest.Inputs;

    /**
     * Body param: Product to Model endpoint transforms product images into people
     * wearing those products. It supports dual-mode operation: standard
     * product-to-model (generates new person) and try-on mode (adds product to
     * existing person)
     */
    model_name: 'product-to-model';

    /**
     * Query param: Optional webhook URL to receive completion notifications
     */
    webhook_url?: string;
  }

  export namespace ProductToModelRequest {
    export interface Inputs {
      /**
       * URL or base64 encoded image of the product to be worn. Supports clothing,
       * accessories, shoes, and other wearable fashion items. Base64 images must include
       * the proper prefix (e.g., data:image/jpg;base64,<YOUR_BASE64>)
       */
      product_image: string;

      /**
       * Desired aspect ratio for the output image. Only applies when `model_image` is
       * not provided (standard product-to-model mode).
       *
       * When `model_image` is provided (try-on mode), this parameter is ignored and the
       * output will match the `model_image`'s aspect ratio.
       *
       * **Default:** product_image's aspect ratio (standard mode only)
       */
      aspect_ratio?: '1:1' | '2:3' | '3:4' | '4:5' | '5:4' | '4:3' | '3:2' | '16:9' | '9:16';

      /**
       * URL or base64 encoded image of the person to wear the product. When provided,
       * enables try-on mode. When omitted, generates a new person wearing the product.
       * Base64 images must include the proper prefix (e.g.,
       * data:image/jpg;base64,<YOUR_BASE64>)
       */
      model_image?: string;

      /**
       * Specifies the desired output image format.
       *
       * - `png`: Delivers the highest quality image, ideal for use cases such as content
       *   creation where quality is paramount.
       * - `jpeg`: Provides a faster response with a slightly compressed image, more
       *   suitable for real-time applications.
       */
      output_format?: 'png' | 'jpeg';

      /**
       * Additional instructions for person appearance (when `model_image` is not
       * provided), styling preferences, or background.
       *
       * **Examples:** "man with tattoos", "tucked-in", "open jacket", "rolled-up
       * sleeves", "studio background", "professional office setting"
       *
       * **Default:** None
       */
      prompt?: string;

      /**
       * When set to `true`, the API will return the generated image as a base64-encoded
       * string instead of a CDN URL. The base64 string will be prefixed
       * `data:image/png;base64,....`
       *
       * This option offers enhanced privacy as user-generated outputs are not stored on
       * our servers when `return_base64` is enabled.
       */
      return_base64?: boolean;

      /**
       * Seed for reproducible results. Use the same seed to reproduce results with the
       * same inputs, or different seed to force different results. Must be between 0 and
       * 2^32-1.
       */
      seed?: number;
    }
  }

  export interface FaceToModelRequest {
    /**
     * Body param:
     */
    inputs: FaceToModelRequest.Inputs;

    /**
     * Body param: Face to Model endpoint transforms face images into try-on ready
     * upper-body avatars. It converts cropped headshots or selfies into full
     * upper-body representations that can be used in virtual try-on applications when
     * full-body photos are not available, while preserving facial identity.
     */
    model_name: 'face-to-model';

    /**
     * Query param: Optional webhook URL to receive completion notifications
     */
    webhook_url?: string;
  }

  export namespace FaceToModelRequest {
    export interface Inputs {
      /**
       * URL or base64 encoded image of the face to transform into an upper-body avatar.
       * The AI will analyze facial features, hair, and skin tone to create a
       * representation suitable for virtual try-on applications.
       *
       * Base64 images must include the proper prefix (e.g.,
       * data:image/jpg;base64,<YOUR_BASE64>)
       */
      face_image: string;

      /**
       * Desired aspect ratio for the output image. Only vertical ratios are supported.
       * Images will always be extended downward to fit the aspect ratio.
       *
       * **Default:** `2:3`
       */
      aspect_ratio?: '1:1' | '4:5' | '3:4' | '2:3' | '9:16';

      /**
       * Specifies the output image format.
       *
       * - `png` - PNG format, original quality
       * - `jpeg` - JPEG format, smaller file size
       *
       * **Default:** `"jpeg"`
       */
      output_format?: 'png' | 'jpeg';

      /**
       * Optional styling or body shape guidance for the avatar representation. Examples:
       * "athletic build", "curvy figure", "slender frame".
       *
       * If you don't provide a prompt, the body shape will be inferred from the face
       * image.
       *
       * **Default:** Empty string
       */
      prompt?: string;

      /**
       * When set to `true`, the API will return the generated image as a base64-encoded
       * string instead of a CDN URL. The base64 string will be prefixed
       * `data:image/png;base64,...`.
       *
       * This option offers enhanced privacy as user-generated outputs are not stored on
       * our servers when `return_base64` is enabled.
       *
       * **Default:** `false`
       */
      return_base64?: boolean;

      /**
       * Sets random operations to a fixed state. Use the same seed to reproduce results
       * with the same inputs, or different seed to force different results.
       */
      seed?: number;
    }
  }

  export interface ModelCreateRequest {
    /**
     * Body param:
     */
    inputs: ModelCreateRequest.Inputs;

    /**
     * Body param: Model creation endpoint
     */
    model_name: 'model-create';

    /**
     * Query param: Optional webhook URL to receive completion notifications
     */
    webhook_url?: string;
  }

  export namespace ModelCreateRequest {
    export interface Inputs {
      /**
       * Prompt for the model image generation. Describes the desired fashion model,
       * clothing, pose, and scene.
       */
      prompt: string;

      /**
       * Defines the width-to-height ratio of the generated image. This parameter
       * controls the canvas dimensions for text-only generation. When image_reference is
       * provided, the output inherits the reference image's aspect ratio and this
       * parameter is ignored.
       *
       * **Supported Resolutions**
       *
       * Each aspect ratio corresponds to a specific resolution optimized for ~1MP
       * output:
       *
       * | Aspect Ratio | Resolution  | Use Case                      |
       * | ------------ | ----------- | ----------------------------- |
       * | 1:1          | 1024 × 1024 | Square format, social media   |
       * | 2:3          | 832 × 1248  | Portrait, fashion photography |
       * | 3:4          | 880 × 1176  | Standard portrait             |
       * | 4:5          | 912 × 1144  | Instagram portrait            |
       * | 5:4          | 1144 × 912  | Landscape portrait            |
       * | 4:3          | 1176 × 880  | Traditional landscape         |
       * | 3:2          | 1176 × 784  | Wide landscape                |
       * | 16:9         | 1360 × 768  | Widescreen, banners           |
       * | 9:16         | 760 × 1360  | Vertical video format         |
       */
      aspect_ratio?: '1:1' | '2:3' | '3:4' | '4:5' | '5:4' | '4:3' | '3:2' | '16:9' | '9:16';

      /**
       * Disable prompt enhancement. When true, the prompt will be used as is, or a
       * default prompt will be used if no prompt is provided.
       */
      disable_prompt_enhancement?: boolean;

      /**
       * Optional reference image that guides the generation process. The model extracts
       * structural information from this image to control the output composition.
       *
       * Processing Behavior:
       *
       * - Aspect Ratio: Output automatically matches the reference image's dimensions.
       * - Guidance Type: Controlled by the reference_type parameter (pose or silhouette)
       * - Image Processing: Automatically resized while preserving aspect ratio
       *
       * Base64 images must include the proper prefix (e.g.,
       * data:image/jpg;base64,<YOUR_BASE64>)
       */
      image_reference?: string;

      /**
       * URL to a FLUX-based LoRA weights file (.safetensors) for custom identity
       * generation. When provided, the LoRA will be loaded and applied during generation
       * to maintain consistent character appearance across generations. Must be
       * FLUX-compatible LoRA weights in .safetensors format, under 256MB.
       */
      lora_url?: string;

      /**
       * Specifies the desired output image format.
       *
       * - `png`: Delivers the highest quality image, ideal for use cases such as content
       *   creation where quality is paramount.
       * - `jpeg`: Provides a faster response with a slightly compressed image, more
       *   suitable for real-time applications.
       */
      output_format?: 'png' | 'jpeg';

      /**
       * Type of reference to use when image_reference is provided.
       *
       * - `pose` matches the body position and stance from the reference image.
       * - `silhouette` matches the outline and shape from the reference image.
       *
       * **Default is applied only if image_reference is provided**
       */
      reference_type?: 'pose' | 'silhouette';

      /**
       * When set to `true`, the API will return the generated image as a base64-encoded
       * string instead of a CDN URL. The base64 string will be prefixed according to the
       * `output_format` (e.g., `data:image/png;base64,...` or
       * `data:image/jpeg;base64,...`). This option offers enhanced privacy as
       * user-generated outputs are not stored on our servers when `return_base64` is
       * enabled.
       */
      return_base64?: boolean;

      /**
       * Random seed for reproducible results
       */
      seed?: number;
    }
  }

  export interface ModelVariationRequest {
    /**
     * Body param:
     */
    inputs: ModelVariationRequest.Inputs;

    /**
     * Body param: Model variation endpoint for creating variations from existing model
     * images
     */
    model_name: 'model-variation';

    /**
     * Query param: Optional webhook URL to receive completion notifications
     */
    webhook_url?: string;
  }

  export namespace ModelVariationRequest {
    export interface Inputs {
      /**
       * Source fashion model image to create variations from. The variation will
       * maintain the core composition while introducing controlled modifications. Base64
       * images must include the proper prefix (e.g.,
       * data:image/jpg;base64,<YOUR_BASE64>)
       */
      model_image: string;

      /**
       * URL to a FLUX-based LoRA weights file (.safetensors) for custom identity
       * generation. When provided, the LoRA will be loaded and applied during generation
       * to maintain consistent character appearance across generations. Must be
       * FLUX-compatible LoRA weights in .safetensors format, under 256MB.
       */
      lora_url?: string;

      /**
       * Specifies the desired output image format.
       *
       * - `png`: Delivers the highest quality image, ideal for use cases such as content
       *   creation where quality is paramount.
       * - `jpeg`: Provides a faster response with a slightly compressed image, more
       *   suitable for real-time applications.
       */
      output_format?: 'png' | 'jpeg';

      /**
       * When set to `true`, the API will return the generated image as a base64-encoded
       * string instead of a CDN URL. The base64 string will be prefixed according to the
       * `output_format` (e.g., `data:image/png;base64,...` or
       * `data:image/jpeg;base64,...`). This option offers enhanced privacy as
       * user-generated outputs are not stored on our servers when `return_base64` is
       * enabled.
       */
      return_base64?: boolean;

      /**
       * Sets random operations to a fixed state. Use the same seed to reproduce results
       * with the same inputs, or different seed to force different results.
       */
      seed?: number;

      /**
       * Controls the intensity of variations applied to the source image.
       *
       * - `subtle` - Minor adjustments that preserve most of the original
       *   characteristics while introducing small variations.
       * - `strong` - More significant modifications that create noticeable differences
       *   while maintaining the core composition.
       */
      variation_strength?: 'subtle' | 'strong';
    }
  }

  export interface ModelSwapRequest {
    /**
     * Body param:
     */
    inputs: ModelSwapRequest.Inputs;

    /**
     * Body param: Model swap endpoint for transforming model identity while preserving
     * clothing and pose
     */
    model_name: 'model-swap';

    /**
     * Query param: Optional webhook URL to receive completion notifications
     */
    webhook_url?: string;
  }

  export namespace ModelSwapRequest {
    export interface Inputs {
      /**
       * Source fashion model image containing the clothing and pose to preserve. The
       * model's identity (face, skin tone, hair) will be transformed while keeping the
       * outfit exactly as shown. Base64 images must include the proper prefix (e.g.,
       * data:image/jpg;base64,<YOUR_BASE64>)
       */
      model_image: string;

      /**
       * Controls whether the background should be modified according to the prompt or
       * preserved from the original image. When enabled, include background descriptions
       * in your prompt.
       *
       * - `true` - Background will be changed according to the prompt description.
       * - `false` - Original background will be preserved exactly as in the source
       *   image.
       */
      background_change?: boolean;

      /**
       * Disable prompt enhancement. When true, the prompt will be used exactly as
       * provided, or a default prompt will be used if no prompt is provided.
       */
      disable_prompt_enhancement?: boolean;

      /**
       * URL to a FLUX-based LoRA weights file (.safetensors) for custom identity
       * generation. When provided, the LoRA will be loaded and applied during generation
       * to maintain consistent character appearance across generations. Must be
       * FLUX-compatible LoRA weights in .safetensors format, under 256MB.
       */
      lora_url?: string;

      /**
       * Specifies the desired output image format.
       *
       * - `png`: Delivers the highest quality image, ideal for use cases such as content
       *   creation where quality is paramount.
       * - `jpeg`: Provides a faster response with a slightly compressed image, more
       *   suitable for real-time applications.
       */
      output_format?: 'png' | 'jpeg';

      /**
       * Description of the desired model identity transformation. Specify ethnicity,
       * facial features, hair color, and other physical characteristics.
       *
       * **Default: Empty string (Random identity change)**
       */
      prompt?: string;

      /**
       * When set to `true`, the API will return the generated image as a base64-encoded
       * string instead of a CDN URL. The base64 string will be prefixed according to the
       * `output_format` (e.g., `data:image/png;base64,...` or
       * `data:image/jpeg;base64,...`). This option offers enhanced privacy as
       * user-generated outputs are not stored on our servers when `return_base64` is
       * enabled.
       */
      return_base64?: boolean;

      /**
       * Sets random operations to a fixed state. Use the same seed to reproduce results
       * with the same inputs, or different seed to force different results.
       */
      seed?: number;
    }
  }

  export interface ReframeRequest {
    /**
     * Body param:
     */
    inputs: ReframeRequest.Inputs;

    /**
     * Body param: Image reframing endpoint
     */
    model_name: 'reframe';

    /**
     * Query param: Optional webhook URL to receive completion notifications
     */
    webhook_url?: string;
  }

  export namespace ReframeRequest {
    export interface Inputs {
      /**
       * Source image to extend or reframe. The AI will intelligently generate new
       * content to expand the image based on the selected mode and parameters.
       *
       * Resolution Handling: Output resolution is limited to 1MP. If your image is
       * already at or above this size, it will be downsampled so that, after any
       * extensions are applied, the final result fits within the 1MP limit.
       *
       * Base64 Format: Base64 images must include the proper prefix (e.g.,
       * data:image/jpg;base64,<YOUR_BASE64>)
       */
      image: string;

      /**
       * Selects the reframing operation mode.
       *
       * - `direction` - Directed zoom-out: extend image in specific directions to reveal
       *   more content.
       * - `aspect_ratio` - Canvas adjustment: transform image to match a target aspect
       *   ratio.
       *
       * **Note: direction mode requires target_direction, aspect_ratio mode requires
       * target_aspect_ratio.**"
       */
      mode?: 'direction' | 'aspect_ratio';

      /**
       * Specifies the desired output image format.
       *
       * - `png`: Delivers the highest quality image, ideal for use cases such as content
       *   creation where quality is paramount.
       * - `jpeg`: Provides a faster response with a slightly compressed image, more
       *   suitable for real-time applications.
       */
      output_format?: 'png' | 'jpeg';

      /**
       * When set to `true`, the API will return the generated image as a base64-encoded
       * string instead of a CDN URL. The base64 string will be prefixed according to the
       * `output_format` (e.g., `data:image/png;base64,...` or
       * `data:image/jpeg;base64,...`). This option offers enhanced privacy as
       * user-generated outputs are not stored on our servers when `return_base64` is
       * enabled.
       */
      return_base64?: boolean;

      /**
       * Sets random operations to a fixed state. Use the same seed to reproduce results
       * with the same inputs, or different seed to force different results.
       */
      seed?: number;

      /**
       * Target aspect ratio for the output canvas when using mode: 'aspect_ratio'. This
       * parameter is ignored when mode: 'direction'.
       *
       * **Supported Aspect Ratios**
       *
       * Each aspect ratio corresponds to a specific resolution optimized for ~1MP
       * output:
       *
       * | Aspect Ratio | Resolution  | Use Case                      |
       * | ------------ | ----------- | ----------------------------- |
       * | 1:1          | 1024 × 1024 | Square format, social media   |
       * | 2:3          | 832 × 1248  | Portrait, fashion photography |
       * | 3:2          | 1248 × 832  | Standard landscape            |
       * | 3:4          | 880 × 1176  | Standard portrait             |
       * | 4:3          | 1176 × 880  | Traditional landscape         |
       * | 4:5          | 912 × 1144  | Instagram portrait            |
       * | 5:4          | 1144 × 912  | Instagram landscape           |
       * | 9:16         | 760 × 1360  | Vertical video format         |
       * | 16:9         | 1360 × 760  | Horizontal video format       |
       */
      target_aspect_ratio?: '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9';

      /**
       * Direction of image extension when using mode: 'direction'. This parameter is
       * ignored when mode: 'aspect_ratio'.
       *
       * - `both` - Expand in both directions (zoom out effect).
       * - `down` - Expand only downward (reveal lower content, e.g., show full body from
       *   upper body shot).
       * - `up` - Expand only upward (reveal upper content, e.g., show face from headless
       *   shot).
       */
      target_direction?: 'both' | 'down' | 'up';
    }
  }

  export interface BackgroundChangeRequest {
    /**
     * Body param:
     */
    inputs: BackgroundChangeRequest.Inputs;

    /**
     * Body param: Background change endpoint
     */
    model_name: 'background-change';

    /**
     * Query param: Optional webhook URL to receive completion notifications
     */
    webhook_url?: string;
  }

  export namespace BackgroundChangeRequest {
    export interface Inputs {
      /**
       * Source image containing the subject to preserve. The AI will automatically
       * detect and separate the foreground subject from the background. Base64 images
       * must include the proper prefix (e.g., data:image/jpg;base64,<YOUR_BASE64>)
       */
      image: string;

      /**
       * Description of the desired new background (e.g., 'beach sunset', 'modern
       * office', 'forest clearing'). The AI generates a new background based on this
       * description and harmonizes it with the preserved foreground subject.
       */
      prompt: string;

      /**
       * Disable prompt enhancement for the background description. When `true`, the
       * background prompt will be used exactly as provided.
       */
      disable_prompt_enhancement?: boolean;

      /**
       * Specifies the output image format.
       *
       * - `png`: Delivers the highest quality image, ideal for use cases such as content
       *   creation where quality is paramount.
       * - `jpeg`: Provides a faster response with a slightly compressed image, more
       *   suitable for real-time applications.
       */
      output_format?: 'png' | 'jpeg';

      /**
       * When set to `true`, the API will return the generated image as a base64-encoded
       * string instead of a CDN URL. The base64 string will be prefixed according to the
       * `output_format` (e.g., `data:image/png;base64,...` or
       * `data:image/jpeg;base64,...`). This option offers enhanced privacy as
       * user-generated outputs are not stored on our servers when `return_base64` is
       * enabled.
       */
      return_base64?: boolean;

      /**
       * Sets random operations to a fixed state. Use the same seed to reproduce results
       * with the same inputs, or different seed to force different results.
       */
      seed?: number;
    }
  }

  export interface BackgroundRemoveRequest {
    /**
     * Body param:
     */
    inputs: BackgroundRemoveRequest.Inputs;

    /**
     * Body param: Background removal endpoint
     */
    model_name: 'background-remove';

    /**
     * Query param: Optional webhook URL to receive completion notifications
     */
    webhook_url?: string;
  }

  export namespace BackgroundRemoveRequest {
    export interface Inputs {
      /**
       * Source image to remove the background from. The AI will automatically detect the
       * main subject and create a clean cutout with transparent background. Base64
       * images must include the proper prefix (e.g.,
       * data:image/jpg;base64,<YOUR_BASE64>)
       */
      image: string;

      /**
       * When set to `true`, the API will return the generated image as a base64-encoded
       * string instead of a CDN URL. The base64 string will be prefixed
       * `data:image/png;base64,...`. This option offers enhanced privacy as
       * user-generated outputs are not stored on our servers when `return_base64` is
       * enabled.
       */
      return_base64?: boolean;
    }
  }
}

export type PredictionSubscribeParams = PredictionRunParams & {
  /**
   * The interval in milliseconds to poll the status of the prediction.
   * @default 1000 (1 second)
   */
  pollInterval?: number;

  /**
   * The timeout in milliseconds to cancel the prediction.
   * @default 300000 (5 minutes)
   */
  timeout?: number;

  /**
   * The maximum number of times that the client will retry the status polling request.
   * @default 3
   */
  maxRetries?: number;

  /**
   * A callback function that is called when the prediction is enqueued.
   */
  onEnqueued?: (requestId: string) => void;

  /**
   * A callback function that is called when the prediction is updated.
   */
  onQueueUpdate?: (status: PredictionStatusResponse) => void;
};

export interface PredictionSubscribeResponse extends Omit<PredictionStatusResponse, 'status'> {
  /**
   * Current status of the prediction - only terminal states since subscribe() waits for completion
   */
  status: 'completed' | 'failed' | 'canceled' | 'time_out';
}

export declare namespace Predictions {
  export {
    type PredictionRunResponse as PredictionRunResponse,
    type PredictionStatusResponse as PredictionStatusResponse,
    type PredictionRunParams as PredictionRunParams,
    type PredictionSubscribeParams as PredictionSubscribeParams,
    type PredictionSubscribeResponse as PredictionSubscribeResponse,
  };
}
