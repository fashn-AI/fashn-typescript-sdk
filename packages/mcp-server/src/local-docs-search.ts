// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import MiniSearch from 'minisearch';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { getLogger } from './logger';

type MethodEntry = {
  name: string;
  endpoint: string;
  httpMethod: string;
  summary: string;
  description: string;
  stainlessPath: string;
  qualified: string;
  params?: string[];
  response?: string;
  markdown?: string;
};

type ProseChunk = {
  content: string;
  tag: string;
  sectionContext?: string;
  source?: string;
};

type MiniSearchDocument = {
  id: string;
  kind: 'http_method' | 'prose';
  name?: string;
  endpoint?: string;
  summary?: string;
  description?: string;
  qualified?: string;
  stainlessPath?: string;
  content?: string;
  sectionContext?: string;
  _original: Record<string, unknown>;
};

type SearchResult = {
  results: (string | Record<string, unknown>)[];
};

const EMBEDDED_METHODS: MethodEntry[] = [
  {
    name: 'run',
    endpoint: '/v1/run',
    httpMethod: 'post',
    summary: 'Create a new prediction',
    description:
      'Submit a prediction request for AI-powered fashion processing. Supports multiple model types including:\n- Try-on max (tryon-max)\n- Virtual try-on v1.6 (tryon-v1.6)\n- Model creation (model-create)\n- Model swap (model-swap)\n- Product to model (product-to-model)\n- Face to model (face-to-model)\n- Background operations (background-remove, background-change)\n- Image reframing (reframe)\n- Image to video (image-to-video)\n- Image editing (edit)\n\nAll requests use the versioned format with model_name and inputs structure.\n',
    stainlessPath: '(resource) predictions > (method) run',
    qualified: 'client.predictions.run',
    params: [
      "body: { inputs: { model_image: string; product_image: string; aspect_ratio?: '21:9' | '1:1' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '3:4' | '16:9' | '9:16'; generation_mode?: 'balanced' | 'quality'; num_images?: number; output_format?: 'png' | 'jpeg'; prompt?: string; resolution?: '1k' | '2k' | '4k'; return_base64?: boolean; seed?: number; }; model_name: 'tryon-max'; } | { inputs: { garment_image: string; model_image: string; category?: 'auto' | 'tops' | 'bottoms' | 'one-pieces'; garment_photo_type?: 'auto' | 'flat-lay' | 'model'; mode?: 'performance' | 'balanced' | 'quality'; moderation_level?: 'conservative' | 'permissive' | 'none'; num_samples?: number; output_format?: 'png' | 'jpeg'; return_base64?: boolean; seed?: number; segmentation_free?: boolean; }; model_name: 'tryon-v1.6'; } | { inputs: { product_image: string; aspect_ratio?: '1:1' | '2:3' | '3:4' | '4:5' | '5:4' | '4:3' | '3:2' | '16:9' | '9:16'; generation_mode?: 'fast' | 'balanced' | 'quality'; image_prompt?: string; model_image?: string; output_format?: 'png' | 'jpeg'; prompt?: string; resolution?: '1k' | '2k' | '4k'; return_base64?: boolean; seed?: number; }; model_name: 'product-to-model'; } | { inputs: { face_image: string; aspect_ratio?: '1:1' | '4:5' | '3:4' | '2:3' | '9:16'; generation_mode?: 'fast' | 'balanced' | 'quality'; num_images?: number; output_format?: 'png' | 'jpeg'; prompt?: string; resolution?: '1k' | '2k' | '4k'; return_base64?: boolean; seed?: number; }; model_name: 'face-to-model'; } | { inputs: { prompt: string; aspect_ratio?: '1:1' | '2:3' | '3:4' | '4:5' | '5:4' | '4:3' | '3:2' | '16:9' | '9:16'; face_reference?: string; face_reference_mode?: 'match_base' | 'match_reference'; generation_mode?: 'fast' | 'balanced' | 'quality'; image_reference?: string; num_images?: number; output_format?: 'png' | 'jpeg'; resolution?: '1k' | '2k' | '4k'; return_base64?: boolean; seed?: number; }; model_name: 'model-create'; } | { inputs: { model_image: string; aspect_ratio?: '21:9' | '1:1' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '3:4' | '16:9' | '9:16'; face_reference?: string; face_reference_mode?: 'match_base' | 'match_reference'; generation_mode?: 'fast' | 'balanced' | 'quality'; num_images?: number; output_format?: 'png' | 'jpeg'; prompt?: string; resolution?: '1k' | '2k' | '4k'; return_base64?: boolean; seed?: number; }; model_name: 'model-swap'; } | { inputs: { aspect_ratio: '21:9' | '1:1' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '3:4' | '16:9' | '9:16'; image: string; generation_mode?: 'fast' | 'balanced' | 'quality'; num_images?: number; output_format?: 'png' | 'jpeg'; return_base64?: boolean; seed?: number; }; model_name: 'reframe'; } | { inputs: { image: string; prompt: string; generation_mode?: 'fast' | 'balanced' | 'quality'; num_images?: number; output_format?: 'png' | 'jpeg'; resolution?: '1k' | '2k' | '4k'; return_base64?: boolean; seed?: number; }; model_name: 'background-change'; } | { inputs: { image: string; return_base64?: boolean; }; model_name: 'background-remove'; } | { inputs: { image: string; duration?: 5 | 10; negative_prompt?: string; prompt?: string; resolution?: '480p' | '720p' | '1080p'; seed?: number; }; model_name: 'image-to-video'; } | { inputs: { image: string; prompt: string; aspect_ratio?: '21:9' | '1:1' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '3:4' | '16:9' | '9:16'; generation_mode?: 'fast' | 'balanced' | 'quality'; image_context?: string; mask?: string; num_images?: number; output_format?: 'png' | 'jpeg'; resolution?: '1k' | '2k' | '4k'; return_base64?: boolean; seed?: number; }; model_name: 'edit'; };",
      'webhook_url?: string;',
    ],
    response: '{ id: string; error: string; }',
  },
  {
    name: 'status',
    endpoint: '/v1/status/{id}',
    httpMethod: 'get',
    summary: 'Get prediction status',
    description:
      'Poll for the status of a specific prediction using its ID. Use this endpoint to track prediction progress and retrieve results.\n\n**Status States:**\n- `starting` - Prediction is being initialized\n- `in_queue` - Prediction is waiting to be processed  \n- `processing` - Model is actively generating your result\n- `completed` - Generation finished successfully, output available\n- `failed` - Generation failed, check error details\n\n**Output Availability:**\n- **CDN URLs** (default): Available for 72 hours after completion\n- **Base64 outputs** (when `return_base64: true`): Available for 60 minutes after completion\n',
    stainlessPath: '(resource) predictions > (method) status',
    qualified: 'client.predictions.status',
    params: ['id: string;'],
    response:
      "{ id: string; error: { message: string; name: string; }; status: 'starting' | 'in_queue' | 'processing' | 'completed' | 'failed' | 'canceled' | 'time_out'; output?: string[] | string[]; }",
    markdown:
      "## status\n\n`client.predictions.status(id: string): { id: string; error: object; status: 'starting' | 'in_queue' | 'processing' | 'completed' | 'failed' | 'canceled' | 'time_out'; output?: string[] | string[]; }`\n\n**get** `/v1/status/{id}`\n\nPoll for the status of a specific prediction using its ID. Use this endpoint to track prediction progress and retrieve results.\n\n**Status States:**\n- `starting` - Prediction is being initialized\n- `in_queue` - Prediction is waiting to be processed  \n- `processing` - Model is actively generating your result\n- `completed` - Generation finished successfully, output available\n- `failed` - Generation failed, check error details\n\n**Output Availability:**\n- **CDN URLs** (default): Available for 72 hours after completion\n- **Base64 outputs** (when `return_base64: true`): Available for 60 minutes after completion\n\n\n### Parameters\n\n- `id: string`\n\n### Returns\n\n- `{ id: string; error: { message: string; name: string; }; status: 'starting' | 'in_queue' | 'processing' | 'completed' | 'failed' | 'canceled' | 'time_out'; output?: string[] | string[]; }`\n\n  - `id: string`\n  - `error: { message: string; name: string; }`\n  - `status: 'starting' | 'in_queue' | 'processing' | 'completed' | 'failed' | 'canceled' | 'time_out'`\n  - `output?: string[] | string[]`\n\n### Example\n\n```typescript\nimport Fashn from 'fashn';\n\nconst client = new Fashn();\n\nconst response = await client.predictions.status('123a87r9-4129-4bb3-be18-9c9fb5bd7fc1-u1');\n\nconsole.log(response);\n```",
  },
];

const INDEX_OPTIONS = {
  fields: [
    'name',
    'endpoint',
    'summary',
    'description',
    'qualified',
    'stainlessPath',
    'content',
    'sectionContext',
  ],
  storeFields: ['kind', '_original'],
  searchOptions: {
    prefix: true,
    fuzzy: 0.2,
    boost: {
      name: 3,
      endpoint: 2,
      summary: 2,
      qualified: 2,
      content: 1,
    } as Record<string, number>,
  },
};

/**
 * Self-contained local search engine backed by MiniSearch.
 * Method data is embedded at SDK build time; prose documents
 * can be loaded from an optional docs directory at runtime.
 */
export class LocalDocsSearch {
  private methodIndex: MiniSearch<MiniSearchDocument>;
  private proseIndex: MiniSearch<MiniSearchDocument>;

  private constructor() {
    this.methodIndex = new MiniSearch<MiniSearchDocument>(INDEX_OPTIONS);
    this.proseIndex = new MiniSearch<MiniSearchDocument>(INDEX_OPTIONS);
  }

  static async create(opts?: { docsDir?: string }): Promise<LocalDocsSearch> {
    const instance = new LocalDocsSearch();
    instance.indexMethods(EMBEDDED_METHODS);
    if (opts?.docsDir) {
      await instance.loadDocsDirectory(opts.docsDir);
    }
    return instance;
  }

