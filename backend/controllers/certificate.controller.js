// agent-notes: { ctx: "Express controller for certificate verification validation and secure PDF streaming", deps: ["../services/certificate.service.js", "../storage/persistentStore.js", "fs", "path"], state: "active", last: "anti@2026-08-20" }
import fs from 'fs';
import path from 'path';
import { issueVerifiedCertificate } from '../services/certificate.service.js';
import persistentStore from '../storage/persistentStore.js';

export const generateCertificate = async (req, res) => {
  try {
    const { 
      userId = 'guest_user', 
      userName = 'SkillBridge Student', 
      skillName, 
      score, 
      verificationStatus, 
      status, 
      passingThreshold = 80, 
      verificationId 
    } = req.body;

    const currentStatus = verificationStatus || status;

    if (!skillName || typeof score !== 'number') {
      return res.status(400).json({ error: "skillName and numerical score are required." });
    }

    if (currentStatus !== 'verified' || score < passingThreshold) {
      return res.status(400).json({
        error: "Certificate generation rejected",
        message: `A certificate can only be created when verification.status === "verified" and finalScore >= ${passingThreshold}%. (Submitted: status="${currentStatus}", score=${score}%)`
      });
    }

    const cert = await issueVerifiedCertificate({
      userId,
      userName,
      skillName,
      verificationStatus: currentStatus,
      finalScore: score,
      passingThreshold,
      verificationId
    });

    return res.status(200).json({ success: true, data: cert, certificate: cert });
  } catch (err) {
    return res.status(400).json({ error: "Failed to generate certificate", message: err.message });
  }
};

export const downloadCertificatePdf = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Certificate ID is required" });
    }

    // Look up certificate in persistent storage
    const certRecord = persistentStore.findOne('certificates', { certificateId: id });
    const localDir = path.join(process.cwd(), "generated", "certificates");
    const tmpDir = path.join(os.tmpdir(), "skillbridge_certificates");
    
    let filePath = certRecord?.filePath;
    if (!filePath || !fs.existsSync(filePath)) {
      if (fs.existsSync(path.join(localDir, `${id}.pdf`))) {
        filePath = path.join(localDir, `${id}.pdf`);
      } else if (fs.existsSync(path.join(tmpDir, `${id}.pdf`))) {
        filePath = path.join(tmpDir, `${id}.pdf`);
      }
    }

    if (filePath && fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${id}.pdf"`);
      const fileStream = fs.createReadStream(filePath);
      return fileStream.pipe(res);
    }

    if (certRecord && certRecord.status === 'verified') {
      // Re-render PDF if record is authentic
      const regeneratedCert = await issueVerifiedCertificate({
        userId: certRecord.userId,
        userName: certRecord.userName,
        skillName: certRecord.skillName,
        verificationStatus: certRecord.status,
        finalScore: certRecord.score,
        passingThreshold: certRecord.passingThreshold || 80,
        verificationId: certRecord.verificationId
      });

      const regenPath = regeneratedCert.filePath || path.join(localDir, `${id}.pdf`);
      if (fs.existsSync(regenPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${id}.pdf"`);
        return fs.createReadStream(regenPath).pipe(res);
      }
    }

    // Do NOT fabricate certificates for non-existent or unverified IDs
    return res.status(404).json({ 
      error: "Certificate not found", 
      message: `No verified certificate exists with ID "${id}".` 
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to stream certificate PDF", message: err.message });
  }
};

export default {
  generateCertificate,
  downloadCertificatePdf
};
