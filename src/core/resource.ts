// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { Fashn } from '../client';

export abstract class APIResource {
  protected _client: Fashn;

  constructor(client: Fashn) {
    this._client = client;
  }
}
