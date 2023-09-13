const express = require('express');
const { protect } = require('../controllers/authController');
const { createModulo, uploadModuloArchivos, allModulos, updateModulo, deleteModulo, subirArchivos, imagenesModulo } = require('../controllers/moduloController');
const router = express.Router();


router.use(protect)
router.route('/').post(uploadModuloArchivos,subirArchivos,createModulo).get(allModulos);
router.route('/:id').patch(uploadModuloArchivos,imagenesModulo,updateModulo).delete(deleteModulo);

module.exports= router;