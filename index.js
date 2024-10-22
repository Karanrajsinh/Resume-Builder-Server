app.post('/generatePdf', async (req, res) => {
    const { htmlContent, width, height } = req.body;

    // Check if htmlContent, width, and height are received
    if (!htmlContent || !width || !height) {
        console.error('Incomplete data received');
        return res.status(400).send('HTML content, width, or height not provided');
    }

    try {
        const browser = await puppeteer.launch();

        const page = await browser.newPage();
        await page.addStyleTag({ path: 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css' });
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

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
