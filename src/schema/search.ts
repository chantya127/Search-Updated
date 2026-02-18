import { array, z } from 'zod';

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
    urlKey: z.string(),
    exclusivePrice: z.number(),
    images: z.array(z.string()),
    imageGallery: z.array(z.string()),
    gender: z.string(),
    brand: z.array(z.string()),
    inventory: z.number()
});

export type UnbxdProduct = z.infer<typeof UnbxdProductSchema>;


export const UnbxdFacetTextSchema = z.object({
    displayName: z.string(),
    facetName: z.string(),
    values: z.array(z.union([z.string(), z.number()]))
});
export type UnbxdFacetText = z.infer<typeof UnbxdFacetTextSchema>;

export const UnbxdFacetRangeSchema = z.object({
    facetName: z.string(),
    values: z.object({
        counts: z.array(z.union([z.string(), z.number()]))
    }),
    displayName: z.string()
});

export const UnbxdFacetSchema = z.object({
    text: z.object({
        list: z.array(UnbxdFacetTextSchema)
    }),
    range: z.object({
        list: z.array(UnbxdFacetRangeSchema)
    })
});

export type UnbxdFacet = z.infer<typeof UnbxdFacetSchema>;




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

export type SearchRequest = z.infer<typeof SearchRequestSchema>;


// ═══════════════════════════════════════════════════════════
//  RESPONSE SCHEMAS — What we send back to the client
// ═══════════════════════════════════════════════════════════

export const TransformedSearchProductSchema = z.object({
    id: z.number(),
    title: z.string(),
    price: z.number(),
    imageUrl: z.array(z.string()),
    is_in_stock: z.string(),
    category: z.array(z.string()),
    product_slug: z.string(),
    exclusive_price: z.number(),
    images: z.array(z.string()).optional(),
    artist: z.string(),
    gender_type: z.number(),
    stock: z.number()
}).partial();

export type TransformedSearchProductModel = z.infer<typeof TransformedSearchProductSchema>;



export const TransformedSearchFilterOptionSchema = z.object({
    name: z.string(),
    slug: z.string(),
    count: z.number(),
}).partial();

export type TransformedSearchFilterOption = z.infer<typeof TransformedSearchFilterOptionSchema>;

export const TransformedSearchFilterSchema = z.object({
    alias: z.string(),
    field: z.string(),
    options: z.array(TransformedSearchFilterOptionSchema)
});
export type TransformedSearchFilter = z.infer<typeof TransformedSearchFilterSchema>;

export const SearchResponseSchema = z.object({
    products: z.array(TransformedSearchProductSchema),
    filters: z.any(),
    numberOfProducts: z.number(),
    didYouMean: z.string(),
    searchTerm: z.string(),
    empty_result_text: z.string(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const UnbxdAutoSuggestProductSchema = z.object({
    title: z.string().optional(),
    uniqueId: z.string().optional(),
    urlKey: z.string().optional(),
    imageUrl: z.array(z.string()).optional(),
    doctype: z.string(),
    autosuggest: z.string()
});

export type UnbxdAutoSuggestProduct = z.infer<typeof UnbxdAutoSuggestProductSchema>;

export const UnbxdAutoSuggestApiResponseSchema = z.object({
    response: z.object({
        products: z.array(UnbxdAutoSuggestProductSchema),
    })
});

export type UnbxdAutoSuggestApiResponse = z.infer<typeof UnbxdAutoSuggestApiResponseSchema>;

export const AutoSuggestRequestSchema = z.object({
    keyword: z.string(),
});

export type AutoSuggestRequest = z.infer<typeof AutoSuggestRequestSchema>;

export const TransformedAutoSuggestProductSchema = z.object({
    id: z.string(),
    title: z.string(),
    product_slug: z.string(),
    imageUrl: z.string(),
    autosuggest: z.string(),
    doctype: z.string()
}).partial();

export type TransformedAutoSuggestProductModel = z.infer<typeof TransformedAutoSuggestProductSchema>;

export const AutoSuggestResponseSchema = z.object({
    products: z.array(TransformedAutoSuggestProductSchema)
});

export type AutoSuggestResponse = z.infer<typeof AutoSuggestResponseSchema>;
