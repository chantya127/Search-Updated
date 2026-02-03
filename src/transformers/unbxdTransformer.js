const UNBXD_FIELD_MAP = {
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

const UNBXD_GENDER_MAP = {
    'Accessory': 0,
    'Men': 1,
    'Women': 2,
    'Kids': 3,
    'Extras': 4
};


export function transformProduct(product) {
    const transformedProductResponse = {};
    if (!product) return transformedProductResponse;
    for (const [key, desiredKey] of Object.entries(UNBXD_FIELD_MAP)) {
        if (key in product){
            if (key == 'gender'){
                product[key] = UNBXD_GENDER_MAP[product[key]];
            }
            transformedProductResponse[desiredKey] = product[key];
        }
        else{
            console.log(`Key ${key} not found in product`)
        }
    }
    return transformedProductResponse;
}

export function transformedProducts(products){
    if (!products) return [];
    return products.map(transformProduct);
}