const express = require ('express');
const router = express.Router();
const fichaController = require('../controllers/fichaController');
const authMiddleware = require('../middlewares/authMiddlewares');


router.post('/refeicao', authMiddleware, fichaController.criarFicha);
router.get ('/', authMiddleware, fichaController.listarFichas);
router.delete('/:id', authMiddleware, fichaController.deletarFicha);
router.post('/recomendar', authMiddleware, fichaController.recomendarDieta);


module.exports = router;