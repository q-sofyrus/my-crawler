// /* eslint-disable prettier/prettier *
// // Function to fetch proxies from a specified URL
// async function fetchProxies() {
//     const githubUrl = 'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt';
//     try {
//         const response = await axios.get(githubUrl);
//         const ipArray = response.data.split('\n').filter((proxy: string) => proxy.trim() !== '');
//         return ipArray.map((ip: any) => `http://${ip}`);
//     } catch (error) {
//         console.error(`Failed to fetch proxy list: ${error.message}`);
//         return [];
//     }
// }

// // Fetch and validate proxies
// //let proxyUrls = await fetchProxies();
// //proxyUrls = await validateProxies(proxyUrls);



// // Log fetched proxies
// //proxyUrls.forEach((url: any) => console.log(`${url}`));

// // Configure proxy settings
// // const proxyConfiguration = new ProxyConfiguration({
// //     proxyUrls,
// // });

// // Main function to scrape data
// async function scrapeData(){
//     // const writer = csvWriter({
//     //   headers: [
//     //     'Name(s)',
//     //     'Email',
//     //     'Registration Number',
//     //     'Title',
//     //     'Description',
//     //     'Copyright Claimant',
//     //     'Date Of Creation',
//     //     'Rights And Permission',
//     //     'Photographs',
//     //   ],
//     // });

//     // const filePath = path.join(__dirname, 'Group registration for a group of unpublished imagess.csv');
//     // const writeStream = fs.createWriteStream(filePath);
//     // writer.pipe(writeStream);

//     const crawler = new PlaywrightCrawler({
//         useSessionPool: true,
//         sessionPoolOptions: { maxPoolSize: 100 },
//         persistCookiesPerSession: true,
//         //proxyConfiguration,
//         maxRequestRetries:20,
//         maxConcurrency:1,
//         minConcurrency:1,
//         async requestHandler({ page, request, log, proxyInfo }) {
//             console.log('Scraping:', request.url);
//             console.log("Using proxy:", proxyInfo?.url || 'No proxy'); // Log proxy or fallback to 'No proxy'

//             try {
//                 await page.goto(request.url, { timeout: 600000 }); // Timeout reduced to 60s for faster loads
//             } catch (error) {
//                 console.error(`Failed to navigate to ${request.url}. Error: ${error.message}`);
//             throw error; // Ensure the error is rethrown for retry or failedRequestHandler
//             }
            
//             //console.log("Page content ",await page.inne());

//           const name = await getTextContent(page, 'th:has-text("Name") + td');

//           const rightsAndPermissions = await getTextContent(page, 'th:has-text("Rights and Permissions") + td');
  
//           const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
//           const emailMatch = rightsAndPermissions.match(emailRegex);
//           const email = emailMatch ? emailMatch[0] : 'N/A';
  
//           const registrationNumber = await getTextContent(page, 'th:has-text("Registration Number") + td');
//           const title = await getTextContent(page, 'th:has-text("Title:") + td');
//           const description = await getTextContent(page, 'th:has-text("Description") + td');
//           const copyrightClaimant = await getTextContent(page, 'th:has-text("Copyright Claimant") + td');
//           const dateOfCreation = await getTextContent(page, 'th:has-text("Date of Creation") + td');
  
//           const photographs = await page.evaluate(() => {
//             const thElement = Array.from(document.querySelectorAll('th')).find(th => th.textContent.includes('Photographs'));
  
//             if (!thElement) return 'N/A';
  
//             const parentRow = thElement.parentElement;
//             if (!parentRow) return 'N/A';
  
//             const subsequentRows = [];
//             let currentRow = parentRow.nextElementSibling;
//             while (currentRow) {
//               subsequentRows.push(currentRow);
//               currentRow = currentRow.nextElementSibling;
//             }
  
//             const photographsList: string[] = [];
//             subsequentRows.forEach(row => {
//               const tdElement = Array.from(row.querySelectorAll('td')).find(td => (td as HTMLElement).textContent.includes('photographs')) as HTMLElement | null;
//               if (tdElement) {
//                 photographsList.push(tdElement.textContent.trim());
//               }
//             });
  
//             if (photographsList.length === 0) {
//               const nextTd = thElement.nextElementSibling as HTMLElement | null;
//               if (nextTd) {
//                 return nextTd.textContent.trim();
//               }
//             }
  
//             return photographsList.length > 0 ? photographsList.join(', ') : 'N/A';
//           });
  
//           // Write extracted data to CSV
//         //   writer.write({
//         //     'Name(s)': name,
//         //     'Email': email,
//         //     'Registration Number': registrationNumber,
//         //     'Title': title,
//         //     'Description': description,
//         //     'Copyright Claimant': copyrightClaimant,
//         //     'Date Of Creation': dateOfCreation,
//         //     'Rights And Permission': rightsAndPermissions,
//         //     'Photographs': photographs,
//         //   });
  
          
//           log.info("Data extracted from link: " + request.url);
//           // Log extracted data to the console
// console.log(`
//     Extracted Data:
//     Name: ${name}
//     Email: ${email}
//     Registration Number: ${registrationNumber}
//     Title: ${title}
//     Description: ${description}
//     Copyright Claimant: ${copyrightClaimant}
//     Date Of Creation: ${dateOfCreation}
//     Rights and Permissions: ${rightsAndPermissions}
//     Photographs: ${photographs}
//   `);
//         },
  
