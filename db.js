const mysql = require ('mysql2/promise');
//importa a biblioteca mysql do NPM, na versão promisse que evita os callbacks
const bcrypt = require('bcrypt')

const pool = mysql.createPool
//cria um pool de conexões, ou seja um conjunto de 10 conexões prontas para o banco usar
// é mais seguro e rápido do que se criar uma conexão por vez a cada acesso ao banco
({
    host : '143.106.241.4',
    user : 'cl204225',
    password : 'cl*05102007',
    database : 'cl204225',
    waitForConnections : true,
    connectionLimit : 10,
    // se todas as 10 conexões estiverem ocupadas ao mesmo tempo a aplicação espera uma estiver livre ao invés de falhar imediatamente 
});
module.exports = pool;

