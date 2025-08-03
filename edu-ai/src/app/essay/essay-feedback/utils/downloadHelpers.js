// downloadHelpers.js

/**
 * Download feedback in text format
 * @param {string} essayTitle - The title of the essay
 * @param {string} feedback - The feedback content
 */
export const downloadAsTxt = (essayTitle, feedback) => {
  const fileName = getFileName(essayTitle);
  const textContent = `Essay Title: ${essayTitle}\n\n${feedback}`;
  
  const blob = new Blob([textContent], { type: 'text/plain' });
  downloadBlob(blob, `${fileName}.txt`);
};

/**
 * Download feedback in DOC format
 * @param {string} essayTitle - The title of the essay
 * @param {string} feedback - The feedback content
 */
export const downloadAsDoc = (essayTitle, feedback) => {
  const fileName = getFileName(essayTitle);
  const docContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Feedback for ${essayTitle}</title>
    </head>
    <body>
      <h1>Feedback for "${essayTitle}"</h1>
      ${feedback.replace(/\n/g, '<br>')}
    </body>
    </html>
  `;
  
  const blob = new Blob([docContent], { type: 'application/msword' });
  downloadBlob(blob, `${fileName}.doc`);
};

/**
 * Download feedback in PDF format
 * @param {string} essayTitle - The title of the essay
 * @param {string} feedback - The feedback content
 */
export const downloadAsPdf = (essayTitle, feedback) => {
  // You need to install jsPDF first:
  // npm install jspdf
  try {
    // Dynamically import jsPDF to avoid issues if it's not installed
    import('jspdf').then(({ jsPDF }) => {
      const fileName = getFileName(essayTitle);
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(`Feedback for "${essayTitle}"`, 20, 20);
      
      // Add content
      doc.setFontSize(12);
      
      // Split text to fit on PDF
      const splitText = doc.splitTextToSize(feedback, 170);
      doc.text(splitText, 20, 30);
      
      // Save PDF
      doc.save(`${fileName}.pdf`);
    }).catch(error => {
      console.error("Error loading jsPDF:", error);
      alert("PDF generation requires the jsPDF library. Please run: npm install jspdf");
    });
  } catch (error) {
    console.error("Error with PDF generation:", error);
    alert("PDF generation requires the jsPDF library. Please run: npm install jspdf");
  }
};

// Helper function to create a valid filename from the essay title
const getFileName = (essayTitle) => {
  return `feedback-${essayTitle.replace(/\s+/g, '-').toLowerCase() || 'essay'}`;
};

// Helper function to download a blob
const downloadBlob = (blob, fileName) => {
  const element = document.createElement('a');
  element.href = URL.createObjectURL(blob);
  element.download = fileName;
  
  // Append to the document, click, and clean up
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};