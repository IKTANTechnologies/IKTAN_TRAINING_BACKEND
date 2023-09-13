const express = require('express');
const {  getCheckoutSession, allBooking } = require('../controllers/bookingController');
const { protect } = require('../controllers/authController');
const router = express.Router();

//Obtener session de pago
router.route('/checkout-session/:cursoID').get(protect,getCheckoutSession);

router.route('/').get(allBooking)
module.exports = router;