// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { FashnSDK } from '../client';

export abstract class APIResource {
  protected _client: FashnSDK;

  constructor(client: FashnSDK) {
    this._client = client;
  }
}
