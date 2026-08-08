// agent-notes: { ctx: "Express controller for certificate generation and verification", deps: ["../services/certificate.service.js"], state: "active", last: "anti@2026-08-06" }
import { issueCertificate } from '../services/certificate.service.js';

export const generateCertificate = async (req, res) => {
  const { userName = 'User', skillName } = req.body;
  const cert = await issueCertificate(userName, skillName);
  return res.status(200).json({ success: true, data: cert });
};
