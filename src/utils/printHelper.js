/**
 * Robust Standalone Print & PDF Helper for Antigravity / Vite PWA
 * Safely prints HTML documents without dashboard clipping or blank pages.
 */

export const printHtmlDocument = ({
  title = 'Document',
  contentHtml = '',
  styles = '',
  orientation = 'portrait'
}) => {
  if (!contentHtml || typeof contentHtml !== 'string') {
    console.error('printHtmlDocument called without valid contentHtml');
    return false;
  }

  // Collect all stylesheet and link tags from active DOM
  let styleTags = '';
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => {
    styleTags += el.outerHTML;
  });

  // Create isolated hidden iframe
  const printIframe = document.createElement('iframe');
  printIframe.setAttribute(
    'style',
    'position:fixed;top:0;left:0;width:1px;height:1px;border:none;opacity:0;pointer-events:none;z-index:-9999;'
  );
  document.body.appendChild(printIframe);

  const iframeDoc = printIframe.contentWindow?.document;
  if (!iframeDoc) {
    console.error('Could not access iframe document, fallback to popup window');
    return fallbackWindowPrint(title, contentHtml, styleTags, styles, orientation);
  }

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      ${styleTags}
      <style>
        @page {
          size: A4 ${orientation};
          margin: 12mm 10mm 12mm 10mm;
        }
        *, *::before, *::after {
          box-sizing: border-box !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        html, body {
          background-color: #ffffff !important;
          color: #0f172a !important;
          font-family: 'Inter', 'Noto Sans Malayalam', 'Amiri', 'Traditional Arabic', 'Times New Roman', Georgia, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: auto !important;
          min-height: auto !important;
          overflow: visible !important;
          font-size: 11pt !important;
        }
        .print-no-break, tr, table, .break-inside-avoid {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        img {
          max-width: 100% !important;
          height: auto !important;
        }
        ${styles}
      </style>
    </head>
    <body>
      <div class="print-root-container" style="padding: 0; margin: 0; width: 100%;">
        ${contentHtml}
      </div>
    </body>
    </html>
  `);
  iframeDoc.close();

  const triggerPrint = () => {
    try {
      printIframe.contentWindow.focus();
      printIframe.contentWindow.print();
    } catch (err) {
      console.warn('Iframe print error, falling back to popup print:', err);
      fallbackWindowPrint(title, contentHtml, styleTags, styles, orientation);
    } finally {
      setTimeout(() => {
        if (printIframe && printIframe.parentNode) {
          printIframe.parentNode.removeChild(printIframe);
        }
      }, 4000);
    }
  };

  // Wait for images inside iframe to load completely
  const imgs = iframeDoc.images;
  if (!imgs || imgs.length === 0) {
    setTimeout(triggerPrint, 300);
  } else {
    let loaded = 0;
    const total = imgs.length;
    let timerFired = false;

    const onAllDone = () => {
      if (timerFired) return;
      timerFired = true;
      setTimeout(triggerPrint, 250);
    };

    for (let i = 0; i < total; i++) {
      if (imgs[i].complete) {
        loaded++;
      } else {
        imgs[i].addEventListener('load', () => {
          loaded++;
          if (loaded >= total) onAllDone();
        });
        imgs[i].addEventListener('error', () => {
          loaded++;
          if (loaded >= total) onAllDone();
        });
      }
    }

    if (loaded >= total) {
      onAllDone();
    } else {
      setTimeout(onAllDone, 1200); // safety fallback timeout
    }
  }

  return true;
};

const fallbackWindowPrint = (title, contentHtml, styleTags, customStyles, orientation) => {
  try {
    const printWin = window.open('', '_blank', 'width=900,height=800');
    if (!printWin) {
      window.print();
      return false;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        ${styleTags}
        <style>
          @page { size: A4 ${orientation}; margin: 12mm 10mm; }
          body { background: white !important; color: black !important; font-family: sans-serif; margin: 0; padding: 15px; }
          ${customStyles}
        </style>
      </head>
      <body>
        ${contentHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
    return true;
  } catch (e) {
    console.error('Fallback print window error:', e);
    window.print();
    return false;
  }
};

/**
 * Downloads full HTML content as an offline .html document that can be opened & printed from any device
 */
export const downloadHtmlFile = (filename, htmlContent, title = 'Document') => {
  try {
    let styleTags = '';
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => {
      styleTags += el.outerHTML;
    });

    const fullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  ${styleTags}
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { background: white; color: #0f172a; margin: 0; padding: 20px; font-family: sans-serif; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

    const blob = new Blob([fullDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Error downloading HTML file:', err);
    return false;
  }
};
