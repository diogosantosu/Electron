// testListUsers.js
const db = require('./db'); // importa o pool do db.js

// Função para listar usuários
async function listarUsuarios() {
    try {
        // Faz a query e espera o resultado
        const [rows] = await db.query('SELECT * FROM Usuario'); // atenção ao nome da tabela!
        console.log('Usuários cadastrados:', rows);
    } catch (err) {
        console.error('Erro ao listar usuários:', err);
    }
}

// Chama a função
listarUsuarios();
