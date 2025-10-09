const bcrypt = require('bcrypt');
const { sql, poolPromise } = require('../config/db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { enviarEmail } = require('../utils/emailService');

// Cadastro
const cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const pool = await poolPromise;

    await pool.request()
      .input('nome', sql.VarChar, nome)
      .input('email', sql.VarChar, email)
      .input('senha', sql.VarChar, senhaHash)
      .query(`
        INSERT INTO usuarios (nome, email, senha_hash, data_cadastro, ultima_atualizacao)
        VALUES (@nome, @email, @senha, GETDATE(), GETDATE())
      `);

    return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Login
const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'Email e senha são obrigatórios!' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM usuarios WHERE email = @email');

    const usuario = result.recordset[0];
    if (!usuario) {
      return res.status(401).json({ mensagem: 'Email ou senha inválidos!' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Email ou senha inválidos!' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token: token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ Mensagem: 'Erro interno do servidor' });
  }
};

// Deletar usuário
const deletarUsuario = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id', sql.Int, usuarioId)
      .query('SELECT * FROM usuarios WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensagem: 'Usuario não encontrado.' });
    }

    await pool.request()
      .input('id', sql.Int, usuarioId)
      .query('DELETE FROM usuarios WHERE id = @id');

    return res.status(200).json({ mensagem: 'Usuario e fichas deletado com sucesso!' });

  } catch (error) {
    console.error('Erro ao deletar usuario:', error);
    return res.status(500).json({ mensagem: 'Erro ao excluir usuário.' });
  }
};

// Recuperação de senha - solicitar
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ mensagem: "Email é obrigatório." });

    const pool = await poolPromise;
    const result = await pool.request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM usuarios WHERE email = @email");

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1h

    await pool.request()
      .input("email", sql.VarChar, email)
      .input("token", sql.VarChar, token)
      .input("expires", sql.DateTime, expires)
      .query(`
        UPDATE usuarios 
        SET reset_token = @token, reset_expires = @expires 
        WHERE email = @email
      `);

    const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;

    await enviarEmail(
      email,
      "Recuperação de senha - NutritionLite",
      `<p>Você solicitou a redefinição de senha.</p>
       <p>Clique no link para redefinir: <a href="${resetLink}">${resetLink}</a></p>
       <p>Este link expira em 1 hora.</p>`
    );

    return res.status(200).json({ mensagem: "Email de recuperação enviado." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro interno ao solicitar recuperação." });
  }
};

// Recuperação de senha - redefinir
const resetPassword = async (req, res) => {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({ mensagem: "Token e nova senha são obrigatórios." });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input("token", sql.VarChar, token)
      .query("SELECT * FROM usuarios WHERE reset_token = @token AND reset_expires > GETDATE()");

    if (result.recordset.length === 0) {
      return res.status(400).json({ mensagem: "Token inválido ou expirado." });
    }

    const usuario = result.recordset[0];
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await pool.request()
      .input("id", sql.Int, usuario.id)
      .input("senha", sql.VarChar, senhaHash)
      .query(`
        UPDATE usuarios 
        SET senha_hash = @senha, reset_token = NULL, reset_expires = NULL, ultima_atualizacao = GETDATE()
        WHERE id = @id
      `);

    return res.status(200).json({ mensagem: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro interno ao redefinir senha." });
  }
};

module.exports = {
  cadastrarUsuario,
  loginUsuario,
  deletarUsuario,
  forgotPassword,
  resetPassword
};