const PDFDocument = require('pdfkit');
const chunks = [];
const doc = new PDFDocument({ margin: 50 });
doc.on('data', (chunk) => chunks.push(chunk));
doc.on('end', () => {
  console.log('PDF length', Buffer.concat(chunks).length);
});
doc.text('test');
doc.end();
