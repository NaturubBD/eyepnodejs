const { bkashWebhook, sslCommerzIpnWebhook, agoraWebhook } = require("../controller/WebhookController");

const webhookRouter = require("express").Router();
require("express-group-routes");
webhookRouter.group("/webhook", (webhook) => {
  webhook.post("/bkashPayment", bkashWebhook);
  webhook.post("/ssl-commerz-payment-ipn-handler", sslCommerzIpnWebhook);


  webhook.all("/agora-webhook", agoraWebhook);
});

module.exports = webhookRouter;
