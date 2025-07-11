const express = require('express');
const router = express.Router();
const alimentosController = require('../controllers/alimentosController');
const authMiddleware = require('../middlewares/authMiddlewares');

router.get('/', authMiddleware, alimentosController.listarAlimentos);
router.get('/buscar', authMiddleware, alimentosController.buscarAlimentosPorNome);

module.exports = router;
