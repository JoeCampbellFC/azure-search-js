const { app } = require('@azure/functions');
const { CONFIG } = require("../lib/config");
const { readFacets, createFilterExpression } = require('../lib/azure-cognitive-search');
const { SearchClient, AzureKeyCredential } = require("@azure/search-documents");
const fetch = require("node-fetch");
// Create a SearchClient to send queries
const client = new SearchClient(
    `https://` + CONFIG.SearchServiceName + `.search.windows.net/`,
    CONFIG.SearchIndexName,
    new AzureKeyCredential(CONFIG.SearchApiQueryKey)
);

app.http('search', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        context.log(`Search request for url "${request.url}"`);

        try {

            const body = await request.json();
            console.log(body);

            let q = body.q || "*";
            const top = body.top || 5;
            const skip = parseInt(body.skip || 0);
            const filters = body.filters || undefined;
            const facets = readFacets(CONFIG.SearchFacets);

            const facetNames = Object.keys(facets);
            console.log(facetNames);

            const filtersExpression = (filters && facets) ? createFilterExpression(filters, facets) : undefined;
            console.log(filtersExpression)

            // Creating SearchOptions for query
            let searchOptions = {
                top: top,
                skip: skip,
                includeTotalCount: true,
                facets: facetNames,
                filter: filtersExpression,
                select: ["id","metadata_storage_name"],
                highlightFields: "content",
                highlightPreTag: "<b>",
                highlightPostTag: "</b>"
            };
            console.log(searchOptions);


            //
            // Sending the search request
            const searchResults = await client.search(q, searchOptions);
            console.log(searchResults);
            var answer = ""
            if(q.includes("?")) {
            
                var surl = "https://" + CONFIG.SearchServiceName + ".search.windows.net/indexes/vectorkbindex/docs?api-version=2023-07-01-Preview&search=" + q + "&queryLanguage=en-US&queryType=semantic&captions=extractive&answers=extractive%7Ccount-3&semanticConfiguration=default"

                const response = await fetch(surl, {
                    method: "GET",
                    headers: {
                    "api-key": CONFIG.SearchApiQueryKey,
                    }
                });
            
                const r = await response.json();
                
                if(r['@search.answers'].length > 0){
                    answer = r['@search.answers'][0].highlights;
                }
                console.log("answer:",answer );
            }

            // Getting results for output
            const output = [];
            for await (const result of searchResults.results) {
                output.push(result);
            }
            console.log(output)

            // Logging search results
            context.log(searchResults.count);

            return {
                headers: {
                    "Content-type": "application/json"
                },
                jsonBody: {
                    count: searchResults.count,
                    results: output,
                    resultsCount: output.length,
                    facets: searchResults.facets,
                    answer: answer,
                    q,
                    top,
                    skip,
                    filters: filters || ''
                }
            };

        } catch (error) {
            console.log(error.details || error.message)
            return {
                status: 500,
                jsonBody: {
                    innerStatusCode: error.statusCode || error.code,
                    error: error.details || error.message,
                    stack: error.stack
                }
            }
        }
    }
});
