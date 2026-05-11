const express = require('express');
const {  getCheckoutSession, allBooking, filtrarBookingPorRol, asignarCursoUsuario, deleteBooking } = require('../controllers/bookingController');
const { protect, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.use(protect);

//Obtener session de pago
router.route('/checkout-session/:cursoID').get(protect,getCheckoutSession);

router.route('/').get(filtrarBookingPorRol, allBooking)
router.route('/asignar-curso').post(restrictTo('administrador'),asignarCursoUsuario)
router.route('/:id').delete(restrictTo('administrador'),deleteBooking)
module.exports = router;