// Import required modules
import axios from 'axios';
import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import * as fs from 'fs';
import * as path from 'path';
import csvWriter from 'csv-write-stream';
 
// Function to fetch proxies from a specified URL
async function fetchProxies() {
    const githubUrl = 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt';
    try {
        const response = await axios.get(githubUrl);
        const ipArray = response.data.split('\n').filter((proxy: string) => proxy.trim() !== '');
        return ipArray.map((ip: any) => `http://${ip}`);
    } catch (error:any) {
        console.error(`Failed to fetch proxy list: ${error.message}`);
        return [];
    }
}

// Fetch and validate proxies
let proxyUrls = await fetchProxies();
// proxyUrls = await validateProxies(proxyUrls); // Uncomment if you have a validation function
console.log(proxyUrls)
// Configure proxy settings
const proxyConfiguration = new ProxyConfiguration({
    proxyUrls,
});

// Main function to scrape data
async function scrapeData() {
    const writer = csvWriter({
        headers: [
            'Name(s)',
            'Email',
            'Registration Number',
            'Title',
            'Description',
            'Copyright Claimant',
            'Date Of Creation',
            'Rights And Permission',
            'Photographs',
        ],
    });
     
    const filePath = path.join(`19-12-2024.csv`);
    const writeStream = fs.createWriteStream(filePath,{flags:'a'});
    writer.pipe(writeStream);

    const crawler = new PlaywrightCrawler({
        useSessionPool: true,
        sessionPoolOptions: { maxPoolSize: 100 },
        requestHandlerTimeoutSecs: 1800,
        persistCookiesPerSession: true,
        proxyConfiguration, // Uncomment to use proxy rotation
        maxRequestRetries: 100,
        maxConcurrency: 100,
        minConcurrency: 1,
        async requestHandler({ page, request, log, proxyInfo }) {
            console.log('Scraping:', request.url);
            console.log("Using proxy:", proxyInfo?.url || 'No proxy');

            try {
                await page.goto(request.url, { waitUntil:'load'});
            } catch (error:any) {
                console.error(`Failed to navigate to ${request.url}. Error: ${error.message}`);
                throw error;
            }
            page
            const name = await getTextContent(page, 'th:has-text("Name") + td');
            const rightsAndPermissions = await getTextContent(page, 'th:has-text("Rights and Permissions") + td');
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
            const emailMatch = rightsAndPermissions.match(emailRegex);
            const email = emailMatch ? emailMatch[0] : 'N/A';
            const registrationNumber = await getTextContent(page, 'th:has-text("Registration Number") + td');
            const title = await getTextContent(page, 'th:has-text("Title:") + td');
            const description = await getTextContent(page, 'th:has-text("Description") + td');
            const copyrightClaimant = await getTextContent(page, 'th:has-text("Copyright Claimant") + td');
            const dateOfCreation = await getTextContent(page, 'th:has-text("Date of Creation") + td');

            const photographs = await page.evaluate(() => {
                const thElement = Array.from(document.querySelectorAll('th')).find(th => th.textContent?.includes('Photographs'));
                if (!thElement) return 'N/A';

                const parentRow = thElement.parentElement;
                if (!parentRow) return 'N/A';

                const subsequentRows = [];
                let currentRow = parentRow.nextElementSibling;
                while (currentRow) {
                    subsequentRows.push(currentRow);
                    currentRow = currentRow.nextElementSibling;
                }

                const photographsList: string[] = [];
                subsequentRows.forEach(row => {
                    const tdElement:any = Array.from(row.querySelectorAll('td')).find(td => (td as HTMLElement).textContent.includes('photographs')) as HTMLElement | null;
                    if (tdElement) {
                        photographsList.push(tdElement.textContent.trim());
                    }
                });

                if (photographsList.length === 0) {
                    const nextTd:any = thElement.nextElementSibling as HTMLElement | null;
                    if (nextTd) {
                        return nextTd.textContent.trim();
                    }
                }

                return photographsList.length > 0 ? photographsList.join(', ') : 'N/A';
            });

            // Write extracted data to CSV
           //console.log("page title: " ,await page.title())
            writer.write({
                'Name(s)': name,
                'Email': email,
                'Registration Number': registrationNumber,
                'Title': title,
                'Description': description,
                'Copyright Claimant': copyrightClaimant,
                'Date Of Creation': dateOfCreation,
                'Rights And Permission': rightsAndPermissions,
                'Photographs': photographs,
            });

            log.info(`Data extracted:
              Name(s): ${name}
              Email: ${email}
              Registration Number: ${registrationNumber}
              Title: ${title}
              Description: ${description}
              Copyright Claimant: ${copyrightClaimant}
              Date Of Creation: ${dateOfCreation}
              Rights and Permissions: ${rightsAndPermissions}
              Photographs: ${photographs}
            `);
            
            
        },
        async failedRequestHandler({ request, error }) {
            console.error(`Request ${request.url} failed too many times. Error: ${error}`);
        },
    });

    const urls = [];
    for (let v1 =1500; v1 >= 1000; v1--) {
        
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Groups%20of%20commercial%20images&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);           urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Groups%20of%20commercial%20photographs&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Groups%20of%20commercial%20photos&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Group%20registration&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Group%20registration%20photo&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Group%20registration%20photos&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Group%20registration%20of%20unpublished%20images&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Group%20registration%20of%20published%20images&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Group%20registration%20of%20published%20photos&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Group%20registration%20of%20published%20photographs&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Group%20registration%20of%20unpublished%20photographs&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Groups%20of%20published%20photos&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Groups%20of%20published%20photographs&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Groups%20of%20unpublished%20photographs&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Groups%20of%20visual%20material&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Individual%20photographs&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Miscellaneous%20published%20photographs&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Photo%20assignments&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Photo%20published&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Photo%20registration&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Photo%20submission&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Published%20collection&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Published%20images&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Published%20work&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Published%20works&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Q1%20published%20photographs&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Q2%20published%20photographs&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Q3%20published%20photographs&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Q4%20published%20photographs&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Registrations&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Unpublished%20works&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Visual%20images&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);
            urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=12345698725439&Search%5FArg=Visual%20material&Search%5FCode=FT%2A&CNT=25&PID=dummy_pid&SID=1`);        
    }

    
    console.log('Toatal proxies:',proxyUrls.length);
    console.log('Total links to be scrapped:',urls.length);
    await crawler.run(urls);
}

// Helper function to extract text content from a selector
async function getTextContent(page: any, selector: string): Promise<string> {
  try {
      await page.waitForSelector(selector, { timeout: 30000 });
      const element = await page.$(selector);
      return element ? (await element.textContent())?.trim() || 'N/A' : 'N/A';
  } catch (error) {
      // If the selector is not found, return 'N/A'
      return 'N/A';
  }
}


// Start scraping process
scrapeData();
