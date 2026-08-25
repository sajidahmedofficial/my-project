// agent-notes: { ctx: "Express router for certificate generation and PDF download endpoints with authentication", deps: ["express", "../controllers/certificate.controller.js", "../middleware/auth.js"], state: "active", last: "anti@2026-08-25" }
import express from 'express';
import { generateCertificate, downloadCertificatePdf } from '../controllers/certificate.controller.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateUser);

router.post('/generate', generateCertificate);
router.get('/:id/download', downloadCertificatePdf);
router.get('/:id', downloadCertificatePdf);

export default router;
