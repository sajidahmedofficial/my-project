// agent-notes: { ctx: "PDFKit certificate generator service creating physical PDF files in generated/certificates", deps: ["pdfkit", "fs", "path", "uuid", "crypto"], state: "active", last: "anti@2026-08-06" }
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import crypto from "crypto";

export async function generateCertificate({
  name = "Aarav Sharma",
  skill = "React",
  score = 91
}) {
  const cleanSkill = (skill || "REACT").toUpperCase().replace(/\s+/g, "-");
  const certificateId = `SB-${cleanSkill}-${Date.now()}`;

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

  doc.pipe(
    fs.createWriteStream(
      filePath
    )
  );

  doc
    .fontSize(28)
    .text(
      "SKILLBRIDGE AI",
      {
        align: "center"
      }
    );

  doc.moveDown();

  doc
    .fontSize(20)
    .text(
      "CERTIFICATE OF SKILL MASTERY",
      {
        align: "center"
      }
    );

  doc.moveDown(2);

  doc
    .fontSize(18)
    .text(
      "This certificate is awarded to",
      {
        align: "center"
      }
    );

  doc.moveDown();

  doc
    .fontSize(26)
    .text(
      name,
      {
        align: "center"
      }
    );

  doc.moveDown();

  doc
    .fontSize(18)
    .text(
      `for successfully demonstrating proficiency in ${skill}`,
      {
        align: "center"
      }
    );

  doc.moveDown();

  doc
    .fontSize(18)
    .text(
      `Verified Score: ${score}/100`,
      {
        align: "center"
      }
    );

  doc.moveDown(3);

  doc
    .fontSize(12)
    .text(
      `Certificate ID: ${certificateId}`,
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
    pdfPath: filePath
  };
}

export const issueCertificate = async (userName, skillName, score) => {
  return generateCertificate({ name: userName, skill: skillName, score });
};

export default {
  generateCertificate,
  issueCertificate
};
