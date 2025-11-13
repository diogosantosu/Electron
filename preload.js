const { contextBridge, ipcRenderer } = require('electron');
//contextBridge é o que permite expor funções especificas as janelas criadas pelo main, sem dar acesso total ao node
//ipc renderer é o que se comunica com o ipc main, enviando e recebendo mensagens 


//criamos uma forma de expor a função login ao index.html, demos o nome de API, e é isso que será chamado no index.html
contextBridge.exposeInMainWorld('api', {
  //essa é a função que o index.html vai chamar usando o ipcRenderer para enviar uma mensagem ao main.js

  /**
   * 
   * @param {string} email 
   * @param {string} senha 
   * @returns {Promise <any>} 
   */

  login: (email, senha) => {
    //ipcRenderer.invoke é o index.html enivando a mensagem
    //login-attempt é o nome da mensagem para o main saber o que vai ser feito
    //email e senha é o que vai dentro da mensagem 
    return ipcRenderer.invoke('login-attempt', email, senha);
  },


  //função para ir da tela inicial para 2
  irParatelaDois: (idEstabelecimento) => {
    ipcRenderer.send('ir-para-tela-dois', idEstabelecimento)
  },
  irParatelaUm : () => {
    ipcRenderer.send('ir-para-tela-um')
  },

  irParaaddEstabelecimento : () => {
    ipcRenderer.send('ir-para-add-estab')
  },

  cadastrarEstabelecimento : (dados) => {
   return ipcRenderer.invoke('cadastrar-estab', dados)
  },

  exibirEstabelecimento : () => {
    return ipcRenderer.invoke('exibir-estab')
  },

  deletarEstabelecimento : (id) => {
    return ipcRenderer.invoke('deletar-estab', id)
  },

  getDadosDoEstabelecimentoSelecionado: () => {
    return ipcRenderer.invoke('get-dados-selecionado');
    },

    atualizarNome: (novoNome) => {
        return ipcRenderer.invoke('atualizar-nome', novoNome);
    }
})
  

