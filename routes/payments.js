const express = require('express');
const PaymentsController = require('../controllers/PaymentsController');
const viewAuth = require('../middlewares/viewAuth');

const router = express.Router();

router.post('/create-payment-intent', viewAuth(['cliente', 'admin', 'empleado']), PaymentsController.createPaymentIntent);
router.post('/webhook', express.raw({type: 'application/json'}), PaymentsController.handleWebhook);

module.exports = router;