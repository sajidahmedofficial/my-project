import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import persistentStore from "../storage/persistentStore.js";

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production');
const CERTIFICATES_DIR = isServerless
  ? path.join(os.tmpdir(), "skillbridge_certificates")
  : path.join(process.cwd(), "generated", "certificates");

try {
  if (!fs.existsSync(CERTIFICATES_DIR)) {
    fs.mkdirSync(CERTIFICATES_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Certificates directory init notice:", e.message);
}

/**
 * Creates physical PDF certificate file on disk
 */
function createCertificatePdfFile({ certificateId, userName, skillName, score, issueDate, verificationStatus = "VERIFIED" }) {
  const filePath = path.join(CERTIFICATES_DIR, `${certificateId}.pdf`);

  if (!PDFDocument) {
    try {
      fs.writeFileSync(filePath, Buffer.from(`SkillBridge AI Certificate: ${certificateId}\nIssued to: ${userName}\nSkill: ${skillName}\nScore: ${score}%`), 'utf-8');
    } catch {}
    return filePath;
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 50
  });

  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Outer Border Frame
  doc
    .rect(20, 20, 555, 802)
    .lineWidth(3)
    .strokeColor('#7c3aed')
    .stroke();

  // Inner Border Frame
  doc
    .rect(26, 26, 543, 790)
    .lineWidth(1)
    .strokeColor('#ec4899')
    .stroke();

  doc.moveDown(2);

  doc
    .fillColor('#7c3aed')
    .fontSize(28)
    .font('Helvetica-Bold')
    .text("SKILL BRIDGE AI", { align: "center" });

  doc.moveDown(0.5);

  doc
    .fillColor('#111827')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text("CERTIFICATE OF SKILL VERIFICATION", { align: "center" });

  doc.moveDown(1.5);

  doc
    .fillColor('#4b5563')
    .fontSize(16)
    .font('Helvetica')
    .text("This certifies that", { align: "center" });

  doc.moveDown(0.8);

  doc
    .fillColor('#111827')
    .fontSize(28)
    .font('Helvetica-Bold')
    .text(userName, { align: "center" });

  doc.moveDown(1);

  doc
    .fillColor('#4b5563')
    .fontSize(15)
    .font('Helvetica')
    .text("has successfully demonstrated verified technical competency in", { align: "center" });

  doc.moveDown(0.5);

  doc
    .fillColor('#7c3aed')
    .fontSize(24)
    .font('Helvetica-Bold')
    .text(skillName, { align: "center" });

  doc.moveDown(1.5);

  doc
    .fillColor('#111827')
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(`Verification Score: ${score}%  |  Passing Threshold: 80%`, { align: "center" });

  doc.moveDown(0.5);

  doc
    .fillColor('#059669')
    .fontSize(13)
    .font('Helvetica-Bold')
    .text(`Status: ${verificationStatus.toUpperCase()} & AUTHENTICATED BY SKILL BRIDGE AI`, { align: "center" });

  doc.moveDown(3);

  doc
    .fillColor('#6b7280')
    .fontSize(11)
    .font('Helvetica')
    .text(`Certificate ID: ${certificateId}  •  Issue Date: ${issueDate}`, { align: "center" });

  doc.end();

  return filePath;
}

/**
 * Authoritatively issues a skill certificate ONLY when verification.status === "verified" AND finalScore >= passingThreshold
 */
export async function issueVerifiedCertificate({
  userId = "guest_user",
  userName = "SkillBridge Student",
  skillName,
  verificationStatus = "verified",
  finalScore,
  passingThreshold = 75,
  verificationId = null
}) {
  if (!skillName) {
    throw new Error("skillName is required for certificate generation");
  }

  // 1. Strict Gate: ONLY issue certificate when status is "verified" AND score >= threshold
  const isStatusVerified = verificationStatus === "verified" || verificationStatus === "VERIFIED" || verificationStatus === "PASSED";
  const numScore = Number(finalScore);

  if (!isStatusVerified || isNaN(numScore) || numScore < passingThreshold) {
    throw new Error(`Certificate rejected: Cannot create certificate for unverified assessment. (Status: "${verificationStatus}", Score: ${numScore}%, Required: >=${passingThreshold}%)`);
  }

  // 2. Prevent duplicate certificates for the same verification / user skill
  const existingCert = persistentStore.findOne('certificates', { userId, skillName });
  if (existingCert) {
    // If physical file exists, return existing
    const existingFile = path.join(CERTIFICATES_DIR, `${existingCert.certificateId}.pdf`);
    if (!fs.existsSync(existingFile)) {
      createCertificatePdfFile({
        certificateId: existingCert.certificateId,
        userName: existingCert.userName || userName,
        skillName: existingCert.skillName,
        score: existingCert.score,
        issueDate: existingCert.issueDate ? new Date(existingCert.issueDate).toLocaleDateString() : new Date().toLocaleDateString(),
        verificationStatus: "VERIFIED"
      });
    }
    return existingCert;
  }

  // 3. Generate unique cryptographically random Certificate ID
  const cleanSkill = skillName.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const randomToken = crypto.randomBytes(3).toString('hex').toUpperCase();
  const certificateId = `SBA-${cleanSkill}-${randomToken}`;

  const issueDateFormatted = new Date().toLocaleDateString();
  const issueDateIso = new Date().toISOString();

  // 4. Generate Physical PDF
  const filePath = createCertificatePdfFile({
    certificateId,
    userName,
    skillName,
    score: numScore,
    issueDate: issueDateFormatted,
    verificationStatus: "VERIFIED"
  });

  const payload = `${userName}|${skillName}|${numScore}|${certificateId}`;
  const verificationHash = crypto.createHash('sha256').update(payload).digest('hex');

  const certRecord = {
    certificateId,
    userId,
    userName,
    skillName,
    score: numScore,
    passingThreshold,
    status: "verified",
    verificationStatus: "VERIFIED",
    verificationId,
    verificationHash,
    filePath,
    pdfUrl: `/api/certificates/${certificateId}/download`,
    issueDate: issueDateIso,
    issuedAt: issueDateIso
  };

  // 5. Store certificate in persistent storage
  persistentStore.upsert('certificates', 'certificateId', certRecord);

  return certRecord;
}

export const generateCertificate = async ({ name, skill, score, level, userId, status, threshold }) => {
  return issueVerifiedCertificate({
    userId: userId || "guest_user",
    userName: name,
    skillName: skill,
    finalScore: score,
    verificationStatus: status || "verified",
    passingThreshold: threshold || 75
  });
};

export default {
  issueVerifiedCertificate,
  generateCertificate
};
