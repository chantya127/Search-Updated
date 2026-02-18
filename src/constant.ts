
export const UNBXD_EMPTY_RESULTS_TEXT = 'The product you are searching for cannot be found' as const;
export const UNBXD_SEARCH_FIELDS_TO_FETCH = 'uniqueId,title,sellingPrice,imageUrl,availability,category,badges_unx,variantId,urlKey,exclusivePrice,images,imageGallery,gender,brand,inventory' as const;

export const UNBXD_ALLOWED_FILTER_KEYS: Set<string> = new Set([
    'price',
    'gender_uFilter',
    'category_uFilter',
    'size_uFilter',
    'brand_uFilter',
]);
