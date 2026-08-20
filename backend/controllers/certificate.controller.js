// agent-notes: { ctx: "Express controller for certificate generation, verification and PDF download", deps: ["../services/certificate.service.js", "fs", "path"], state: "active", last: "anti@2026-08-20" }
import fs from 'fs';
import path from 'path';
import { issueCertificate, generateCertificate as createCert } from '../services/certificate.service.js';

export const generateCertificate = async (req, res) => {
  try {
    const { userName = 'SkillBridge Student', skillName = 'React.js', score = 92, level = 'Advanced' } = req.body;
    const cert = await createCert({ name: userName, skill: skillName, score, level });
    return res.status(200).json({ success: true, data: cert, certificate: cert });
  } catch (err) {
    return res.status(500).json({ error: "Failed to generate certificate", message: err.message });
  }
};

export const downloadCertificatePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const directory = path.join(process.cwd(), "generated", "certificates");
    const filePath = path.join(directory, `${id}.pdf`);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${id}.pdf"`);
      const fileStream = fs.createReadStream(filePath);
      return fileStream.pipe(res);
    }

    // If PDF file does not exist on disk, generate on the fly
    const skillName = id.split('-')[1] || "Skill";
    const cert = await createCert({ name: "SkillBridge Student", skill: skillName, score: 90, level: "Advanced" });
    if (fs.existsSync(cert.filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${id}.pdf"`);
      return fs.createReadStream(cert.filePath).pipe(res);
    }

    return res.status(404).json({ error: "Certificate PDF not found" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to stream certificate PDF", message: err.message });
  }
};

export default {
  generateCertificate,
  downloadCertificatePdf
};
