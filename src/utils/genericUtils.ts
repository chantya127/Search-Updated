export function reformatImageUrlToFileName(imgUrl: string): string {
    if (!imgUrl) return imgUrl;
    return imgUrl.split('/').pop() ?? imgUrl;
}



// https://search.unbxd.io/c884da9a9206c03182bf11ee4b0b0e82/ss-unbxd-aapac-souled-store---prod67361758560010/autosuggest?q=j&inFields.count=4&popularProducts.count=4&keywordSuggestions.count=5&topQueries.count=4&promotedSuggestion.count=5&popularProducts.fields=urlKey, autosuggest, doctype, title, imageUrl

// https://search.unbxd.io/c884da9a9206c03182bf11ee4b0b0e82/ss-unbxd-aapac-souled-store---prod67361758560010/autosuggest?q=jeans&inFields.count=4&popularProducts.count=4&keywordSuggestions.count=4&topQueries.count=4&promotedSuggestion.count=4&popularProducts.fields=urlKey%2C+autosuggest%2C+doctype%2C+title%2C+imageUrl'