// Conteúdo CORRIGIDO para o arquivo pesquisa.js

// Endpoint da API para buscar todos os quadros
const getBoardsEndpoint = 'https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/GetBoards';
const paginaPrincipal = 'trelolo.html'; // Nome do seu arquivo principal

const containerQuadros = document.getElementById('container-quadros');
const campoBusca = document.getElementById('campo-busca');

// Armazenará a lista completa de quadros para evitar múltiplas chamadas à API
let todosOsQuadros = [];

// Função para exibir os quadros na tela (com pequena melhoria na mensagem)
function exibirQuadros(quadros) {
    containerQuadros.innerHTML = ''; // Limpa o container

    if (quadros.length === 0) {
        // Exibe a mensagem diretamente no container
        containerQuadros.innerHTML = '<p id="mensagem-status">Nenhum quadro encontrado com esse nome.</p>';
        return;
    }

    

    quadros.forEach(quadro => {
        const card = document.createElement('a');
        card.className = 'quadro-card';
        // O link passará o ID do quadro como um parâmetro na URL
        card.href = `${paginaPrincipal}?boardId=${quadro.Id}`;
        
        card.innerHTML = `
    
            <h3>${quadro.Name || 'Quadro sem nome'} </h3>
            <p class="quadroDesc">${quadro.Description || ''}<p>
            <p>ID: ${quadro.Id}</p>
        
        `;

        const bgColor = quadro.HexadecimalColor || '#2C74B3';
        card.style.backgroundColor = bgColor;
        card.dataset.bgColor = bgColor;

        // Ajusta a cor do texto para melhor contraste
        if (isColorLight(bgColor)) {
            card.style.color = '#222';
            card.querySelectorAll('h3, p').forEach(el => el.style.color = '#222');
        } else {
            card.style.color = 'aliceblue';
            card.querySelectorAll('h3, p').forEach(el => el.style.color = 'aliceblue');
        }
        containerQuadros.appendChild(card);
    });
}

// Event listener para o campo de busca (filtra em tempo real)
campoBusca.addEventListener('input', (event) => {
    const termoBusca = event.target.value.toLowerCase().trim();
    
    // ----------------------------------------------------
    // INÍCIO DA CORREÇÃO
    // ----------------------------------------------------
    const quadrosFiltrados = todosOsQuadros.filter(quadro => {
        // Usamos (quadro.Name || '') para garantir que, se o nome for nulo,
        // ele seja tratado como uma string vazia, evitando erros.
        const nomeQuadro = (quadro.Name || '').toLowerCase();
        return nomeQuadro.includes(termoBusca);
    });
    // ----------------------------------------------------
    // FIM DA CORREÇÃO
    // ----------------------------------------------------
    
    exibirQuadros(quadrosFiltrados);
});


// Função principal que carrega os dados quando a página abre
async function carregarTodosOsQuadros() {
    // Exibe a mensagem de carregamento inicial
    containerQuadros.innerHTML = '<p id="mensagem-status">Carregando quadros...</p>';

    try {
        const response = await fetch(getBoardsEndpoint);
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

    
        todosOsQuadros = await response.json();
        todosOsQuadros.sort((a, b) => a.Id - b.Id);
        exibirQuadros(todosOsQuadros);

    } catch (error) {
        console.error("Falha ao carregar quadros:", error);
        containerQuadros.innerHTML = '<p id="mensagem-status">Falha ao carregar quadros. Verifique o console.</p>';
    }
}

function aplicarCorDeFundo(hexColor) {
    document.querySelectorAll('.quadro-card').forEach(card => {
        card.style.backgroundColor = hexColor;
        card.dataset.bgColor = hexColor;
    });
}

function isColorLight(hex) {
    // Remove o # se existir
    hex = hex.replace('#', '');
    // Converte para RGB
    let r = parseInt(hex.substring(0,2), 16);
    let g = parseInt(hex.substring(2,4), 16);
    let b = parseInt(hex.substring(4,6), 16);
    // Calcula o brilho (luminância)
    let brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 180; // quanto maior, mais claro
}

// Inicia o processo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarTodosOsQuadros);