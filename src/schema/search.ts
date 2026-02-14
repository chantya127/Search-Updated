import { z } from 'zod';

/*
 * ═══════════════════════════════════════════════════════════
 *  SINGLE SOURCE OF TRUTH — All schemas and types live here
 * ═══════════════════════════════════════════════════════════
 *
 *  Every data shape in the app is defined ONCE as a Zod schema.
 *  TypeScript types are auto-generated via z.infer<>.
 *
 *  ┌───────────────┐     ┌───────────────────┐     ┌────────────────┐
 *  │ Client sends  │ ──► │ OUR API processes  │ ──► │ Client gets    │
 *  │ request       │     │ data               │     │ response       │
 *  │               │     │                    │     │                │
 *  │ SearchRequest │     │ UnbxdProduct       │     │ SearchResponse │
 *  │ Schema        │     │ Schema             │     │ Schema         │
 *  └───────────────┘     └───────────────────┘     └────────────────┘
 */


export const UnbxdProductSchema = z.object({
    uniqueId: z.string(),
    title: z.string(),
    sellingPrice: z.number(),
    imageUrl: z.array(z.string()),
    availability: z.string(),
    category: z.array(z.string()),
    badges_unx: z.array(z.string()).optional(),
    variantId: z.string().optional(),
    urlKey: z.string(),
    exclusivePrice: z.number(),
    images: z.array(z.string()),
    imageGallery: z.array(z.string()),
    gender: z.string(),
});

export type UnbxdProduct = z.infer<typeof UnbxdProductSchema>;


export const UnbxdApiResponseSchema = z.object({
    response: z.object({
        products: z.array(UnbxdProductSchema),
        numberOfProducts: z.number(),
    }),
    facets: z.any(),
    didYouMean: z.array(z.object({ suggestion: z.string() })).optional(),
});

export type UnbxdApiResponse = z.infer<typeof UnbxdApiResponseSchema>;


// ═══════════════════════════════════════════════════════════
//  REQUEST SCHEMA — What the client sends to us
// ═══════════════════════════════════════════════════════════

export const SearchRequestSchema = z.object({
    keyword: z.string(),
    page: z.number().int().min(1),
    offset: z.number().int().min(1).max(100),
    sort: z.string().optional(),
    filters: z.record(z.string(),
        z.union([
            z.string(),
            z.array(z.string()),
            z.array(z.number()),
        ])
    ).optional(),
});

export type SearchRequestBody = z.infer<typeof SearchRequestSchema>;


// ═══════════════════════════════════════════════════════════
//  RESPONSE SCHEMAS — What we send back to the client
// ═══════════════════════════════════════════════════════════

export const TransformedProductSchema = z.object({
    id: z.string(),
    title: z.string(),
    selling_price: z.number(),
    imageUrl: z.string().optional(),
    is_in_stock: z.string(),
    category: z.array(z.string()),
    product_slug: z.string(),
    exclusive_price: z.number(),
    images: z.array(z.string()).optional(),
    imageGallery: z.array(z.string()).optional(),
    gender_type: z.number(),
}).partial();

export type TransformedProduct = z.infer<typeof TransformedProductSchema>;


export const SearchResponseSchema = z.object({
    products: z.array(TransformedProductSchema),
    filters: z.any(),
    numberOfProducts: z.number(),
    didYouMean: z.string(),
    searchTerm: z.string(),
    empty_result_text: z.string(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;