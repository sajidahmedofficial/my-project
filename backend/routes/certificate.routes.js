// agent-notes: { ctx: "Express router for certificate generation endpoints", deps: ["express", "../controllers/certificate.controller.js"], state: "active", last: "anti@2026-08-06" }
import express from 'express';
import { generateCertificate } from '../controllers/certificate.controller.js';

const router = express.Router();

router.post('/generate', generateCertificate);

export default router;
