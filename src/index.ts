import { PlaywrightCrawler } from 'crawlee';

const crawler = new PlaywrightCrawler({
    requestHandler: async ({ page, request, enqueueLinks }) => {
        console.log(`Processing: ${request.url}`);
        
        // Select all <a> elements (links)
        const links = await page.$$eval('a', (anchors) => {
            return anchors.map(anchor => {
                const href = anchor.getAttribute('href');  // Get the href attribute
                const pContent = Array.from(anchor.querySelectorAll('p')).map(p => p.textContent);  // Get content of <p> inside the link
                return { href, pContent };
            });
        });

        // Log the extracted data
        console.log(links);

        // Optionally, enqueue more links for crawling if needed
        await enqueueLinks();
    },
    failedRequestHandler: async ({ request }) => {
        console.log(`Request ${request.url} failed too many times.`);
    },
});

await crawler.run(['https://www.copyrightable.com/search/category']);
