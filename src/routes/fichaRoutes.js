const express = require ('express');
const router = express.Router();
const fichaController = require('../controllers/fichaController');
const authMiddleware = require('../middlewares/authMiddlewares');


router.post('/refeicao', authMiddleware, fichaController.criarFicha);
router.get ('/', authMiddleware, fichaController.listarFichas);

module.exports = router;