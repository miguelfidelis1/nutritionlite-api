const { poolConnect, pool, sql } = require('../config/db');

const listarAlimentos = async (req, res) => {

    try{
        await poolConnect;

        const request = pool.request();
        const result = await request.query('SELECT * FROM tbltacoNL');

        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Erro ao listar alimentos:', error);
        return res.status(500).json({mensagem: 'Erro ao buscar alimentos no banco de dados.'});
    }
};

const buscarAlimentosPorNome = async (req, res) => {
    try{
        const nome = req.nome.nome;

        if (!nome) {
            return res.status(400).json({mensagem: 'Informe o nome do alimento.'});
        }
        
        await poolConnect;
        const request = pool.request();
        const result = await request
        .input('nome', sql.VarChar, `%${nome}%`)
        .query(`
            SELECT nome_alimento, enrgia_kcal, proteina, carboidratos, lipedeos, fibra_alimentar, sodio
            FROM tbltacoNL
            WHERE nome_alimento LIKE @nome
        `);
        
        return res.status(200).json(result.recordset);
    }   catch (error) {
           console.error('Erro ao buscar alimentos:', error)
           return res.status(500).json({mensagem: 'Erro interno ao buscar alimento'});
    }
};

module.exports = {
    listarAlimentos,
    buscarAlimentosPorNome
};