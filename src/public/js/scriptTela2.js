function abrirSidebar() {
    const sidebar = document.getElementById('sidebar');
    const navbar = document.getElementById('navbar');
    const corpo = document.getElementById('corpo');
    const icone = document.getElementById('iconeAbrir');

    sidebar.classList.toggle('ativa');

    if(sidebar.classList.contains('ativa')){
        navbar.style.marginLeft = '16%'; // ajusta navbar
        navbar.style.width = '84%'
        corpo.style.marginLeft = '16%'; // ajusta corpo
        corpo.style.width = '84%'
        icone.classList.remove('bi-list'); // 👈 troca o ícone
        icone.classList.add('bi-arrow-bar-left');
    } 
    else {
        navbar.style.marginLeft = '0';
        navbar.style.width = '100%'
        corpo.style.marginLeft = '0';
        corpo.style.width = '100%'
        icone.classList.remove('bi-arrow-bar-left'); // 👈 troca o ícone
        icone.classList.add('bi-list');
    }
}


const melhores = document.getElementById('melhoresSugestoes');
melhores.classList.add('mostrar')
function mostrarTela(tela) {
  const melhores = document.getElementById('melhoresSugestoes');
  const categoria = document.getElementById('porCategoria');
  const analise = document.getElementById('analise');

  // zera tudo
  categoria.classList.remove('mostrar');
  analise.classList.remove('mostrar');
  melhores.classList.remove('mostrar')

  // decide qual mostrar
  if (tela === 'porCategoria') {
    categoria.classList.add('mostrar');
  } else if (tela === 'analise') {
    analise.classList.add('mostrar');
  } else if (tela === 'melhoresSugestoes') {
   melhores.classList.add('mostrar')
  }
}
window.mostrarTela = mostrarTela;


const estrutura = document.getElementById('feedbackEstrutura');
estrutura.classList.add('selecionado');
function mostrarFeedCategoria(categoria) {
    const estrutura = document.getElementById('feedbackEstrutura');
    const qualidade = document.getElementById('feedbackQualidade');
    const atendimento = document.getElementById('feedbackAtendimento');
    const preco = document.getElementById('feedbackPreco');

    estrutura.classList.remove('selecionado');
    qualidade.classList.remove('selecionado');
    atendimento.classList.remove('selecionado');
    preco.classList.remove('selecionado');

    if (categoria === 'feedbackQualidade') {
        qualidade.classList.add('selecionado');
    } else if (categoria === 'feedbackAtendimento') {
        atendimento.classList.add('selecionado');
    } else if (categoria === 'feedbackPreco') {
        preco.classList.add('selecionado');
    } else if (categoria === 'feedbackEstrutura') {
        estrutura.classList.add('selecionado');
    }

    console.log("Categoria exibida:", categoria);
}
window.mostrarFeedCategoria = mostrarFeedCategoria;


function irParatelaUm() {
    // 1. Adiciona a classe para iniciar o fade-out
    document.body.classList.add('fade-out');

    // 2. Espera a animação (300ms) terminar
    setTimeout(() => {
        // 3. SÓ ENTÃO, pede para navegar
        window.api.irParatelaUm();
    }, 300); // Deve ser o mesmo tempo da transição do CSS
}

document.addEventListener('DOMContentLoaded', () => {
    //criamos uma função async para poder usar await
    async function carregarDados() {
        
        // ✅ 1. NOME DA FUNÇÃO CORRIGIDO
        const resposta = await window.api.getDadosDoEstabelecimentoSelecionado();

        // ✅ 2. 'respota' CORRIGIDO para 'resposta'
        if(resposta && resposta.success){
            const dados = resposta.data

            const sidebarNome = document.getElementById('sidebar-nome')
            if(sidebarNome){
                sidebarNome.textContent = dados.Nome_Estabelecimento
            }
            
            // ✅ 3. 'sidebbar' CORRIGIDO para 'sidebar'
            const sidebarCategoria = document.getElementById('sidebar-categoria')
            if(sidebarCategoria){
                sidebarCategoria.textContent = dados.Categoria
            }
            
            const corpoTituloNome = document.getElementById('corpo-titulo-nome')
            if(corpoTituloNome){
                corpoTituloNome.textContent = dados.Nome_Estabelecimento
            }

            const corpoEditNome = document.getElementById('corpo-edit-nome');
            if(corpoEditNome) corpoEditNome.value = dados.Nome_Estabelecimento;

            const corpoEndereco = document.getElementById('corpo-endereco')
            if(corpoEndereco){
                corpoEndereco.innerHTML = `<i class="bi bi-geo-alt"></i> ${dados.Endereco}`
            }
            
            // ✅ 4. 'cateogira' CORRIGIDO para 'categoria'
            const corpoCategoria = document.getElementById('corpo-categoria')
            if(corpoCategoria){
                corpoCategoria.textContent = dados.Categoria
            }

            const corpoFotoCapa = document.getElementById('corpo-foto-capa')
            if(corpoFotoCapa && dados.Caminho_Foto_Capa){
                corpoFotoCapa.style.backgroundImage = `url('${dados.Caminho_Foto_Capa}')`
            }
        } else {
            alert('Erro ao carregar os dados deste estabelecimento.');
            irParatelaUm();
        }
    }
    carregarDados();
});

function toggleModoEdicao() {
    // 1. Pega todos os elementos
    const tituloView = document.getElementById('corpo-titulo-nome');
    const inputEdit = document.getElementById('corpo-edit-nome');
    const btnEditar = document.getElementById('btn-editar');
    const btnSalvar = document.getElementById('btn-salvar');

    // 2. Troca a classe 'hidden' deles
    tituloView.classList.toggle('hidden');
    inputEdit.classList.toggle('hidden');
    btnEditar.classList.toggle('hidden');
    btnSalvar.classList.toggle('hidden');

    // 3. (Opcional) Foca no input quando o modo de edição é ativado
    if (!inputEdit.classList.contains('hidden')) {
        inputEdit.focus();
    }
}

// 2. Função para salvar o novo nome
async function salvarNovoNome() {
    const inputEdit = document.getElementById('corpo-edit-nome');
    const novoNome = inputEdit.value;

    if (!novoNome || novoNome.trim() === '') { // .trim() impede nomes vazios
        alert('O nome não pode ficar vazio.');
        return;
    }

    // 3. Chama a nova API (que vamos criar no próximo passo)
    try {
        // Esta função 'atualizarNome' ainda não existe no preload, vamos criá-la
        const resposta = await window.api.atualizarNome(novoNome); 
        
        if (resposta && resposta.success) {
            // Sucesso!
            
            // 4. Atualiza o <p> (Modo Visualização) com o novo nome
            const tituloView = document.getElementById('corpo-titulo-nome');
            tituloView.textContent = novoNome;
            
            // (Também atualiza o nome na sidebar)
            const sidebarNome = document.getElementById('sidebar-nome');
            if (sidebarNome) sidebarNome.textContent = novoNome;

            // 5. Troca de volta para o modo de visualização
            toggleModoEdicao();
        } else {
            alert('Erro ao salvar o novo nome.');
        }
    } catch (err) {
        console.error('Erro ao salvar:', err);
        alert('Erro de comunicação ao salvar.');
    }
}