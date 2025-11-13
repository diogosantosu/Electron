
//O Cofre/Servidor. É o único lugar seguro que tem a chave do banco de dados e pode fazer as verificações.'
// É o arquivo Main que cria as janelas e que conversa com o sistema operacional 

const { app, BrowserWindow, nativeTheme, ipcMain } = require('electron')
//importamos os recursos 'app' e 'BrowserWindow'  do framework electron
//importamos ipcMain do electron também para podermos fazer a ponte do front para o back, usando ipcMain e ipcRenderer

const path = require('path')
// O path serve para organizar os caminhos de acessos à pastas e arquivos

const pool = require('./db');
// Importa o pool de conexões do arquivo db

const fs = require('fs');
// Para copiarmos arquivos 

let loginWindow;
let idUsuarioLogado
let idEstabelecimentoSelecionado

try {
  require('electron-reload')(__dirname, {
    electron: require(`${__dirname}/node_modules/electron`)
  });
} catch (_) { }
//para podermos atualizar as modificações feitas no código html automaticamente

//Tela de login
const createloginWindow = () => {
  nativeTheme.themeSource = 'dark'


  //Importamos o recurso nativeTheme e definimos que a janela sempre estará no tema escuro
  //atribuindo a nova janela a nossa váriavel global para poder controlar de outra função
  loginWindow = new BrowserWindow({

    width: 800,
    height: 600,
    //tamanho da janela

    icon: './src/public/img/suggesto.png',
    //icone da página

    autoHideMenuBar: true,
    //esconder o menu de funções da página

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
    //opções de segurando servindo para isolar os processos do front , impede que o front acesse o node diretamente

  })

  loginWindow.maximize()
  loginWindow.loadFile('./src/views/login.html')
} //Carregamos o arquivo index.html

