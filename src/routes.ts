import { createCheerioRouter } from 'crawlee';

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
    log.info(`enqueueing new URLs`);
    await enqueueLinks({
        globs: ['https://**'],
        label: 'detail',
    });
});

router.addHandler('detail', async ({ request, $, log }) => {
    const title = $('title').text();
    log.info(`${title}`, { url: request.loadedUrl });
});
