const express = require('express');
const { createConstancia } = require('../controllers/constanciaController');

const {createRespuestaEF, oneRespuestaEF, allRespuestaEF, updateRespuestaEF, 
    deleteRespuestaEF, setCursoUserIds, validarCurso, asignarCalificacion, validarCalificacion} = require('../controllers/respuestaEFController')
const {protect, restrictTo}= require('../controllers/authController')
const router = express.Router({mergeParams: true});
//Todas las rutas deben de estar authenticados
router.use(protect);

router.route('/').post(restrictTo('user',"empresa"),setCursoUserIds,validarCurso,asignarCalificacion,validarCalificacion,createConstancia,createRespuestaEF).get(restrictTo( "administrador", "capacitador"),allRespuestaEF);

router.route('/:id').get(restrictTo("administrador", "capacitador"),oneRespuestaEF).patch(restrictTo('administrador'),updateRespuestaEF).delete(restrictTo('administrador'),deleteRespuestaEF);

module.exports = router;