  // Note: Language is accepted for interface consistency with remote search, but currently has no
  // effect since this local search only supports TypeScript docs.
  search(props: {
    query: string;
    language?: string;
    detail?: string;
    maxResults?: number;
    maxLength?: number;
  }): SearchResult {
    const { query, detail = 'default', maxResults = 5, maxLength = 100_000 } = props;

    const useMarkdown = detail === 'verbose' || detail === 'high';

    // Search both indices and merge results by score
    const methodHits = this.methodIndex
      .search(query)
      .map((hit) => ({ ...hit, _kind: 'http_method' as const }));
    const proseHits = this.proseIndex.search(query).map((hit) => ({ ...hit, _kind: 'prose' as const }));
    const merged = [...methodHits, ...proseHits].sort((a, b) => b.score - a.score);
    const top = merged.slice(0, maxResults);

    const fullResults: (string | Record<string, unknown>)[] = [];

    for (const hit of top) {
      const original = (hit as Record<string, unknown>)['_original'];
      if (hit._kind === 'http_method') {
        const m = original as MethodEntry;
        if (useMarkdown && m.markdown) {
          fullResults.push(m.markdown);
        } else {
          fullResults.push({
            method: m.qualified,
            summary: m.summary,
            description: m.description,
            endpoint: `${m.httpMethod.toUpperCase()} ${m.endpoint}`,
            ...(m.params ? { params: m.params } : {}),
            ...(m.response ? { response: m.response } : {}),
          });
        }
      } else {
        const c = original as ProseChunk;
        fullResults.push({
          content: c.content,
          ...(c.source ? { source: c.source } : {}),
        });
      }
    }

    let totalLength = 0;
    const results: (string | Record<string, unknown>)[] = [];
    for (const result of fullResults) {
      const len = typeof result === 'string' ? result.length : JSON.stringify(result).length;
      totalLength += len;
      if (totalLength > maxLength) break;
      results.push(result);
    }

    if (results.length < fullResults.length) {
      results.unshift(`Truncated; showing ${results.length} of ${fullResults.length} results.`);
    }

    return { results };
  }

