
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const puppeteer = require('puppeteer-core'); // Use puppeteer-core
// const chromium = require('chrome-aws-lambda'); // Use chrome-aws-lambda for Chromium binary
const app = express();
const bodyParser = require('body-parser');
const path = require('path');


app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(cors({ origin: "*" })); // Enable CORS
app.use(express.json()); // Parse JSON request bodies


app.post('/generatePdf', async (req, res) => {
    const { htmlContent, width, height } = req.body;

    // Check if htmlContent, width, and height are received
    if (!htmlContent || !width || !height) {
        console.error('Incomplete data received');
        return res.status(400).send('HTML content, width, or height not provided');
    }

    const cssFilePath = path.join(__dirname, 'style.css');
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');

    try {
        const browser = await puppeteer.launch();

        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        await page.addStyleTag({ content: cssContent });
        // Inject CSS for page size and margins using the received dimensions
        await page.addStyleTag({
            content: `@page { size: ${width}px ${height}px; margin: 0; padding: 0; } body { margin: 0; padding: 0; }`,
        });

        // Generate PDF using the received dimensions
        const pdfBuffer = await page.pdf({
            printBackground: true,
            margin: 0,
            width: `${width}px`, // Use the received width
            height: `${height}px`, // Use the received height
        });

        await browser.close();

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
