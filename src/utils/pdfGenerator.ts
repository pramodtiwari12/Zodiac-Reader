import { jsPDF } from 'jspdf';
import { NotebookContent, CanvasData } from '../types';

export function exportNotebookAsPdf(notebook: NotebookContent, sourcePdfTitle: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderHeaderFooter = (pageNum: number, totalEstPages: number = 1) => {
    // Header
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(110, 115, 122);
    doc.text(`Source: ${sourcePdfTitle}`, margin, 32);
    doc.text(dateFormatted, pageWidth - margin, 32, { align: 'right' });
    doc.setDrawColor(228, 228, 224);
    doc.setLineWidth(0.75);
    doc.line(margin, 38, pageWidth - margin, 38);

    // Footer
    doc.line(margin, pageHeight - 38, pageWidth - margin, pageHeight - 38);
    doc.setFontSize(8.5);
    doc.setTextColor(140, 145, 150);
    doc.text('Created with Zodiac Reader by Rizen', margin, pageHeight - 24);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 24, { align: 'right' });
  };

  let cursorY = 70;
  let pageNumber = 1;

  renderHeaderFooter(pageNumber);

  // Notebook Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(26, 26, 26);
  doc.text(notebook.title || 'Untitled Research Notebook', margin, cursorY);
  cursorY += 28;

  // Metadata badge
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(95, 99, 104);
  doc.text(`Citation Format: ${notebook.citationStyle || 'APA 7'}  •  Source Reference: ${sourcePdfTitle}`, margin, cursorY);
  cursorY += 24;

  // Body content lines
  const cleanBody = notebook.plainText || notebook.bodyHtml.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n');
  const lines = doc.splitTextToSize(cleanBody, contentWidth);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);

  const lineHeight = 18;

  for (let i = 0; i < lines.length; i++) {
    if (cursorY + lineHeight > pageHeight - 60) {
      doc.addPage();
      pageNumber++;
      renderHeaderFooter(pageNumber);
      cursorY = 60;
    }
    doc.text(lines[i], margin, cursorY);
    cursorY += lineHeight;
  }

  doc.save(`${notebook.title.replace(/\s+/g, '_')}_Zodiac_Notes.pdf`);
}

export function exportCanvasAsPdf(canvas: CanvasData, sourcePdfTitle: string): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Header
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 115, 122);
  doc.text(`Canvas: ${canvas.title}  |  Source Document: ${sourcePdfTitle}`, margin, 26);
  doc.text(dateFormatted, pageWidth - margin, 26, { align: 'right' });
  doc.setDrawColor(228, 228, 224);
  doc.setLineWidth(0.75);
  doc.line(margin, 32, pageWidth - margin, 32);

  // Canvas visual summary
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(26, 26, 26);
  doc.text(canvas.title, margin, 54);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(95, 99, 104);
  doc.text(`Total Nodes: ${canvas.nodes.length}  •  Wire Connections: ${canvas.wires.length}  •  Drawn Strokes: ${canvas.strokes.length}`, margin, 70);

  // Draw node boxes preview
  let boxY = 90;
  canvas.nodes.slice(0, 12).forEach((node, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const boxX = margin + col * 240;
    const currentBoxY = boxY + row * 90;

    if (currentBoxY + 80 < pageHeight - 50) {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(210, 212, 215);
      doc.roundedRect(boxX, currentBoxY, 225, 75, 6, 6, 'FD');

      // Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(31, 78, 121);
      doc.text(node.title.slice(0, 30), boxX + 10, currentBoxY + 18);

      // Node text preview
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      const snippet = (node.content.text || node.content.latex || node.type).slice(0, 80);
      const nodeLines = doc.splitTextToSize(snippet, 205);
      doc.text(nodeLines.slice(0, 3), boxX + 10, currentBoxY + 34);
    }
  });

  // Footer
  doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
  doc.setFontSize(8.5);
  doc.setTextColor(140, 145, 150);
  doc.text('Created with Zodiac Reader by Rizen', margin, pageHeight - 16);
  doc.text('Page 1 of 1', pageWidth - margin, pageHeight - 16, { align: 'right' });

  doc.save(`${canvas.title.replace(/\s+/g, '_')}_Zodiac_Canvas.pdf`);
}

export function exportCanvasAsPng(canvasElement: HTMLCanvasElement | null, title: string, scale: number = 2): void {
  if (!canvasElement) {
    alert('Canvas element not found for export');
    return;
  }
  const link = document.createElement('a');
  link.download = `${title.replace(/\s+/g, '_')}_${scale}x.png`;
  link.href = canvasElement.toDataURL('image/png');
  link.click();
}
