// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';
import { APIConnectionTimeoutError } from '../core/error';

const DEFAULT_POLL_INTERVAL = 1000;
const DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export class Predictions extends APIResource {
  /**
   * Submit a prediction request for AI-powered fashion processing. Supports multiple
   * model types including:
   *
   * - Virtual try-on (tryon-v1.6)
   * - Model creation (model-create)
   * - Model variation (model-variation)
   * - Model swap (model-swap)
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
   * polling when prediction reaches a terminal state (`completed`, `failed`, etc.).
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
   * ```
   */
  async subscribe(body: RunSubscribeParams, options?: RequestOptions): Promise<PredictionStatusResponse> {
    const response = await this._client.predictions.run(body, options);

    if (body.onEnqueued) body.onEnqueued(response.id);

    return this.subscribeToStatus(response.id, body, options);
  }

  private subscribeToStatus(
    id: string,
    body: RunSubscribeParams,
    options?: RequestOptions,
  ): Promise<PredictionStatusResponse> {
    return new Promise((resolve, reject) => {
      const pollInterval = body.pollInterval ?? DEFAULT_POLL_INTERVAL;
      const timeout = body.timeout ?? DEFAULT_TIMEOUT;

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
          const status = await this._client.predictions.status(id, options);
          if (body.onQueueUpdate) {
            body.onQueueUpdate(status);
          }

          if (
            status.status !== 'starting' &&
            status.status !== 'in_queue' &&
            status.status !== 'processing'
          ) {
            clearScheduledTasks();
            return resolve(status);
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
     * - _Cause_: Pipeline cannot load model/garment/reference image
     * - _Solution_: For URLs - ensure public accessibility and correct Content-Type
     *   headers. For Base64 - include proper data:image/format;base64 prefix
     *
     * **ContentModerationError** - Prohibited content detected (try-on models only)
     *
     * - _Cause_: Content moderation flagged garment image
     * - _Solution_: Adjust moderation_level to 'permissive' or 'none' if appropriate
     *   for your use case
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
       * | 3:4          | 880 × 1176  | Standard portrait             |
       * | 4:5          | 912 × 1144  | Instagram portrait            |
       * | 9:16         | 760 × 1360  | Vertical video format         |
       * | 4:3          | 1176 × 880  | Traditional landscape         |
       */
      target_aspect_ratio?: '1:1' | '2:3' | '3:4' | '4:5' | '5:4' | '4:3' | '3:2' | '16:9' | '9:16';

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
       * Text description of the desired background environment. The AI generates a new
       * background based on this description and harmonizes it with the preserved
       * foreground subject."
       *
       * **Default: Empty string (Natural background for the subject)**
       */
      background_prompt?: string;

      /**
       * Disable prompt enhancement for the background description. When `true`, the
       * background prompt will be used exactly as provided.
       */
      disable_prompt_enhancement?: boolean;

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

export type RunSubscribeParams = PredictionRunParams & {
  /**
   * The interval in milliseconds to poll the status of the prediction.
   */
  pollInterval?: number;

  /**
   * The timeout in milliseconds to cancel the prediction.
   */
  timeout?: number;

  /**
   * A callback function that is called when the prediction is enqueued.
   */
  onEnqueued?: (requestId: string) => void;

  /**
   * A callback function that is called when the prediction is updated.
   */
  onQueueUpdate?: (status: PredictionStatusResponse) => void;
};

export interface PredictionSubscribeResponse extends PredictionStatusResponse {}

export declare namespace Predictions {
  export {
    type PredictionRunResponse as PredictionRunResponse,
    type PredictionStatusResponse as PredictionStatusResponse,
    type PredictionRunParams as PredictionRunParams,
  };
}
