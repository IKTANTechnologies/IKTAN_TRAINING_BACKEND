const express = require('express');
const router = express.Router();
const { createEmpresa, updateEmpresa, tamañoPhotoEmpresa,uploadEmpresa, deleteEmpresa,getAllEmpresa, getEmpresa,updateSlugEmpresa } = require('../controllers/empresaController')
const {protect, restrictTo} = require('../controllers/authController');

router.use(protect);

router.route('/').post(restrictTo('administrador', 'capacitador'),uploadEmpresa,tamañoPhotoEmpresa,createEmpresa).get(restrictTo("administrador", "capacitador"),getAllEmpresa);
//router.route('/update-img-empresa/:id').patch(restrictTo('administrador','capacitador'),uploadEmpresa,tamañoPhotoEmpresa,updateEmpresa);

router.route('/:id').get(restrictTo("administrador", "capacitador"),getEmpresa).patch(restrictTo('administrador','capacitador'),uploadEmpresa,tamañoPhotoEmpresa,updateSlugEmpresa,updateEmpresa).delete(restrictTo('administrador','capacitador'),deleteEmpresa);

module.exports = router;