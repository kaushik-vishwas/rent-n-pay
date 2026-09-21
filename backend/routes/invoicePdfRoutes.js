import express from 'express';
import { downloadInvoicePdf } from '../controller/invoicePdfController.js';

const router = express.Router();

/**
 * DOWNLOAD INVOICE PDF
 */
router.get('/invoice-pdf/:orderId', downloadInvoicePdf);

export default router;
