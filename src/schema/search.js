
const searchRequestSchema = {
    type: 'object',
    required: ['keyword', 'page', 'offset'],

    properties: {
        keyword: { type: 'string' },
        page: { type: 'number' , minimum: 1},
        offset: { type: 'number' , minimum: 1},
        sort: { type: 'string' },
        filters: {
            type: 'object',
            additionalProperties: {
                anyOf: [
                    { type: 'string' },
                    { type: 'array', items: { type: 'string' } },
                    { type: 'array', items: { type: 'number' } }
                ]
            }
        }
    },

    additionalProperties: false,
}

const searchProductResponse = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            selling_price: { type: 'number' },
            imageUrl: { type: 'string' },
            is_in_stock: { type: 'string' },
            category: { type: 'array', items: { type: 'string' } },
            product_slug: { type: 'string' },
            exclusive_price: { type: 'number' },
            images: { type: 'array', items: { type: 'string' } },
            imageGallery: { type: 'array', items: { type: 'string' } },
            gender_type: { type: 'number' }
        },
    }
}

const searchFiltersResponse = {
    type: 'object',
    additionalProperties: true,

}

const searchResponse = {
    type: 'object',
    required: ['numberOfProducts', 'products'],
    properties: {
        products: searchProductResponse,
        filters: searchFiltersResponse,
        numberOfProducts: { type: 'number' },
        didYouMean: { type: 'string' },
        searchTerm: { type: 'string' },
        empty_result_text: { type: 'string' }
    }
}


export { searchResponse, searchRequestSchema };

