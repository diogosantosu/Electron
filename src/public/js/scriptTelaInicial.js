function abrirSidebar() {
    const sidebar = document.getElementById('sidebar');
    const navbar = document.getElementById('navbar');
    const corpo = document.getElementById('corpo');
    const icone = document.getElementById('iconeAbrir');

    sidebar.classList.toggle('ativa');

    if (sidebar.classList.contains('ativa')) {
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
//chamada da função para ir da tela inicial para tela 2
function irParatelaDois(idEstabelecimento) {
    // 1. Adiciona a classe para iniciar o fade-out
    document.body.classList.add('fade-out');

    // 2. Espera a animação (300ms) terminar
    setTimeout(() => {
        // 3. SÓ ENTÃO, pede para navegar
        window.api.irParatelaDois(idEstabelecimento);
    }, 300); // Deve ser o mesmo tempo da transição do CSS
}

function irParaaddEstabelecimento() {
    document.body.classList.add('fade-out');

    setTimeout(() => {
        window.api.irParaaddEstabelecimento()
    }, 300);
}
addEventListener('DOMContentLoaded', () => {
    //função async para poder usar o await evitando callbacks
    async function carregarEstabelecimento() {
        console.log('Carregando estabelecimentos...')

        //chamar a api do preload que chama o main esperando a resposta 
        const resposta = await window.api.exibirEstabelecimento()

        //verifica se a resposta existe, se foi um sucesso  e se os dados do pacote é maior que 0
        if (resposta && resposta.success && resposta.data.length > 0) {
            //lista de estabelecimentos que veio do banco através do objeto resposta
            const estabelecimentos = resposta.data

            const container = document.getElementById('listaEstabelecimentos')

            //guardar o html dos novos cards 
            let htmlParaAdicionar = '';

            //loop pelos estabelecimentos que vieram do banco 
            for (const estab of estabelecimentos) {
                let imgTag = ''
                if (estab.Caminho_Foto_Capa) {
                    //se exisistir foto (Caminho_FotoCapa veio do banco)
                    imgTag = `<img src = "${estab.Caminho_Foto_Capa}"
                                    class="card-img-top"
                                    alt="Foto de ${estab.Nome_Estabelecimento}"
                                    style="height: 160px; object-fit: cover;">`
                    //adicionamos a foto que veio do banco a um card do bootstrap
                } else {
                    //se não existir foto :
                    imgTag = `<div style = "height: 160px; background-color: #3f3f46; display: flex; align-items: center; justify-content: center; color: #a1a1aa; border-top-left-radius: 15px; border-top-right-radius: 15px; ">
                                <i class="bi bi-camera" style="font-size: 3rem;"></i>
                              </div>`
                }
                htmlParaAdicionar += `
                    <div class="col-md-4">
                        <div class="card card-estabelecimento h-100">
                            ${imgTag}
                            <div class="card-body d-flex flex-column justify-content-start">
                                <p style="font size: 0.9rem; color:#a1a1aa; margin-top:15px; ">
                                <i class="bi bi-geo-alt-fill"></i> ${estab.Endereco}
                                </p>
                                <div class=" mt-auto d-flex justify-content-between align-items: center">
                                    <span class="icone-lixo" onclick="deletarEstabelecimento(${estab.ID_Estabelecimento}, this, event)">
                                        <i class="bi bi-trash3"></i>
                                    </span>
                                     <span class="tag-tipo">${estab.Categoria}</span>
                                   
                                </div>
                                 <span class="ver-detalhes" onclick="irParatelaDois(${estab.ID_Estabelecimento})">
                                        Ver detalhes &rarr;
                                    </span>
                                    <h5 style="color: white;">${estab.Nome_Estabelecimento}</h5>
                                   
                               
                                
                            </div>
                        </div>
                    </div>
                `
            } 

            //insere a váriavel que guardou a formatação dos cards de uma vez no final container 
            container.insertAdjacentHTML('beforeend', htmlParaAdicionar)
        } else {
            console.log("Nenhum estabelecimento encontrado")
        }
    }
        carregarEstabelecimento();
})
    async function deletarEstabelecimento(idEstabelecimento,iconeElemento,event) {
        if(!confirm('Tem certeza que deseja apagar este estabelecimento ? Esá ação não pode ser revertida')){
            return;
        }

        try{
            const resposta = await window.api.deletarEstabelecimento(idEstabelecimento)

            if(resposta && resposta.success){
                const cardColuna = iconeElemento.closest('.col-md-4')
                if(cardColuna)
                    cardColuna.remove()
            } else {
                alert('Erro ao apagar o estabelecimento')
            }
        } catch(err){
            console.log('Erro no processo de deletar:', err)
            console.log('Erro ao comunicar com o processo principal')
        }
    }