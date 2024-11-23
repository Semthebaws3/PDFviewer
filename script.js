const fileInput = document.getElementById('file-input');
const pdfViewer = document.getElementById('pdf-viewer');

// Configure PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// Function to render PDF
const renderPDF = async (file) => {
    const fileURL = URL.createObjectURL(file);
    const pdf = await pdfjsLib.getDocument(fileURL).promise;

    pdfViewer.innerHTML = ''; // Clear previous content

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: context,
            viewport: viewport,
        }).promise;

        pdfViewer.appendChild(canvas);
    }
};

// Event Listener for File Input
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file.type === 'application/pdf') {
        renderPDF(file);
    } else {
        alert('Please select a valid PDF file.');
    }
});
