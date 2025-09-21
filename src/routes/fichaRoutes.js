const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const fichaController = require('../controllers/fichaController');
const authMiddleware = require('../middlewares/authMiddlewares');


router.post(
  '/refeicao',
  authMiddleware,
  [
    body('objetivo')
      .isString().withMessage('O objetivo deve ser um texto válido.')
      .isLength({ min: 3 }).withMessage('O objetivo deve ter pelo menos 3 caracteres.'),
    body('alimentos')
      .isArray({ min: 1 }).withMessage('A lista de alimentos deve conter ao menos 1 item.'),
  ],
  fichaController.criarFicha
);


router.get('/', authMiddleware, fichaController.listarFichas);


router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro válido.')],
  fichaController.deletarFicha
);


router.post(
  '/recomendar',
  authMiddleware,
  [
    body('objetivo')
      .isIn(['perder_peso', 'ganhar_massa', 'manter_saude'])
      .withMessage('Objetivo deve ser perder_peso, ganhar_massa ou manter_saude.'),
  ],
  fichaController.recomendarDieta
);

module.exports = router;