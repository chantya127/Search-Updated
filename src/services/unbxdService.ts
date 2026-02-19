import config from "../config.js";
import { request } from "undici";

import { UNBXD_EMPTY_RESULTS_TEXT, UNBXD_SEARCH_FIELDS_TO_FETCH, UNBXD_ALLOWED_FILTER_KEYS, UNBXD_AUTOSUGGEST_FIELDS_TO_FETCH, UNBXD_AUTOSUGGEST_RESULTS_COUNT } from "../constant.js";
import { transformSearchProducts, transformAutoSuggestProducts, transformSearchFiltersList } from "../transformers/unbxdTransformer.js";
import type {
    SearchRequest, SearchResponse, UnbxdApiResponse, AutoSuggestRequest, AutoSuggestResponse,
    UnbxdAutoSuggestApiResponse
} from "../schema/search.js";
import { ur } from "zod/locales";


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

    private buildFilters(filters: SearchRequest['filters']): string[] {
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


    async search(payload: SearchRequest): Promise<SearchResponse> {
        const url = new URL(`${this.baseUrl}/search`);

        if (payload.keyword) {
            url.searchParams.append('q', payload.keyword);
        }
        url.searchParams.append('page', String(payload.page));
        url.searchParams.append('rows', String(payload.offset));
        url.searchParams.append('facet.multiselect', 'true');
        url.searchParams.append('fields', UNBXD_SEARCH_FIELDS_TO_FETCH);

        if (payload.sort) url.searchParams.append('sort', payload.sort);

        const filters = this.buildFilters(payload.filters);
        filters.forEach(filter => url.searchParams.append('filter', filter));

        const data = await this.makeRequest<UnbxdApiResponse>(url);
        const response = data?.response ?? { products: [], numberOfProducts: 0 };

        return {
            products: transformSearchProducts(response.products),
            filters: transformSearchFiltersList(data.facets),
            numberOfProducts: response.numberOfProducts ?? 0,
            didYouMean: data?.didYouMean?.[0]?.suggestion ?? "",
            searchTerm: payload.keyword,
            empty_result_text: UNBXD_EMPTY_RESULTS_TEXT
        };
    }

    async autoSuggest(payload: AutoSuggestRequest): Promise<AutoSuggestResponse> {

        const url = new URL(`${this.baseUrl}/autosuggest`);

        if (payload.keyword) {
            url.searchParams.append('q', payload.keyword);
        }
        url.searchParams.append('inFields.count', UNBXD_AUTOSUGGEST_RESULTS_COUNT);
        url.searchParams.append('popularProducts.count', UNBXD_AUTOSUGGEST_RESULTS_COUNT);
        url.searchParams.append('keywordSuggestions.count', UNBXD_AUTOSUGGEST_RESULTS_COUNT);
        url.searchParams.append('topQueries.count', UNBXD_AUTOSUGGEST_RESULTS_COUNT);
        url.searchParams.append('promotedSuggestion.count', UNBXD_AUTOSUGGEST_RESULTS_COUNT);
        url.searchParams.append('popularProducts.fields', UNBXD_AUTOSUGGEST_FIELDS_TO_FETCH);

        const data = await this.makeRequest<UnbxdAutoSuggestApiResponse>(url);
        return {
            products: transformAutoSuggestProducts(data.response.products)
        }
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
