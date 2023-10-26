const { app } = require('@azure/functions');
const { CONFIG } = require("../lib/config");
const { readFacets, createFilterExpression } = require('../lib/azure-cognitive-search');
const { SearchClient, AzureKeyCredential } = require("@azure/search-documents");

// Create a SearchClient to send queries
const client = new SearchClient(
    `https://` + CONFIG.SearchServiceName + `.search.windows.net/`,
    CONFIG.SearchIndexName,
    new AzureKeyCredential(CONFIG.SearchApiQueryKey)
);

app.http('format', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        context.log(`format request for url "${request.url}"`);

        try {
            var chunkSize = 20000;
            var chuckResults = [];
            const body = await request.json();
            var extractText = ""
            for (const result of body.responsev2.predictionOutput.results) {
                for (const line of result.lines) {
                    extractText = extractText + " " + line.text
                }
            }

            

            for (let i = 0; i < extractText.length; i += chunkSize) {
                let chunk = extractText.substring(i, i + chunkSize);
                chuckResults.push(chunk);
            }
            
            return {
                headers: {
                    "Content-type": "application/json"
                },
                jsonBody: {
                    charCount: extractText.length,
                    results: chuckResults,
                    resultsCount: chuckResults.length
                    
                }
            };

        } catch (error) {
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
