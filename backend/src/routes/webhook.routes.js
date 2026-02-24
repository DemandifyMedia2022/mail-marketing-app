

// routes/webhook.routes.js
import express from 'express';
import { handleZeptoWebhook } from '../controllers/webhook.controller.js';
const router = express.Router();

app.post('/api/webhooks/zeptomail', (req, res) => {
  console.log('ZeptoMail Webhook:', req.body);
  res.sendStatus(200);
});
router.post('/zepto-webhook', handleZeptoWebhook);

export default router;
