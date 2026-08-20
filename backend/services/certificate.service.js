// agent-notes: { ctx: "PDFKit certificate generator service creating physical PDF files in generated/certificates", deps: ["pdfkit", "fs", "path", "crypto"], state: "active", last: "anti@2026-08-20" }
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function generateCertificate({
  name = "Aarav Sharma",
  skill = "React.js",
  score = 91,
  level = "Advanced"
}) {
  const cleanSkill = (skill || "SKILL").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const certificateId = `SBA-${cleanSkill}-${randomSuffix}`;

  const directory = path.join(
    process.cwd(),
    "generated",
    "certificates"
  );

  fs.mkdirSync(
    directory,
    {
      recursive: true
    }
  );

  const filePath = path.join(
    directory,
    `${certificateId}.pdf`
  );

  const doc = new PDFDocument({
    size: "A4",
    margin: 50
  });

  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Border frame
  doc
    .rect(20, 20, 555, 802)
    .lineWidth(3)
    .strokeColor('#7c3aed')
    .stroke();

  doc
    .rect(26, 26, 543, 790)
    .lineWidth(1)
    .strokeColor('#ec4899')
    .stroke();

  doc.moveDown(2);

  doc
    .fillColor('#7c3aed')
    .fontSize(28)
    .text(
      "SKILL BRIDGE AI",
      {
        align: "center"
      }
    );

  doc.moveDown(0.5);

  doc
    .fillColor('#111827')
    .fontSize(22)
    .text(
      "CERTIFICATE OF SKILL VERIFICATION",
      {
        align: "center"
      }
    );

  doc.moveDown(1.5);

  doc
    .fillColor('#4b5563')
    .fontSize(16)
    .text(
      "This certifies that",
      {
        align: "center"
      }
    );

  doc.moveDown(0.8);

  doc
    .fillColor('#111827')
    .fontSize(28)
    .text(
      name,
      {
        align: "center"
      }
    );

  doc.moveDown(1);

  doc
    .fillColor('#4b5563')
    .fontSize(15)
    .text(
      `has successfully demonstrated verified technical competency in`,
      {
        align: "center"
      }
    );

  doc.moveDown(0.5);

  doc
    .fillColor('#7c3aed')
    .fontSize(24)
    .text(
      skill,
      {
        align: "center"
      }
    );

  doc.moveDown(1.5);

  doc
    .fillColor('#111827')
    .fontSize(14)
    .text(
      `Verification Score: ${score}%  |  Proficiency Level: ${level}`,
      {
        align: "center"
      }
    );

  doc.moveDown(0.5);

  doc
    .fillColor('#059669')
    .fontSize(12)
    .text(
      "Status: VERIFIED & AUTHENTICATED BY SKILL BRIDGE AI",
      {
        align: "center"
      }
    );

  doc.moveDown(3);

  doc
    .fillColor('#6b7280')
    .fontSize(11)
    .text(
      `Certificate ID: ${certificateId}  •  Issued: ${new Date().toLocaleDateString()}`,
      {
        align: "center"
      }
    );

  doc.end();

  const payload = `${name}|${skill}|${score}|${certificateId}`;
  const verificationHash = crypto.createHash('sha256').update(payload).digest('hex');

  return {
    certificateId,
    filePath,
    verificationHash,
    pdfUrl: `/api/certificates/${certificateId}/download`,
    issuedAt: new Date().toISOString()
  };
}

export const issueCertificate = async (userName, skillName, score, level = "Advanced") => {
  return generateCertificate({ name: userName, skill: skillName, score, level });
};

export default {
  generateCertificate,
  issueCertificate
};
