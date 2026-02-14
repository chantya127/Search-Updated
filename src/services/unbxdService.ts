import config from "../config.js";
import { request } from "undici";

import { UNBXD_EMPTY_RESULTS_TEXT, UNBXD_FIELDS_TO_FETCH, UNBXD_ALLOWED_FILTER_KEYS } from "../constant.js";
import { transformedProducts } from "../transformers/unbxdTransformer.js";
import type { SearchRequestBody, SearchResponse, UnbxdApiResponse } from "../schema/search.js";


class UnbxdService {
    private readonly baseUrl: string;
    private readonly timeout: number;

    constructor() {
        this.baseUrl = `${config.UNBXD_SEARCH_BASE_URL}/${config.UNBXD_SEARCH_API_KEY}/${config.UNBXD_SEARCH_SITE_KEY}`;
        this.timeout = 10_000;
    }

    private async makeRequest<T>(url: URL): Promise<T> {
        const { statusCode, body } = await request(url.toString(), {
            method: 'GET',
            headers: { 'Accept': '*/*' },
            headersTimeout: this.timeout,
            bodyTimeout: this.timeout
        });

        if (statusCode !== 200) {
            const errorBody = await body.text();
            throw new UnbxdApiError(
                `Failed to fetch data: ${statusCode} and body ${errorBody}`,
                statusCode,
                errorBody
            );
        }

        return body.json() as Promise<T>;
    }

    private buildFilters(filters: SearchRequestBody['filters']): string[] {
        const filterList: string[] = [];
        if (!filters) return filterList;

        for (const [key, value] of Object.entries(filters)) {
            if (!UNBXD_ALLOWED_FILTER_KEYS.has(key)) continue;

            let filterStr = '';
            if (Array.isArray(value)) {
                if (key === 'price') {
                    filterStr = `${key}:[${value[0]} TO ${value[1]}]`;
                } else {
                    filterStr = value.map((item) => `${key}:"${item}"`).join(' OR ');
                }
            } else {
                filterStr = `${key}:"${value}"`;
            }
            filterList.push(filterStr);
        }
        return filterList;
    }


    async search(payload: SearchRequestBody): Promise<SearchResponse> {
        const url = new URL(`${this.baseUrl}/search`);

        if (payload.keyword) {
            url.searchParams.append('q', payload.keyword);
        }
        url.searchParams.append('page', String(payload.page));
        url.searchParams.append('rows', String(payload.offset));
        url.searchParams.append('facet.multiselect', 'true');
        url.searchParams.append('fields', UNBXD_FIELDS_TO_FETCH);

        if (payload.sort) url.searchParams.append('sort', payload.sort);

        const filters = this.buildFilters(payload.filters);
        filters.forEach(filter => url.searchParams.append('filter', filter));

        const data = await this.makeRequest<UnbxdApiResponse>(url);
        const response = data?.response ?? { products: [], numberOfProducts: 0 };

        return {
            products: transformedProducts(response.products),
            filters: data?.facets ?? {},
            numberOfProducts: response.numberOfProducts ?? 0,
            didYouMean: data?.didYouMean?.[0]?.suggestion ?? "",
            searchTerm: payload.keyword,
            empty_result_text: UNBXD_EMPTY_RESULTS_TEXT
        };
    }
}

class UnbxdApiError extends Error {
    public readonly statusCode: number;
    public readonly responseBody: string;

    constructor(message: string, statusCode: number, responseBody: string) {
        super(message);
        this.name = 'UnbxdApiError';
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }
}

export { UnbxdService, UnbxdApiError };
