// const express = require('express');
// const cors = require('cors');
// const puppeteer = require('puppeteer');
// const app = express();

// app.use(cors()); // Enable CORS
// app.use(express.json());

// // PDF Generation Route (same as before)
// app.post('/generatePdf', async (req, res) => {
//     const { htmlContent } = req.body;

//     try {
//         const browser = await puppeteer.launch({
//             args: [
//                 '--no-sandbox', // Required for environments like Heroku/Render
//                 '--disable-setuid-sandbox',
//             ],
//             headless: true, // Ensure Puppeteer runs in headless mode
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

// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });


const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-core'); // Use puppeteer-core
const chromium = require('chrome-aws-lambda'); // Use chrome-aws-lambda for Chromium binary
const app = express();

app.use(cors()); // Enable CORS
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

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
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
