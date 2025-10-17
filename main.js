// É o arquivo Main que cria as janelas e que conversa com o sistema operacional 
//console.log("processo principal")

const { app, BrowserWindow, nativeTheme} = require('electron') 
//importamos os recursos 'app' e 'BrowserWindow' do framework electron

try {
    require('electron-reload')(__dirname, {
        electron: require(`${__dirname}/node_modules/electron`)
    });
} catch (_) {}
//para podermos atualizar as modificações feitas no código html automaticamente

const createWindow = () => {
    nativeTheme.themeSource ='dark'
    //Importamos o recurso nativeTheme e definimos que a janela sempre estará no tema escuro
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        //tamanho da janela
        icon: './src/public/img/logoSuggesto.png',
        //icone da página
        autoHideMenuBar : true,
        //esconder o menu de funções da página

        //titleBarStyle: 'hidden'
        
  })
  //criamos uma função para gerar uma janela de 800 px de altura e 600 px de largura

  win.loadFile('./src/views/index.html')
} //Carregamos o arquivo index.html

app.whenReady().then(() => {
  createWindow()
}) 
//Executamos a função createWindow, criando a janela e incorporando o arquivo index.html
//.then indica a execução de maneira assíncrona, primeiro cria a janela e depois executa

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
//Com esse código encerremos a aplicação ao fechar a janela 
