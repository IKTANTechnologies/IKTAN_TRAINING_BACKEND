const express = require('express');
const router = express.Router();
const { uploadMateriales, subirMateriales,createTarea, allTarea, archivosTarea, updateTarea, deleteTarea } = require("../controllers/tareaController");
const {protect, restrictTo} = require('../controllers/authController');

router.route('/').post(protect,restrictTo("administrador", "capacitador"),uploadMateriales,subirMateriales, createTarea).get(allTarea)
router.route('/:id').patch(protect,restrictTo("administrador", "capacitador"),uploadMateriales,archivosTarea,updateTarea).delete(deleteTarea)
module.exports = router;