//         async failedRequestHandler({ request, error }) {
//           console.error(`Request ${request.url} failed too many times. Error: ${error}`);
//         },
//       });

//       // const urls = [];
//       // for (let v1 = 1; v1 <= 30; v1++) {
//       //   urls.push(`https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=${v1}&ti=1,1&Search%5FArg=Group%20registration%20for%20a%20group%20of%20unpublished%20images&Search%5FCode=FT%2A&CNT=100&PID=dummy_pid&SEQ=12345678912345&SID=1`);
//       // }

//       function generateLinks(searchArgs: string[]): string[] {
//         const baseUrl = 'https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?Search_Arg=';
//         const staticParams = '&Search_Code=REGS&PID=FIx3It5HeB9H7X6uedJGhMTVholT1&SEQ=123456789369&CNT=25&HIST=1';
        
//         return searchArgs.map(searchArg => `${baseUrl}${searchArg}${staticParams}`);
//     }
    
//     // Example search arguments (replace these with your desired values)
//     const searchArgs = [
//       'sr0000377691',
//       'sr0000331285',
//       'sr0000895883',
//       'sr0000895890',
//       'sr0000895906',
//       'sr0000896162',
//       'sr0000896851',
//       'sr0000896908',
//       'sr0000896939',
//       'sr0000897111'
//   ];
  
    
//     // Generate the links
//     const links = generateLinks(searchArgs);
    
//     // Output the generated links
//     console.log("Generated links->",links);
    
  
//       await crawler.run(links);

//     }

//     async function getTextContent(page: any, selector: string): Promise<string> {
//        console.log('selector: ', selector);
//        await page.waitForSelector(selector, { timeout: 30000 });
//        const element = await page.$(selector);
//         console.log("element:",element);
//         if (element) {
//           return (await element.textContent())?.trim() || 'N/A';
//         }
//         return 'N/A';
//       }

//     scrapeData();






import { PlaywrightCrawler } from 'crawlee';
import * as fs from 'fs';
import * as path from 'path';
import { Page } from 'playwright';
import csvWriteStream from 'csv-write-stream';


async function scrapeData() {
      const writer = csvWriteStream({
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
    const filePath = path.join('', 'sound recording.csv');
    const writeStream = fs.createWriteStream(filePath,{ flags: 'a' });
    writer.pipe(writeStream);
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
                await page.goto(request.url, { timeout: 60000 }); // Ensure page navigation
                await page.waitForLoadState('domcontentloaded'); // Ensure full load

                // Debugging: Print the full page content to inspect structure
                
                // Extract information
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

          //Write extracted data to CSV
          writer.write({
            'Name(s)': name,
            'Email': email,
            'Registration Number': registrationNumber,
            'Title': title,
            'Description': description,
            'Copyright Claimant': copyrightClaimant,
            'Date Of Creation': dateOfCreation,
            'Rights And Permission': rightsAndPermissions,
          });
                // Log extracted data to the console
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
                `);
            } catch (error) {
                console.error(`Failed to navigate to ${request.url}. Error: ${error.message}`);
                throw error;
            }
        },
        async failedRequestHandler({ request, error }) {
            console.error(`Request ${request.url} failed too many times. Error: ${error}`);
        },
    });

    const searchArgs = [
      'sr0000900698',
    ]
  
  

    const links = searchArgs.map(arg => `https://cocatalog.loc.gov/cgi-bin/Pwebrecon.cgi?v1=1&ti=1,1&Search_Arg=${arg}&Search_Code=REGS&CNT=25&PID=dummy_pid&SEQ=12345678912345&SID=1`);
    await crawler.run(links);
}

async function getTextContent(page: Page, selector: string): Promise<string> {
    const element = await page.$(selector);
    if (element) {
        const text = await page.evaluate((el: { textContent: any; }) => el.textContent, element);
        return text?.trim() || 'N/A';
    }
    return 'N/A';
}

scrapeData();





import fs from 'fs';
import csv from 'csv-parser';

const registrationNumbers = [];

fs.createReadStream('C:/Users/qasim_ali/Desktop/my-crawler/src/sound-recording-registrations.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Assuming your registration numbers are under the column 'reg_no'
    if (row['reg_no']) {
      registrationNumbers.push(row['reg_no']);
    }
  })
  .on('end', () => {
    console.log('CSV file successfully processed.');
    console.log('Registration Numbers:', registrationNumbers);
    // Now you can process the array of registration numbers
  });
