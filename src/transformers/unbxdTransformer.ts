import type {
    UnbxdProduct, TransformedSearchProductModel, UnbxdAutoSuggestProduct, TransformedAutoSuggestProductModel, UnbxdFacet,
    TransformedSearchFilter,
    TransformedSearchFilterOption
} from "../schema/search.js";
import { reformatImageUrlToFileName } from "../utils/genericUtils.js";

const UNBXD_SEARCH_FIELD_MAP: Partial<Record<keyof UnbxdProduct, keyof TransformedSearchProductModel>> = {
    uniqueId: 'id',
    title: 'title',
    sellingPrice: 'price',
    imageGallery: 'imageUrl',
    availability: 'is_in_stock',
    category: 'category',
    urlKey: 'product_slug',
    exclusivePrice: 'exclusive_price',
    images: 'images',
    gender: 'gender_type',
    brand: 'artist',
    inventory: 'stock'
};

const UNBXD_AUTOSUGGEST_FIELD_MAP: Partial<Record<keyof UnbxdAutoSuggestProduct, keyof TransformedAutoSuggestProductModel>> = {
    uniqueId: 'id',
    title: 'title',
    imageUrl: 'imageUrl',
    urlKey: 'product_slug',
    doctype: 'doctype',
    autosuggest: 'autosuggest',
};

const UNBXD_GENDER_MAP: Record<string, number> = {
    'Accessory': 0,
    'Men': 1,
    'Women': 2,
    'Kids': 3,
    'Extras': 4
};


// Helper: converts a flat [value, count, value, count, ...] array into filter options
function toFilterOptions(pairs: (string | number)[]): Partial<TransformedSearchFilterOption>[] {
    const options: Partial<TransformedSearchFilterOption>[] = [];
    for (let i = 0; i + 1 < pairs.length; i += 2) {
        const name = pairs[i] as string;
        const count_number = pairs[i + 1] as number;
        options.push({ name: name, count: count_number, slug: name });
    }
    return options;
}


export function transformSearchProduct(product: UnbxdProduct): Partial<TransformedSearchProductModel> {
    const transformed: Partial<TransformedSearchProductModel> = {};
    if (!product) return transformed;

    for (const [unbxdKey, ourKey] of Object.entries(UNBXD_SEARCH_FIELD_MAP)) {
        const key = unbxdKey as keyof UnbxdProduct;
        if (!(key in product)) continue;

        let value = product[key];

        if (key === 'uniqueId') {
            value = Number(value);
        } else if (key === 'gender') {
            value = UNBXD_GENDER_MAP[product[key]] ?? -1;
        } else if (key === 'brand' && product.brand) {
            value = product.brand[0];
        } else if (key === 'availability') {
            value = (product[key] === 'true' ? 1 : 0);
        } else if (key === 'imageGallery') {
            value = product.imageGallery.map((imgUrl: string) => reformatImageUrlToFileName(imgUrl));
        }

        (transformed as Record<string, unknown>)[ourKey] = value;
    }

    return transformed;
}

export function transformSearchProducts(products: UnbxdProduct[] | undefined): Partial<TransformedSearchProductModel>[] {
    if (!products) return [];
    return products.map(transformSearchProduct);
}


export function transformSearchFiltersList(facets: UnbxdFacet): Partial<TransformedSearchFilter>[] {
    const result: Partial<TransformedSearchFilter>[] = [];
    if (!facets) return result;

    // Text facets
    for (const textFacet of facets.text.list) {
        result.push({
            field: textFacet.facetName,
            alias: textFacet.displayName,
            options: toFilterOptions(textFacet.values),
        });
    }

    // Range facets — extract only min and max bounds
    for (const rangeFacet of facets.range.list) {
        const { counts } = rangeFacet.values;

        let options: Partial<TransformedSearchFilterOption>[] = [];
        if (counts.length > 1) {
            options = toFilterOptions([
                counts[0], counts[1],                           // min bound
                counts[counts.length - 2], counts[counts.length - 1],  // max bound
            ]);
        }

        result.push({
            field: rangeFacet.facetName,
            alias: rangeFacet.displayName,
            options,
        });
    }

    addSortFilter(result);

    return result;
}

function addSortFilter(result: Partial<TransformedSearchFilter>[]): Partial<TransformedSearchFilter>[] {

    // Sort Filter

    const sort_alias = "Sort"
    const sort_field = "sort"

    const sort_options = [
        {
            "name": "Price-Low to High",
            "slug": "sellingPrice asc"
        },
        {
            "name": "Price-High to Low",
            "slug": "sellingPrice desc"
        },
        {
            "name": "Title ASC",
            "slug": "title asc"
        },
        {
            "name": "TITLE DESC",
            "slug": "title desc"
        }
    ]

    result.push({
        field: sort_field,
        alias: sort_alias,
        options: sort_options,
    });
    return result;
}

export function transformAutoSuggestProduct(product: UnbxdAutoSuggestProduct): Partial<TransformedAutoSuggestProductModel> {
    const transformedProduct: Partial<TransformedAutoSuggestProductModel> = {};
    if (!product) return transformedProduct;

    for (const [unbxdKey, ourKey] of Object.entries(UNBXD_AUTOSUGGEST_FIELD_MAP)) {
        const key = unbxdKey as keyof UnbxdAutoSuggestProduct;
        if (key in product) {
            (transformedProduct as Record<string, unknown>)[ourKey] = product[key];
        }
    }

    return transformedProduct;
}

export function transformAutoSuggestProducts(products: UnbxdAutoSuggestProduct[] | undefined): Partial<TransformedAutoSuggestProductModel>[] {
    if (!products) return [];
    return products.map(transformAutoSuggestProduct);
}
