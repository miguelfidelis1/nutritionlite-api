const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddlewares');
const { validarCadastroUsuario, validarLogin } = require('../middlewares/validacoesUsuarios');
const validarErros = require('../middlewares/validarErros');
const { limiteLogin } = require('../middlewares/rateLimiter');

router.post('/cadastro', validarCadastroUsuario, validarErros, userController.cadastrarUsuario);
router.post('/login', limiteLogin, validarLogin, validarErros, userController.loginUsuario);

router.delete('/deletar', authMiddleware, userController.deletarUsuario);

router.get('/perfil', authMiddleware, (req, res) => {
    res.status(200).json({
        mensagem: 'Perfil acessado com sucesso!',
        usuario: req.usuario
    });
});

module.exports = router;
