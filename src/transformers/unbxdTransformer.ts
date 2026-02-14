import type { UnbxdProduct, TransformedProduct } from "../schema/search.js";

const UNBXD_FIELD_MAP: Partial<Record<keyof UnbxdProduct, keyof TransformedProduct>> = {
    uniqueId: 'id',
    title: 'title',
    sellingPrice: 'selling_price',
    imageUrl: 'imageUrl',
    availability: 'is_in_stock',
    category: 'category',
    urlKey: 'product_slug',
    exclusivePrice: 'exclusive_price',
    images: 'images',
    imageGallery: 'imageGallery',
    gender: 'gender_type'
};


const UNBXD_GENDER_MAP: Record<string, number> = {
    'Accessory': 0,
    'Men': 1,
    'Women': 2,
    'Kids': 3,
    'Extras': 4
};


export function transformProduct(product: UnbxdProduct): Partial<TransformedProduct> {
    const transformed: Partial<TransformedProduct> = {};
    if (!product) return transformed;

    for (const [unbxdKey, ourKey] of Object.entries(UNBXD_FIELD_MAP)) {
        const key = unbxdKey as keyof UnbxdProduct;

        if (key in product) {
            if (key === 'gender') {
                // Use a local value — don't mutate the original product object
                const genderValue = UNBXD_GENDER_MAP[product[key]] ?? -1;
                (transformed as Record<string, unknown>)[ourKey] = genderValue;
            } else {
                (transformed as Record<string, unknown>)[ourKey] = product[key];
            }
        }
    }

    return transformed;
}


export function transformedProducts(products: UnbxdProduct[] | undefined): Partial<TransformedProduct>[] {
    if (!products) return [];
    return products.map(transformProduct);
}
