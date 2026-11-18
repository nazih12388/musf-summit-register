import { jsPDF } from 'jspdf';

/**
 * Renders an official Academic Merit Certificate on A4 Landscape
 */
function drawAcademicCertificatePage(doc, certData) {
  const {
    studentName,
    chestNo,
    cicNo,
    teamName,
    programName,
    position,
    grade,
    date,
    collegeName = "MAJLIS UMARIYYA WAFY COLLEGE",
    festName = "MUSF SUMMIT REGISTER"
  } = certData;

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Background subtle off-white
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, width, height, 'F');

  // Outer Deep Navy Border
  doc.setDrawColor(15, 42, 74); // Navy #0F2A4A
  doc.setLineWidth(5);
  doc.rect(10, 10, width - 20, height - 20);

  // Inner Slate Blue Border
  doc.setDrawColor(51, 78, 115); // Slate Blue #334E73
  doc.setLineWidth(1.5);
  doc.rect(14, 14, width - 28, height - 28);

  // Corner Gold Accents
  doc.setFillColor(201, 162, 39); // Soft Gold #C9A227
  const cornerSize = 7;
  doc.rect(15, 15, cornerSize, cornerSize, 'F');
  doc.rect(width - 15 - cornerSize, 15, cornerSize, cornerSize, 'F');
  doc.rect(15, height - 15 - cornerSize, cornerSize, cornerSize, 'F');
  doc.rect(width - 15 - cornerSize, height - 15 - cornerSize, cornerSize, cornerSize, 'F');

  // College Name Header
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 42, 74);
  doc.text(collegeName.toUpperCase(), width / 2, 30, { align: 'center' });

  // Summit Register Subtitle
  doc.setFont('times', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(14, 124, 134); // Teal #0E7C86
  doc.text("DIRECTORATE OF ACADEMIC & TALENT SUMMITS", width / 2, 38, { align: 'center' });

  // Certificate Title
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  doc.text("CERTIFICATE OF MERIT & DISTINCTION", width / 2, 56, { align: 'center' });

  // Gold Divider Line
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(1);
  doc.line(width / 2 - 50, 60, width / 2 + 50, 60);

  // Body Prose
  doc.setFont('times', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(51, 65, 85);
  doc.text("This official credential is awarded to", width / 2, 74, { align: 'center' });

  // Recipient Student Name
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 42, 74);
  doc.text(studentName || "Participant", width / 2, 87, { align: 'center' });

  // Student Identity Line
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`Chest Number: ${chestNo || '-'}   |   CIC: ${cicNo || '-'}   |   House Team: ${teamName || '-'}`, width / 2, 95, { align: 'center' });

  // Position Achievement Text
  doc.setFont('times', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(51, 65, 85);
  doc.text("for outstanding performance and securing", width / 2, 108, { align: 'center' });

  // Position Badge
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(201, 162, 39); // Soft Gold
  doc.text(`${position.toUpperCase()} (GRADE: ${grade || 'A'})`, width / 2, 120, { align: 'center' });

  // Program Name
  doc.setFont('times', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(51, 65, 85);
  doc.text("in the collegiate competition event", width / 2, 130, { align: 'center' });

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(18);
  doc.setTextColor(15, 42, 74);
  doc.text(`"${programName}"`, width / 2, 142, { align: 'center' });

  // Date and Venue
  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Held under the auspices of Majlis Umariyya Wafy College  •  Date: ${date || '2026'}`, width / 2, 154, { align: 'center' });

  // Signatures Line
  const sigY = 180;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);

  // Left Signature: Principal
  doc.line(35, sigY, 85, sigY);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text("Principal", 60, sigY + 5, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text("Majlis Umariyya Wafy College", 60, sigY + 9, { align: 'center' });

  // Center Official Seal
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(1.2);
  doc.circle(width / 2, sigY - 5, 14);
  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(201, 162, 39);
  doc.text("COLLEGE SEAL", width / 2, sigY - 8, { align: 'center' });
  doc.text("WAFY SUMMIT", width / 2, sigY - 2, { align: 'center' });

  // Right Signature: Summit Director
  doc.line(width - 85, sigY, width - 35, sigY);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text("Summit Director", width - 60, sigY + 5, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text("Directorate of Summits", width - 60, sigY + 9, { align: 'center' });
}

/**
 * Downloads a single merit certificate as PDF
 */
export function generateCertificatePDF(certData) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  drawAcademicCertificatePage(doc, certData);

  const filename = `Certificate_${certData.studentName.replace(/\s+/g, '_')}_${certData.position.replace(/\s+/g, '')}.pdf`;
  doc.save(filename);
}

/**
 * Downloads all certificates in a single batch PDF
 */
export function bulkGenerateCertificatesPDF(certificatesList) {
  if (!certificatesList || certificatesList.length === 0) return;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  certificatesList.forEach((certData, index) => {
    if (index > 0) doc.addPage('a4', 'landscape');
    drawAcademicCertificatePage(doc, certData);
  });

  doc.save(`MUSF_Summit_Certificates_Batch_${new Date().toISOString().slice(0, 10)}.pdf`);
}
