const fileInput = document.getElementById('file-input');
const uploadForm = document.getElementById('upload-form');
const pdfViewer = document.getElementById('pdf-viewer');

// Configure PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// Function to render PDF
const renderPDF = async (url) => {
    const pdf = await pdfjsLib.getDocument(url).promise;

    pdfViewer.innerHTML = ''; // Clear previous content

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        const viewport = page.getViewport({ scale: 1.5 });

        // Create a container for the page
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page-container';
        pageContainer.style.position = 'relative';

        // Create a canvas for rendering the page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render the page onto the canvas
        await page.render({
            canvasContext: context,
            viewport: viewport,
        }).promise;

        pageContainer.appendChild(canvas);

        // Render the annotation layer for links
        const annotationLayer = document.createElement('div');
        annotationLayer.className = 'annotation-layer';
        annotationLayer.style.position = 'absolute';
        annotationLayer.style.top = 0;
        annotationLayer.style.left = 0;
        annotationLayer.style.width = `${viewport.width}px`;
        annotationLayer.style.height = `${viewport.height}px`;
        annotationLayer.style.pointerEvents = 'none';

        // Get and render annotations
        const annotations = await page.getAnnotations();
        pdfjsLib.AnnotationLayer.render({
            annotations,
            viewport,
            div: annotationLayer,
            page,
            linkService: new pdfjsLib.PDFLinkService(),
        });

        pageContainer.appendChild(annotationLayer);
        pdfViewer.appendChild(pageContainer);
    }
};

// Handle form submission
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(uploadForm);
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        const fileUrl = result.fileUrl;
        renderPDF(fileUrl);
        alert(`PDF uploaded successfully! Share this link: ${fileUrl}`);
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('There was an error uploading the file. Please try again.');
    }
});