app.on('ready', createloginWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
//Com esse código encerremos a aplicação ao fechar a janela 

//ipchandle fica 'ouvindo' qualquer mensagem que chegue através do ipcRenderer, que chame 'login-attempt'
ipcMain.handle('login-attempt', async (event, email, senha) => {
  //O event deve ser o primeiro parametro para o electron identificar quem passou a mensagem e responder diretamente a esse renderer

  console.log(`Recebi uma tentativa de login de: ${email}`)

  const query = 'SELECT * FROM Usuario WHERE Email = ? AND Senha = ? '

  try {
    //fazemos a consulta no banco e esperamos a resposta com await sem travar a aplicação
    const [rows] = await pool.query(query, [email, senha])

    if (rows.length > 0) {
      console.log(`Login de ${email} aprovado!`)

      // caso o banco encontre um usuário com aquele email e senha abrimos a tela Inicial na mesma janela que o usário estava (login)

      const usuario = rows[0]

      idUsuarioLogado = usuario.ID_Usuario;

      console.log(`ID do Gerente logado: ${idUsuarioLogado}`);

      return { sucess: true }
    }
    else {
      console.log(`Login de ${email} não encontrado!`)

      return { sucess: false, message: 'Email ou senha inválidos' }
    }
  }
  catch (err) {
    console.error('Deu erro no banco!', err)
    return { sucess: false, message: 'Deu muito errado, tente novamente depois.' }
  }
})

ipcMain.on('ir-para-tela-dois', (event, idEstabelecimento) => {
  idEstabelecimentoSelecionado = idEstabelecimento
  console.log( `usuário selecionou o estabelecimento de id : ${idEstabelecimentoSelecionado}`)
  // 1. Encontra a janela atual (telaInicial) que enviou a mensagem
  const Window = BrowserWindow.fromWebContents(event.sender);



  // 3. Carrega o HTML da tela2 (que está em src/views/) diretamente da janela atual
  Window.loadFile(path.join(__dirname, 'src/views/tela2.html'));

})

ipcMain.on('ir-para-tela-um', (event) => {
  const Window = BrowserWindow.fromWebContents(event.sender)
  Window.loadFile(path.join(__dirname, 'src/views/telaInicial.html'));

})

ipcMain.on('ir-para-add-estab', (event) => {
  const Window = BrowserWindow.fromWebContents(event.sender)
  Window.loadFile(path.join(__dirname, 'src/views/addEstabelecimento.html'))
})

ipcMain.handle('cadastrar-estab', async (event, dados) => {
    
    const { nome, endereco, categoria, dadosFoto } = dados;
    const idGerente = idUsuarioLogado;

    let novoCaminhoFotoParaSalvar = null; 

    try {
        // ✅ CORREÇÃO: Verificamos 'dadosFoto.arrayBuffer'
        if (dadosFoto && dadosFoto.arrayBuffer) {
            
            const extensao = path.extname(dadosFoto.nomeOriginal); 
            const novoNomeFoto = `${Date.now()}${extensao}`;
            const caminhoDestino = path.join(__dirname, 'src', 'public', 'uploads', novoNomeFoto);

            // ✅ CORREÇÃO: Convertemos o ArrayBuffer para Buffer AQUI (no main.js)
            const bufferParaSalvar = Buffer.from(dadosFoto.arrayBuffer);
            
            // ✅ CORREÇÃO: Usamos o novo 'bufferParaSalvar' para escrever o ficheiro
            fs.writeFileSync(caminhoDestino, bufferParaSalvar);

            novoCaminhoFotoParaSalvar = `../public/uploads/${novoNomeFoto}`;
            console.log(`Foto copiada para: ${novoCaminhoFotoParaSalvar}`);
        }

        // O SQL (INSERT) continua igual
        const query = `
            INSERT INTO Estabelecimento 
            (Nome_Estabelecimento, Endereco, Categoria, ID_Gerente, Caminho_Foto_Capa) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const valores = [
            nome,
            endereco,
            categoria,
            idGerente,
            novoCaminhoFotoParaSalvar
        ];
        
        await pool.query(query, valores);

        console.log('--- ESTABELECIMENTO SALVO NO BANCO! ---');
        return { success: true, message: 'Estabelecimento cadastrado!' };

    } catch (err) {
        console.error('Erro ao cadastrar estabelecimento:', err);
        return { success: false, message: 'Erro ao salvar no banco.' };
    }
});
ipcMain.handle('exibir-estab', async (event) => {
    const idGerente = idUsuarioLogado

    if(!idGerente){
      console.error ('Nenhum usuário logado para buscarEstabelecimento')
      return {success : false, data : [], message : 'usuario não logado'}
    }

    const query = `SELECT * FROM Estabelecimento WHERE ID_Gerente = ?`

    try {
      const [rows] = await pool.query(query,[idGerente])
      console.log(`Encontramos ${rows.length} estabelecimentos para o Gerente com ID : ${idGerente}`)

      //sucess : true (A operção foi um sucesso)
      //data : rows (lista de rows que buscamos do banco associada ao Id do gerente)
      return { success: true, data: rows };
    } catch {

    }
})

ipcMain.handle('deletar-estab', async (event, idEstabelecimento) => {
    try{
      const querySelect = 'SELECT Caminho_Foto_Capa FROM Estabelecimento WHERE ID_Estabelecimento = ?';
      const[rows] = await pool.query(querySelect, [idEstabelecimento])

      //criamos uma váriavel, caso a busca no banco encontre pelo menos 1 dado pegue o resultado da primeira linha e guarde na váriavel
      // se não encontrar nada guarde null
      const caminhoFotoRelativo = (rows.length > 0) ? rows[0].Caminho_Foto_Capa : null;

      const queryDelete = 'DELETE FROM Estabelecimento WHERE ID_Estabelecimento = ?'
      await pool.query(queryDelete,[idEstabelecimento])

      //se caminho relativo exisitir ou seja, se houver foto
      if(caminhoFotoRelativo){
        //pegamos apenas o nome do ficheiro
        const nomeFicheiro = path.basename(caminhoFotoRelativo)

        //reconstruímos o caminho completo para usarmos a fs.unlinkSync e apagar a foto do computador.
        const caminhoCompleto = path.join(__dirname,'src','public','uploads', nomeFicheiro)
        fs.unlinkSync(caminhoCompleto)// apagamos
      }
      console.log('Estabelecimento apagado com sucesso')
      return {success: true}
     } catch(err){
      console.error('Erro ao apagar estabelecimento', err)
      return {success : false, message: 'Erro no banco de dados.'}
     }
} )

ipcMain.handle('get-dados-selecionado', async (event) => {
    
    // 1. Usa o ID que guardámos na "gaveta" global
    if (!idEstabelecimentoSelecionado) {
        console.error('Erro: Nenhum ID de estabelecimento foi selecionado.');
        return { success: false, data: null, message: 'Nenhum ID selecionado.' };
    }

    // 2. Prepara a query SQL
    const query = 'SELECT * FROM Estabelecimento WHERE ID_Estabelecimento = ?';

    try {
        // 3. Executa a query com o ID guardado
        const [rows] = await pool.query(query, [idEstabelecimentoSelecionado]);

        // 4. Verifica se encontrou (deve encontrar 1)
        if (rows.length > 0) {
            console.log(`Enviando dados do ID ${idEstabelecimentoSelecionado} para a tela 2.`);
            
            // Devolve o PRIMEIRO (e único) resultado
            return { success: true, data: rows[0] }; 
        } else {
            console.error(`Estabelecimento com ID ${idEstabelecimentoSelecionado} não encontrado.`);
            return { success: false, data: null, message: 'Estabelecimento não encontrado.' };
        }

    } catch (err) {
        console.error('Erro ao buscar dados do estabelecimento:', err);
        return { success: false, data: null, message: 'Erro no banco de dados.' };
    }
});

ipcMain.handle('atualizar-nome', async (event, novoNome) => {
    
    // 1. Usa o ID que já está guardado na variável global
    const idParaAtualizar = idEstabelecimentoSelecionado;

    // 2. Uma verificação de segurança importante
    if (!idParaAtualizar) {
        console.error('ERRO GRAVE: Tentativa de update de nome sem ID selecionado.');
        return { success: false, message: 'Nenhum ID selecionado.' };
    }

    console.log(`A atualizar nome do ID: ${idParaAtualizar} para "${novoNome}"`);

    // 3. O comando SQL de UPDATE
    const query = `
        UPDATE Estabelecimento 
        SET Nome_Estabelecimento = ?
        WHERE ID_Estabelecimento = ?
    `;
    
    // 4. Os valores para o SQL (o 'novoNome' e o 'idParaAtualizar')
    const valores = [novoNome, idParaAtualizar];

    // 5. Executa a query
    try {
        await pool.query(query, valores);
        console.log('Nome atualizado no banco!');
        return { success: true }; // Devolve sucesso para o 'tela2.js'
    } catch (err) {
        console.error('Erro ao executar o UPDATE do nome:', err);
        return { success: false, message: 'Erro no banco de dados.' };
    }
});

