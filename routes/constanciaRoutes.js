const express = require('express');
const { allConstancia  } = require('../controllers/constanciaController');
const { protect } = require('../controllers/authController');
const router = express.Router();

router.route('/').get(allConstancia);

module.exports = router;