import express from 'express';
import { createShortUrl, unlockProtected, exportCsv, exportPdf, adminCleanupExpired } from '../controller/short_url.controller.js';
const router = express.Router();

router.post("/",createShortUrl);
router.post("/:id/unlock", unlockProtected);
router.get("/links/:id/export.csv", exportCsv);
router.get("/links/:id/export.pdf", exportPdf);
router.post("/admin/cleanup", adminCleanupExpired);

export default router;