/* eslint-disable prettier/prettier */
import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

async function fetchProxies() {
  const githubUrl = 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt';
  try {
      const response = await axios.get(githubUrl);
      const ipArray = response.data.split('\n').filter((proxy) => proxy.trim() !== '');
      return ipArray.map((ip) => `http://${ip}`);
  } catch (error) {
      console.error(`Failed to fetch proxy list: ${error.message}`);
      return [];
  }
}

let proxyUrls = await fetchProxies();

proxyUrls.forEach((url) => console.log(`${url}`));

const proxyConfiguration = new ProxyConfiguration({
  proxyUrls,
});

async function scrapeData() {
  const crawler = new PlaywrightCrawler({
      useSessionPool: true,
      sessionPoolOptions: { maxPoolSize: 100 },
      persistCookiesPerSession: true,
      maxRequestRetries: 20,
      maxConcurrency: 1,
      minConcurrency: 1,
      async requestHandler({ page, request, log, proxyInfo }) {
          console.log('Scraping:', request.url);
          console.log("Using proxy:", proxyInfo?.url || 'No proxy');

          try {
              await page.goto(request.url, { timeout: 600000 });
          } catch (error) {
              console.error(`Failed to navigate to ${request.url}. Error: ${error.message}`);
              throw error;
          }

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
              const thElement = Array.from(document.querySelectorAll('th')).find(th => th.textContent.includes('Photographs'));
              if (!thElement) return 'N/A';
              const parentRow = thElement.parentElement;
              if (!parentRow) return 'N/A';

              const subsequentRows = [];
              let currentRow = parentRow.nextElementSibling;
              while (currentRow) {
                  subsequentRows.push(currentRow);
                  currentRow = currentRow.nextElementSibling;
              }

              const photographsList = [];
              subsequentRows.forEach(row => {
                  const tdElement = Array.from(row.querySelectorAll('td')).find(td => (td as HTMLElement).textContent.includes('photographs')) as HTMLElement | null;
                  if (tdElement) {
                      photographsList.push(tdElement.textContent.trim());
                  }
              });

              if (photographsList.length === 0) {
                  const nextTd = thElement.nextElementSibling as HTMLElement | null;
                  if (nextTd) {
                      return nextTd.textContent.trim();
                  }
              }

              return photographsList.length > 0 ? photographsList.join(', ') : 'N/A';
          });

          log.info("Data extracted from link: " + request.url);
          console.log(`
              Extracted Data:
              Name: ${name}
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

  const urls=[]
  for (let v1 = 1; v1 <= 100; v1++) {
    const url = `https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&SEQ=124578963251458&Search_Arg=Group%20registration%20for%20a%20group%20of%20unpublished%20images&Search_Code=FT%2A&CNT=25&PID=my_dummy_pid&SID=1`;
    urls.push(url); // Add the generated URL to the array
}

// Log the total number of generated URLs and the URLs themselves
console.log('Total links:', urls.length, urls);
  await crawler.run(urls);
}

async function getTextContent(page, selector) {
  console.log('selector: ', selector);
  await page.waitForSelector(selector, { timeout: 30000 });
  const element = await page.$(selector);
  console.log("element:", element);
  if (element) {
      return (await element.textContent())?.trim() || 'N/A';
  }
  return 'N/A';
}

scrapeData();