  private indexMethods(methods: MethodEntry[]): void {
    const docs: MiniSearchDocument[] = methods.map((m, i) => ({
      id: `method-${i}`,
      kind: 'http_method' as const,
      name: m.name,
      endpoint: m.endpoint,
      summary: m.summary,
      description: m.description,
      qualified: m.qualified,
      stainlessPath: m.stainlessPath,
      _original: m as unknown as Record<string, unknown>,
    }));
    if (docs.length > 0) {
      this.methodIndex.addAll(docs);
    }
  }

  private async loadDocsDirectory(docsDir: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(docsDir, { withFileTypes: true });
    } catch (err) {
      getLogger().warn({ err, docsDir }, 'Could not read docs directory');
      return;
    }

    const files = entries
      .filter((e) => e.isFile())
      .filter((e) => e.name.endsWith('.md') || e.name.endsWith('.markdown') || e.name.endsWith('.json'));

    for (const file of files) {
      try {
        const filePath = path.join(docsDir, file.name);
        const content = await fs.readFile(filePath, 'utf-8');

        if (file.name.endsWith('.json')) {
          const texts = extractTexts(JSON.parse(content));
          if (texts.length > 0) {
            this.indexProse(texts.join('\n\n'), file.name);
          }
        } else {
          this.indexProse(content, file.name);
        }
      } catch (err) {
        getLogger().warn({ err, file: file.name }, 'Failed to index docs file');
      }
    }
  }

  private indexProse(markdown: string, source: string): void {
    const chunks = chunkMarkdown(markdown);
    const baseId = this.proseIndex.documentCount;

    const docs: MiniSearchDocument[] = chunks.map((chunk, i) => ({
      id: `prose-${baseId + i}`,
      kind: 'prose' as const,
      content: chunk.content,
      ...(chunk.sectionContext != null ? { sectionContext: chunk.sectionContext } : {}),
      _original: { ...chunk, source } as unknown as Record<string, unknown>,
    }));

    if (docs.length > 0) {
      this.proseIndex.addAll(docs);
    }
  }
}

/** Lightweight markdown chunker — splits on headers, chunks by word count. */
function chunkMarkdown(markdown: string): { content: string; tag: string; sectionContext?: string }[] {
  // Strip YAML frontmatter
  const stripped = markdown.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const lines = stripped.split('\n');

  const chunks: { content: string; tag: string; sectionContext?: string }[] = [];
  const headers: string[] = [];
  let current: string[] = [];

  const flush = () => {
    const text = current.join('\n').trim();
    if (!text) return;
    const sectionContext = headers.length > 0 ? headers.join(' > ') : undefined;
    // Split into ~200-word chunks
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length; i += 200) {
      const slice = words.slice(i, i + 200).join(' ');
      if (slice) {
        chunks.push({ content: slice, tag: 'p', ...(sectionContext != null ? { sectionContext } : {}) });
      }
    }
    current = [];
  };

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headerMatch) {
      flush();
      const level = headerMatch[1]!.length;
      const text = headerMatch[2]!.trim();
      while (headers.length >= level) headers.pop();
      headers.push(text);
    } else {
      current.push(line);
    }
  }
  flush();

  return chunks;
}

/** Recursively extracts string values from a JSON structure. */
function extractTexts(data: unknown, depth = 0): string[] {
  if (depth > 10) return [];
  if (typeof data === 'string') return data.trim() ? [data] : [];
  if (Array.isArray(data)) return data.flatMap((item) => extractTexts(item, depth + 1));
  if (typeof data === 'object' && data !== null) {
    return Object.values(data).flatMap((v) => extractTexts(v, depth + 1));
  }
  return [];
}
