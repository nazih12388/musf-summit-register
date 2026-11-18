import { jsPDF } from 'jspdf';

/**
 * Renders an official Academic Merit Certificate on A4 Landscape
 * Exclusively for:
 * 1. Top Performers of the Month (Overall & Section-wise Apex Distinction)
 * 2. Class-Wise Top Performers (Class Topper & Scholastic Excellence)
 */
function drawAcademicCertificatePage(doc, certData) {
  const {
    studentName = "Student Participant",
    cicNo = "WAFY-ID",
    className = "Wafy Academic Class",
    teamName = "House Team",
    category = "TOP_PERFORMER_MONTH",
    awardTitle = "Top Performer of the Month",
    citation = "For outstanding scholastic distinction, eloquent summit presentations, and academic leadership.",
    monthLabel = "Academic Month",
    marksPercentage = 95,
    attendancePercentage = 100,
    grade = "A",
    issueDate = new Date().toISOString().slice(0, 10),
    collegeName = "MAJLIS UMARIYYA WAFY COLLEGE"
  } = certData;

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Background subtle ivory / off-white
  doc.setFillColor(252, 252, 250);
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
  doc.text(collegeName.toUpperCase(), width / 2, 28, { align: 'center' });

  // Summit Register Subtitle
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(14, 124, 134); // Teal #0E7C86
  doc.text("DIRECTORATE OF ACADEMIC & TALENT SUMMITS • MUSF REGISTER", width / 2, 35, { align: 'center' });

  // Certificate Title based on Category
  doc.setFont('times', 'bold');
  doc.setFontSize(23);
  doc.setTextColor(15, 23, 42);

  const mainCertHeading = category === 'CLASS_TOPPER'
    ? "CERTIFICATE OF CLASS-WISE SCHOLASTIC EXCELLENCE"
    : "CERTIFICATE OF APEX ACADEMIC DISTINCTION";

  doc.text(mainCertHeading, width / 2, 49, { align: 'center' });

  // Sub-badge: Category Name
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(13);
  doc.setTextColor(201, 162, 39); // Gold
  const categorySub = category === 'CLASS_TOPPER'
    ? "CLASS TOPPER & ACADEMIC MERIT DISTINCTION"
    : "TOP PERFORMER OF THE MONTH";
  doc.text(categorySub, width / 2, 56, { align: 'center' });

  // Gold Divider Line
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(1);
  doc.line(width / 2 - 55, 60, width / 2 + 55, 60);

  // Body Prose
  doc.setFont('times', 'normal');
  doc.setFontSize(12.5);
  doc.setTextColor(51, 65, 85);
  doc.text("This prestigious credential of collegiate honor is conferred upon", width / 2, 71, { align: 'center' });

  // Recipient Student Name
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(15, 42, 74);
  doc.text(studentName || "Participant", width / 2, 84, { align: 'center' });

  // Student Identity Line
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`CIC No: ${cicNo || '-'}   •   Class: ${className || '-'}   •   House: ${teamName || '-'}`, width / 2, 92, { align: 'center' });

  // Award Title
  doc.setFont('times', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(201, 162, 39); // Gold
  doc.text(awardTitle.toUpperCase(), width / 2, 107, { align: 'center' });

  // Citation text (wrapped if long)
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);

  const cleanCitation = citation || "For exemplary performance, summit eloquence, and intellectual distinction.";
  const splitCitation = doc.splitTextToSize(cleanCitation, width - 80);
  doc.text(splitCitation, width / 2, 118, { align: 'center' });

  // Month & Metrics Details
  const metricsY = 136;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(width / 2 - 80, metricsY - 5, 160, 14, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.roundedRect(width / 2 - 80, metricsY - 5, 160, 14, 2, 2, 'D');

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 42, 74);
  const metricsText = `Period: ${monthLabel}   •   Score: ${Number(marksPercentage).toFixed(1)}% (Grade: ${grade || 'A'})   •   Attendance: ${Number(attendancePercentage).toFixed(1)}%`;
  doc.text(metricsText, width / 2, metricsY + 4, { align: 'center' });

  // Date and Accreditation
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Authenticated by Directorate of Summits, Majlis Umariyya Wafy College  •  Issue Date: ${issueDate}`, width / 2, 155, { align: 'center' });

  // Signatures Line
  const sigY = 178;
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

  const cleanName = (certData.studentName || 'Student').replace(/\s+/g, '_');
  const cleanTitle = (certData.awardTitle || certData.category || 'Certificate').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Certificate_${cleanName}_${cleanTitle}.pdf`;
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

  doc.save(`MUSF_Merit_Certificates_Batch_${new Date().toISOString().slice(0, 10)}.pdf`);
}
