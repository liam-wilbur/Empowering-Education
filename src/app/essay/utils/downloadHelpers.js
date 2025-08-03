// downloadHelpers.js

/**
 * Download feedback in text format
 * @param {string} essayTitle - The title of the essay
 * @param {string} essayText - The original essay text
 * @param {string} feedback - The feedback content
 */
export const downloadAsTxt = (essayTitle, essayText, feedback) => {
  const fileName = getFileName(essayTitle);
  const textContent = `
Essay Title: ${essayTitle} 
--- ORIGINAL ESSAY ---
${essayText}

--- FEEDBACK ---
${feedback}`;
  
  const blob = new Blob([textContent], { type: 'text/plain' });
  downloadBlob(blob, `${fileName}.txt`);
};

/**
 * Download feedback in DOC format
 * @param {string} essayTitle - The title of the essay
 * @param {string} essayText - The original essay text
 * @param {string} feedback - The feedback content
 */
export const downloadAsDoc = (essayTitle, essayText, feedback) => {
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
      <h2>Original Essay</h2>
      <div class="essay">${essayText.replace(/\n/g, '<br>')}</div>
      <h2>Feedback</h2>
      <div class="feedback">${feedback.replace(/\n/g, '<br>')}</div>
    </body>
    </html>
  `;
  
  const blob = new Blob([docContent], { type: 'application/msword' });
  downloadBlob(blob, `${fileName}.doc`);
};

/**
 * Download feedback in PDF format
 * @param {string} essayTitle - The title of the essay
 * @param {string} essayText - The original essay text
 * @param {string} feedback - The feedback content
 */
export const downloadAsPdf = (essayTitle, essayText, feedback) => {
  import('jspdf').then(({ jsPDF }) => {
    // 1) Create new PDF, get page dimensions and set up margins
    const doc = new jsPDF(); // default: 'portrait', 'mm', 'a4'
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth  = doc.internal.pageSize.getWidth();
    const margin     = 20;        // 20 mm top/left/right margin
    let yPosition    = margin;    // start 20mm down from top

    // 2) Draw the title (“Feedback for <Essay Title>”)
    const titleText = `Feedback for "${essayTitle}"`;
    doc.setFontSize(18);
    // splitTextToSize will break long titles into multiple lines
    const splitTitleLines = doc.splitTextToSize(titleText, pageWidth - margin * 2);
    splitTitleLines.forEach((line) => {
      const lineHeight = 10; // roughly 10 mm per “title” line at fontSize 18

      // If the next line would spill off the bottom, create a new page.
      if (yPosition + lineHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    // 3) Leave some extra space below the title
    yPosition += 10; // 10 mm gap

    // 4) “Original Essay:” header
    doc.setFontSize(14);
    const headerLineHeight = 8; // about 8 mm at fontSize 14
    if (yPosition + headerLineHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text("Original Essay:", margin, yPosition);
    yPosition += headerLineHeight;

    // 5) Write the essay body, line by line, paginating as needed
    doc.setFontSize(12);
    const essayLineHeight = 7; // about 7 mm per line at fontSize 12
    const splitEssayLines = doc.splitTextToSize(essayText, pageWidth - margin * 2);

    splitEssayLines.forEach((line) => {
      if (yPosition + essayLineHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += essayLineHeight;
    });

    // 6) After the essay, leave a little vertical gap before “Feedback:”
    yPosition += 10;

    // 7) “Feedback:” header
    doc.setFontSize(14);
    if (yPosition + headerLineHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text("Feedback:", margin, yPosition);
    yPosition += headerLineHeight;

    // 8) Write the feedback body, line by line, paginating as needed
    doc.setFontSize(12);
    const feedbackLineHeight = 7; // same line height as essay
    const splitFeedbackLines = doc.splitTextToSize(feedback, pageWidth - margin * 2);

    splitFeedbackLines.forEach((line) => {
      if (yPosition + feedbackLineHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += feedbackLineHeight;
    });

    // 9) Finally, save
    const fileName = getFileName(essayTitle);
    doc.save(`${fileName}.pdf`);
  })
  .catch((err) => {
    console.error("Error loading jsPDF:", err);
    alert("PDF generation requires the jsPDF library.");
  });
};

//
// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────────
//

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