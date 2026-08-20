// agent-notes: { ctx: "Express router for certificate generation and PDF download endpoints", deps: ["express", "../controllers/certificate.controller.js"], state: "active", last: "anti@2026-08-20" }
import express from 'express';
import { generateCertificate, downloadCertificatePdf } from '../controllers/certificate.controller.js';

const router = express.Router();

router.post('/generate', generateCertificate);
router.get('/:id/download', downloadCertificatePdf);
router.get('/:id', downloadCertificatePdf);

export default router;
