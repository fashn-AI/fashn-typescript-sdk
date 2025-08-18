// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Status extends APIResource {
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
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<StatusRetrieveResponse> {
    return this._client.get(path`/v1/status/${id}`, options);
  }
}

export interface StatusRetrieveResponse {
  /**
   * The unique prediction ID
   */
  id: string;

  /**
   * Structured error object with name and message fields
   */
  error: StatusRetrieveResponse.Error | null;

  /**
   * Current status of the prediction
   */
  status: 'starting' | 'in_queue' | 'processing' | 'completed' | 'failed' | 'canceled' | 'time_out';

  /**
   * Generated images - format depends on original request's return_base64 setting
   */
  output?: Array<string> | Array<string> | null;
}

export namespace StatusRetrieveResponse {
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

export declare namespace Status {
  export { type StatusRetrieveResponse as StatusRetrieveResponse };
}
