const fs = require('fs');
const path = require('path');

const JSPDF_PATH = path.resolve(__dirname, '..', 'client', 'node_modules', 'jspdf');
const { jsPDF } = require(JSPDF_PATH);

const ROOT = path.resolve(__dirname, '..', 'server');

const FILES = [
  'index.js',
  'db/database.js',
  'db/seed.js',
  'middleware/auth.js',
  'middleware/upload.js',
  'models/Address.js',
  'models/Counter.js',
  'models/Coupon.js',
  'models/FinishUpcharge.js',
  'models/Order.js',
  'models/OrderItem.js',
  'models/OrderStatusHistory.js',
  'models/PricingRule.js',
  'models/Product.js',
  'models/Review.js',
  'models/User.js',
  'controllers/addressController.js',
  'controllers/authController.js',
  'controllers/couponController.js',
  'controllers/dashboardController.js',
  'controllers/orderController.js',
  'controllers/pricingController.js',
  'controllers/productController.js',
  'controllers/reviewController.js',
  'routes/addresses.js',
  'routes/auth.js',
  'routes/coupons.js',
  'routes/dashboard.js',
  'routes/orders.js',
  'routes/pricing.js',
  'routes/products.js',
  'routes/reviews.js',
  'routes/upload.js',
];

const FONT_SIZE = 6.5;
const LINE_HEIGHT = FONT_SIZE * 0.3528 * 1.22;
const HEADER_LINE_HEIGHT = FONT_SIZE * 0.3528 * 1.27;
const MARGIN_LEFT = 8;
const MARGIN_RIGHT = 8;
const MARGIN_TOP = 10;
const MARGIN_BOTTOM = 10;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

let totalCodeLines = 0;
FILES.forEach(fp => {
  const c = fs.readFileSync(path.join(ROOT, fp), 'utf-8');
  totalCodeLines += c.split('\n').length;
});
console.log(`Total code lines: ${totalCodeLines}`);

const estLines = totalCodeLines + FILES.length * 3 + 10;
const estPages = Math.ceil(estLines * LINE_HEIGHT / (PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM));
console.log(`Estimated pages (${FONT_SIZE}pt, ${LINE_HEIGHT.toFixed(2)}mm/line): ${estPages}`);

let actualFontSize = FONT_SIZE;
let actualLineHeight = LINE_HEIGHT;
if (estPages > 20) {
  const targetLines = (PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM) * 20 / LINE_HEIGHT;
  const ratio = estLines / targetLines;
  actualFontSize = Math.max(4.5, FONT_SIZE / Math.sqrt(ratio));
  actualLineHeight = actualFontSize * 0.3528 * 1.22;
  console.log(`Adjusting to ${actualFontSize.toFixed(1)}pt, ${actualLineHeight.toFixed(2)}mm/line to fit 20 pages`);
} else if (estPages < 18) {
  actualFontSize = Math.min(9, FONT_SIZE * (18 / estPages));
  actualLineHeight = actualFontSize * 0.3528 * 1.22;
  console.log(`Adjusting up to ${actualFontSize.toFixed(1)}pt, ${actualLineHeight.toFixed(2)}mm/line to fill ~20 pages`);
}

const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

let y = MARGIN_TOP;

function addPageIfNeeded(extraHeight = actualLineHeight) {
  if (y + extraHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
    doc.addPage();
    y = MARGIN_TOP;
  }
}

function writeLine(text, overrideSize) {
  addPageIfNeeded();
  const size = overrideSize || actualFontSize;
  doc.setFontSize(size);

  const charWidth = size * 0.6 * 0.3528;
  const maxChars = Math.floor((CONTENT_WIDTH - 1) / charWidth);

  if (text.length > maxChars && maxChars > 0) {
    let remaining = text;
    while (remaining.length > 0) {
      const chunk = remaining.substring(0, maxChars);
      doc.text(chunk, MARGIN_LEFT, y);
      remaining = remaining.substring(maxChars);
      y += actualLineHeight;
      if (remaining.length > 0) addPageIfNeeded();
    }
  } else {
    doc.text(text, MARGIN_LEFT, y);
    y += actualLineHeight;
  }
}

FILES.forEach((filePath) => {
  const fullPath = path.join(ROOT, filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');

  addPageIfNeeded(HEADER_LINE_HEIGHT * 3);

  const header = `// File: server/${filePath}`;
  const separator = '// ' + '='.repeat(Math.min(80, Math.floor(CONTENT_WIDTH / (actualFontSize * 0.6 * 0.3528)) - 4));
  const lineCount = `// Lines: ${lines.length}`;

  doc.setFont('Courier', 'bold');
  doc.setFontSize(actualFontSize + 0.5);
  doc.text(`${header}  (${lineCount})`, MARGIN_LEFT, y);
  y += HEADER_LINE_HEIGHT;

  doc.text(separator, MARGIN_LEFT, y);
  y += actualLineHeight;

  y += actualLineHeight * 0.3;

  doc.setFont('Courier', 'normal');
  lines.forEach((line) => {
    writeLine(line);
  });

  y += actualLineHeight * 0.3;
});

for (let i = 1; i <= doc.getNumberOfPages(); i++) {
  doc.setPage(i);
  doc.setFontSize(7);
  doc.setFont('Courier', 'normal');
  doc.text(`— ${i} —`, PAGE_WIDTH / 2, PAGE_HEIGHT - 8, { align: 'center' });

  if (i === 1) {
    doc.setFontSize(8);
    doc.setFont('Courier', 'bold');
    doc.text('PrintShop — Server Source Code', PAGE_WIDTH / 2, 6, { align: 'center' });
  }
}

const outPath = path.resolve(__dirname, '..', 'printshop-server-source.pdf');
doc.save(outPath);
console.log(`\nPDF generated: ${outPath}`);
console.log(`Total pages: ${doc.getNumberOfPages()}`);
console.log(`Font size: ${actualFontSize.toFixed(1)}pt, Line height: ${actualLineHeight.toFixed(2)}mm`);
