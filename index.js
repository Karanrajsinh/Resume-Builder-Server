// const express = require('express');
// const cors = require('cors');
// const puppeteer = require('puppeteer-core'); // Use puppeteer-core
// const chromium = require('chrome-aws-lambda'); // Use chrome-aws-lambda for Chromium binary
// const app = express();

// app.use(cors({ origin: "*" })); // Enable CORS
// app.use(express.json()); // Parse JSON request bodies

// app.post('/generatePdf', async (req, res) => {
//     const { htmlContent } = req.body;

//     try {
//         // Launch Puppeteer using chrome-aws-lambda binaries
//         const browser = await puppeteer.launch({
//             args: [...chromium.args],
//             executablePath: await chromium.executablePath,
//             headless: true,
//         });

//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

//         const pdfBuffer = await page.pdf({
//             format: 'A4',
//             printBackground: true,
//         });

//         await browser.close();

//         res.set({
//             'Content-Type': 'application/pdf',
//             'Content-Disposition': 'attachment; filename=document.pdf',
//         });
//         res.send(pdfBuffer);
//     } catch (error) {
//         console.error('Error generating PDF:', error);
//         res.status(500).send('Error generating PDF');
//     }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-core'); // Use puppeteer-core
const chromium = require('chrome-aws-lambda'); // Use chrome-aws-lambda for Chromium binary
const app = express();
const bodyParser = require('body-parser');



app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(cors({ origin: "*" })); // Enable CORS
app.use(express.json()); // Parse JSON request bodies
app.post('/generatePdf', async (req, res) => {
    const { htmlContent } = req.body;

    try {
        // Launch Puppeteer using chrome-aws-lambda binaries
        const browser = await puppeteer.launch({
            args: [...chromium.args],
            executablePath: await chromium.executablePath,
            headless: true,
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Dynamically calculate the content size (width and height)
        const { width, height } = await page.evaluate(() => {
            const pdfElement = document.getElementById('pdf'); // Ensure 'pdf' element exists in the HTML content
            if (!pdfElement) {
                throw new Error('Could not find element with ID "pdf"');
            }
            return {
                width: pdfElement.offsetWidth,
                height: pdfElement.offsetHeight,
            };
        });

        // Inject dynamic CSS for page size and margins
        await page.addStyleTag({
            content: `@page { size: ${width}px ${height}px; margin: 0; padding: 0; } body { margin: 0; padding: 0; }`,
        });

        // Generate PDF with dynamic width and height
        const pdfBuffer = await page.pdf({
            printBackground: true,
            margin: 0, // No margins
            width: `${width}px`, // Dynamically calculated width
            height: `${height}px`, // Dynamically calculated height
        });

        await browser.close();

        // Set the response headers and send the generated PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=document.pdf',
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
