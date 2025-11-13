
let fotoSelecionada = null;

function voltarParatelaInicial() {
    //Colocando o efeito fade-out que está no css
    document.body.classList.add('fade-out')

    //espera a animação acabar e volta para tela inicial 
    setTimeout(() => {
        window.api.irParatelaUm();
    }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
    //Selecionamos os elementos que vamos usar 
    const dropzone = document.getElementById('dropzone');
    const fotoInput = document.getElementById('foto-input');
    const textoDropzone = dropzone.querySelector('p');

    dropzone.addEventListener('click', () => {
        fotoInput.click();
    });

    //para mostrar o nome do arquivo selecionado
    fotoInput.addEventListener('change', () => {
        //Quando o valor do input mudar e realmente tiver um arquivo nele 
        if (fotoInput.files.length > 0) {
            
            // ✅ PASSO 2: GUARDE o ficheiro na nossa "gaveta"
            fotoSelecionada = fotoInput.files[0]; 
            
            // (O seu código original para o texto, está correto)
            textoDropzone.textContent = fotoSelecionada.name;
        } else {
            fotoSelecionada = null; // Limpa a gaveta se o utilizador cancelar
            textoDropzone.textContent = 'Arraste e solte ou clique para selecionar';
        }
    });
});

// --- A sua função de 'Cadastrar' (COM MUDANÇAS) ---
// scriptAddEstabelecimento.js

// ✅ MUDANÇA 1: A função agora é 'async' para podermos usar 'await'
// scriptAddEstabelecimento.js

// A função continua 'async'
async function cadastrarEstabelecimento() {
    const nomeInput = document.getElementById('nome');
    const enderecoInput = document.getElementById('endereco');
    const categoriaInput = document.getElementById('categoria');
    
    const nome = nomeInput.value;
    const endereco = enderecoInput.value;
    const categoria = categoriaInput.value;

    let dadosFoto = null; 

    if (fotoSelecionada) {
        try {
            // 1. Lemos o ArrayBuffer (isto está correto)
            const arrayBuffer = await fotoSelecionada.arrayBuffer();
            
            // ✅ CORREÇÃO: Enviamos o ArrayBuffer diretamente
            dadosFoto = {
                arrayBuffer: arrayBuffer, // Em vez de 'buffer: Buffer.from(...)'
                nomeOriginal: fotoSelecionada.name 
            };
        } catch (err) {
            console.error("Erro ao ler o ficheiro:", err);
            alert("Ocorreu um erro ao carregar a sua foto.");
            return; 
        }
    }

    if (!nome || !endereco) {
        alert('Por favor, preencha o Nome e o Endereço.');
        return; 
    }

    const dadosEstab = {
        nome: nome,
        endereco: endereco,
        categoria: categoria,
        dadosFoto: dadosFoto 
    };

    console.log("Enviando para o main.js:", dadosEstab);
    window.api.cadastrarEstabelecimento(dadosEstab);
    
    // (Lembre-se de descomentar isto quando os testes funcionarem)
    voltarParatelaInicial();
}