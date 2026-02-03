import config from "../config.js";
import { request } from "undici";

import { UNBXD_EMPTY_RESULTS_TEXT, UNBXD_FIELDS_TO_FETCH, UNBXD_ALLOWED_FILTER_KEYS } from "./constant.js";
import { transformedProducts } from "../transformers/unbxdTransformer.js";

// A Singletio
class UnbxdService {

    constructor() {
        this.baseUrl = `${config.UNBXD_SEARCH_BASE_URL}/${config.UNBXD_SEARCH_API_KEY}/${config.UNBXD_SEARCH_SITE_KEY}`;
        this.timeout = 10_000;
    }

    async #makeRequest(url) {
        const { statusCode, body } = await request(url.toString(), {
            method: 'GET',
            headers: { 'Accept': '*/*' },
            headersTimeout: this.timeout,
            bodyTimeout: this.timeout
        });
        if (statusCode != 200) {
            const errorBody = await body.text();
            throw new UnbxdApiError(`Failed to fetch data: ${statusCode} and body ${errorBody}`, statusCode, errorBody);
        }
        return body.json();
    }

    #buildFilters(filters) {
        const filterList = [];
        if (!filters) return filterList;

        for (const [key, value] of Object.entries(filters)) {
            if (!UNBXD_ALLOWED_FILTER_KEYS.has(key)) continue;

            let filterStr = '';
            if (Array.isArray(value)) {
                if (key === 'price') {
                    filterStr = `${key}:[${value[0]} TO ${value[1]}]`;
                }
                else {
                    filterStr = value.map(item => `${key}:"${item}"`).join(' OR ');
                }
            }
            else {
                filterStr = `${key}:"${value}"`;
            }
            filterList.push(filterStr);
        }
        return filterList;

    }

    async search(payload) {
        const url = new URL(`${this.baseUrl}/search`);
        if (payload.keyword) {
            url.searchParams.append('q', payload.keyword);
        }
        url.searchParams.append('page', payload.page);
        url.searchParams.append('rows', payload.offset);
        url.searchParams.append('facet.multiselect', 'true');

        url.searchParams.append('fields', UNBXD_FIELDS_TO_FETCH);
        if (payload.sort) url.searchParams.append('sort', payload.sort);

        const filters = this.#buildFilters(payload.filters);
        filters.forEach(filter => url.searchParams.append('filter', filter));

        const data = await this.#makeRequest(url);
        const response = data?.response ?? {};

        return {
            products: transformedProducts(response.products),
            filters: response.facets,
            numberOfProducts: response.numberOfProducts,
            didYouMean: data?.didYouMean?.[0]?.suggestion ?? "",
            searchTerm: payload.keyword,
            empty_result_text: UNBXD_EMPTY_RESULTS_TEXT
        };

    }
}

class UnbxdApiError extends Error {
    constructor(message, statusCode, responseBody) {
        super(message);
        this.name = 'UnbxdApiError';
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }
}

export { UnbxdService, UnbxdApiError };
