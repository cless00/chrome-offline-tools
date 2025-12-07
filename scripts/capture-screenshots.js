const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Get project root (parent of scripts folder)
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCREENSHOT_WIDTH = 1280;
const SCREENSHOT_HEIGHT = 800;
const DIST_DIR = path.join(PROJECT_ROOT, 'dist', 'store-assets');
const PORT = 8199;

// Simple static file server
function startServer() {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            let filePath = path.join(PROJECT_ROOT, req.url === '/' ? 'popup.html' : req.url);
            const ext = path.extname(filePath);
            const mimeTypes = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.svg': 'image/svg+xml'
            };

            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Not found');
                } else {
                    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
                    res.end(content);
                }
            });
        });

        server.listen(PORT, () => {
            resolve(server);
        });
    });
}

async function captureScreenshots() {
    // Ensure dist directory exists
    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true });
    }

    console.log('📸 Starting local server...');
    const server = await startServer();

    console.log('📸 Launching browser for screenshots...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: SCREENSHOT_WIDTH, height: SCREENSHOT_HEIGHT });

    const baseUrl = `http://localhost:${PORT}/popup.html`;

    try {
        // Screenshot 1: JSON Tools - Initial view
        console.log('  📷 Capturing JSON Tools view...');
        await page.goto(baseUrl, { waitUntil: 'networkidle0' });
        await page.waitForSelector('.nav-btn');

        // Add sample JSON
        await page.evaluate(() => {
            const textarea = document.querySelector('#json-input');
            if (textarea) {
                textarea.value = JSON.stringify({
                    "name": "Offline Tools",
                    "version": "1.0",
                    "features": ["JSON Beautify", "Minify", "Table View"],
                    "secure": true,
                    "settings": {
                        "theme": "dark",
                        "autoSave": true
                    }
                }, null, 2);
                // Trigger input event for syntax highlighting
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        await new Promise(r => setTimeout(r, 500));

        await page.screenshot({
            path: path.join(DIST_DIR, 'screenshot-1-json-tools.png'),
            type: 'png'
        });

        // Screenshot 2: JSON Table View
        console.log('  📷 Capturing Table View...');
        await page.click('#btn-table');
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({
            path: path.join(DIST_DIR, 'screenshot-2-table-view.png'),
            type: 'png'
        });

        // Screenshot 3: Password Generator
        console.log('  📷 Capturing Password Generator...');
        await page.click('.nav-btn[data-target="generator"]');
        await new Promise(r => setTimeout(r, 500));
        await page.click('#generate-btn');
        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({
            path: path.join(DIST_DIR, 'screenshot-3-password-generator.png'),
            type: 'png'
        });

        // Screenshot 4: Password Generator with batch
        console.log('  📷 Capturing Batch Password Generation...');
        await page.evaluate(() => {
            document.querySelector('#batch-count').value = '5';
        });
        await page.click('#generate-btn');
        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({
            path: path.join(DIST_DIR, 'screenshot-4-batch-passwords.png'),
            type: 'png'
        });

        console.log('✅ Screenshots saved to dist/store-assets/');

    } finally {
        await browser.close();
        server.close();
    }
}

captureScreenshots().catch(err => {
    console.error('Screenshot capture failed:', err.message);
    process.exit(1);
});
