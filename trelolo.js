// --- Endpoints da API (Mantidos como estão) ---
const getBoardsEndpoint = 'https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/GetBoards';
const createOrUpdateBoardEndpoint = 'https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/CreateOrUpdateBoard';
const criaColunaEndPoint = "https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/CreateOrUpdateColumn";
const criaTaskEndPoint = "https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/CreateOrUpdateTask";
const deleteTaskEndpoint = "https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/DeleteTask";

// --- Variáveis globais para gerenciar o estado do quadro atual ---
let currentBoardId = null; 
let currentBoardName = ''; 

// --- Elementos DOM
const novoQuadroModal = document.getElementById("novoQuadro");
const btnCriar = document.getElementById('btnCriar');
const modalOverlay = document.getElementById('modal-overlay');
const quadroTela = document.getElementById('QUADRO');
const quadroBodyContainer = document.querySelector('.quadro'); // Onde as colunas e tasks são injetadas
const dropdownContent = document.querySelector('.dropDownContent'); // O conteúdo do dropdown "Quadros"
const quadroTituloSpan = document.querySelector('.tituloQuadro > span'); // O span dentro do tituloQuadro
const tituloBoardActionsDiv = document.querySelector('.titleBoardActions'); // A div que contém os botões Salvar e Fechar

const paletaCores = document.getElementById('paletaCores');
const seletorCorInput = document.getElementById('seletorCor');


// Função para mostrar/esconder o overlay de carregamento
function showLoading(message = "Carregando...") {
    loadingOverlay.querySelector('span').textContent = message;
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Funções Pop ups 

function botaoNovoQuadro() {
    modalOverlay.style.display = 'block'; // Mostra o fundo escurecido
    novoQuadroModal.style.display = 'flex';
    document.getElementById('nomeQuadro').value = '';
}
function fecharNovoQuadro() {
    modalOverlay.style.display = 'none'; // Esconde o fundo
    novoQuadroModal.style.display = 'none'; // Esconde o modal
}
window.addEventListener('click', function(event) { 
    
    if (event.target === modalOverlay) {
        fecharNovoQuadro();
    }

    // Lógica para fechar a PALETA DE CORES
    if (paletaCores.style.display === 'block' && !paletaCores.contains(event.target) && !event.target.classList.contains('paleta')) {
        paletaCores.style.display = 'none';
    }
});

async function criarQuadro() {
    const nomeQuadro = document.getElementById('nomeQuadro').value.trim();

    if (nomeQuadro === "") {
        alert("O nome do quadro não pode estar vazio.");
        return;
    }

    showLoading("Criando Quadro..."); // Mostra loading

    try {
        const boardData = {
            Name: nomeQuadro,
            //Description: "",
            BackgroundColor: ""
        };

        const response = await fetch(createOrUpdateBoardEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(boardData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao criar quadro: ${response.status} - ${errorText}`);
        }
        
        const newBoardId = parseInt(await response.text());
        if (isNaN(newBoardId)) {
            throw new Error("ID do quadro inválido retornado pela API.");
        }   

        alert(`Quadro "${nomeQuadro}" criado com sucesso!`);
        
        fecharNovoQuadro(); // Fecha o modal e o overlay.
        
        await mostrarQuadro(newBoardId, nomeQuadro); // Carrega o quadro recém-criado
        await carregarQuadrosNoDropdown(); // Atualiza o dropdown

    } catch (error) {
        console.error("Erro ao criar quadro na API:", error);
        alert("Ocorreu um erro ao criar o quadro. Verifique o console para mais detalhes.");
    } finally {
        hideLoading(); // Esconde loading
    }
}

// Melhoria para o botão "Quadros" no navbar
document.querySelector('#btn').addEventListener('click', function() {
    if (dropdownContent.style.display === 'block') {
        dropdownContent.style.display = 'none';
    } else {
        dropdownContent.style.display = 'block';
    }
});


async function carregarQuadrosNoDropdown() {
    dropdownContent.innerHTML = ''; // Limpa o dropdown antes de adicionar novos quadros

    try {
        const response = await fetch(getBoardsEndpoint);
        if (!response.ok) {
            throw new Error(`Erro ao carregar quadros: ${response.status}`);
        }
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(board => {
                const button = document.createElement('a');
                const boardDisplayName = board.Name ? board.Name : `Sem Nome `;
                button.textContent = `#${board.Id} ${boardDisplayName}`;
                button.href = '#';
                button.onclick = async (e) => {
                    e.preventDefault();
                    dropdownContent.style.display = 'none'; // Fecha o dropdown ao selecionar
                    await mostrarQuadro(board.Id, board.Name);
                };
                dropdownContent.appendChild(button);
            });
        } else {
            const noBoardsMsg = document.createElement('span');
            noBoardsMsg.textContent = 'Nenhum quadro encontrado.';
            noBoardsMsg.style.padding = '10px';
            noBoardsMsg.style.color = 'white';
            dropdownContent.appendChild(noBoardsMsg);
        }
    } catch (error) {
        console.error("Erro ao carregar quadros no dropdown:", error);
        const errorMsg = document.createElement('span');
        errorMsg.textContent = 'Erro ao carregar quadros.';
        errorMsg.style.padding = '10px';
        errorMsg.style.color = 'red';
        dropdownContent.appendChild(errorMsg);
    }
}

async function SaveBoard() {
    if (!currentBoardId) {
        alert("Não há um quadro selecionado para salvar. Crie ou selecione um quadro primeiro.");
        return;
    }

    showLoading("Salvando Quadro..."); // Mostra loading

    try {
        // Busca a descrição atual do quadro antes de salvar
        let currentDescription = "";
        try {
            const response = await fetch(`https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/GetCompleteBoard?BoardId=${currentBoardId}`);
            if (response.ok) {
                const boardData = await response.json();
                currentDescription = boardData.Board && boardData.Board.Description ? boardData.Board.Description : "";
            }
        } catch (e) {
            // Se falhar, mantém a descrição vazia
            console.warn("Não foi possível buscar a descrição atual do quadro. Prosseguindo sem ela.");
        }

        // Pega o texto do span de título, removendo o ID para obter apenas o nome
        const boardTitleText = quadroTituloSpan.textContent;
        const boardName = boardTitleText.replace(`#${currentBoardId}`, '').trim();
        const backgroundColor = quadroBodyContainer.dataset.bgColor || '#88b0d3';

        const boardToSave = {
            Id: currentBoardId,
            Name: boardName,
            Description: currentDescription, // Mantém a descrição já salva
            HexadecimalColor: backgroundColor
        };

        // Salva/Atualiza o quadro principal
        const boardResponse = await fetch(createOrUpdateBoardEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(boardToSave)
        });

        if (!boardResponse.ok) {
            const errorText = await boardResponse.text();
            throw new Error(`Erro ao salvar quadro principal: ${boardResponse.status} - ${errorText}`);
        }
        console.log(`Quadro "${boardToSave.Name}" (ID: ${currentBoardId}) salvo/atualizado com sucesso.`);


        // Coleta e salva/atualiza as colunas
        const colunasElementos = quadroBodyContainer.querySelectorAll('.coluna');
        for (const colunaElemento of colunasElementos) {
            const columnId = colunaElemento.dataset.columnId ? parseInt(colunaElemento.dataset.columnId) : 0;
            const columnTitle = colunaElemento.querySelector('.colunaHead h2').innerText.trim();

            const columnToSave = {
                Id: columnId,
                BoardId: currentBoardId,
                Title: columnTitle
            };

            const columnResponse = await fetch(criaColunaEndPoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(columnToSave)
            });

            if (!columnResponse.ok) {
                const errorText = await columnResponse.text();
                throw new Error(`Erro ao salvar coluna "${columnTitle}": ${columnResponse.status} - ${errorText}`);
            }

            const newColumnId = parseInt(await columnResponse.text());
            if (isNaN(newColumnId)) {
                throw new Error("ID da coluna inválido retornado pela API.");
            }

            if (columnId === 0) { // Se for uma nova coluna, atualiza o ID no DOM
                colunaElemento.dataset.columnId = newColumnId;
                console.log(`Coluna "${columnTitle}" criada com ID: ${newColumnId}`);
            } else {
                console.log(`Coluna "${columnTitle}" (ID: ${columnId}) atualizada.`);
            }

            // Coleta e salva/atualiza as tasks dentro desta coluna
            const tasksElementos = colunaElemento.querySelectorAll('.task');
            for (const taskElemento of tasksElementos) {
                const taskId = taskElemento.dataset.taskId ? parseInt(taskElemento.dataset.taskId) : 0;
                const taskTitle = taskElemento.querySelector('.taskTitle').innerText.trim();
                const taskDescription = taskElemento.querySelector('.taskDescription').innerText.trim();

                const taskToSave = {
                    Id: taskId,
                    ColumnId: parseInt(colunaElemento.dataset.columnId), // Garante que o ColumnId é o da API
                    Title: taskTitle,
                    Description: taskDescription
                };

                const taskResponse = await fetch(criaTaskEndPoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskToSave)
                });

                if (!taskResponse.ok) {
                    const errorText = await taskResponse.text();
                    throw new Error(`Erro ao salvar tarefa "${taskTitle}": ${taskResponse.status} - ${errorText}`);
                }

                const newTaskId = parseInt(await taskResponse.text());
                if (isNaN(newTaskId)) {
                    throw new Error("ID da tarefa inválido retornado pela API.");
                }

                if (taskId === 0) { // Se for uma nova tarefa, atualiza o ID no DOM
                    taskElemento.dataset.taskId = newTaskId;
                    console.log(`Tarefa "${taskTitle}" criada com ID: ${newTaskId}`);
                } else {
                    console.log(`Tarefa "${taskTitle}" (ID: ${taskId}) atualizada.`);
                }
            }
        }

        alert("Quadro salvo com sucesso na API!");

    } catch (error) {
        console.error("Erro ao salvar o quadro completo:", error);
        alert("Ocorreu um erro ao salvar o quadro. Verifique o console para mais detalhes.");
    } finally {
        hideLoading(); // Esconde loading
    }
}


async function mostrarQuadro(boardId) {
    // Esconde tela inicial e mostra quadro
    document.getElementById('telaInicial').style.display = 'none';
    quadroTela.style.display = 'flex';
    
    quadroTituloSpan.textContent = `Carregando quadro #${boardId}...`;
    showLoading("Carregando Quadro...");
    
    quadroBodyContainer.innerHTML = ''; // Limpa o conteúdo do quadro anterior

    try {
        const response = await fetch(`https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/GetCompleteBoard?BoardId=${boardId}`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar dados do quadro: ${response.status}`);
        }
        const boardData = await response.json();

        const realBoardName = boardData.Board.Name || "Sem Nome";

        currentBoardId = boardId;
        currentBoardName = realBoardName;
        quadroTituloSpan.textContent = `#${boardId} ${realBoardName}`; //injeta nome e id no cabeçalho do quadro
        
        // Aplica a cor de fundo salva, se houver
        if (boardData.Board && boardData.Board.HexadecimalColor) {
            aplicarCorDeFundo(boardData.Board.HexadecimalColor);
            seletorCorInput.value = boardData.Board.HexadecimalColor;
        } else {
            aplicarCorDeFundo('#88b0d3'); // Cor padrão
            seletorCorInput.value = '#88b0d3';
        }

        if (boardData && Array.isArray(boardData.ColumnStrs)) {
            // injeta Colunas e Tasks no .quadro
            boardData.ColumnStrs.forEach(colunaData => {
                const colunaInfo = colunaData.Column;
                const novaColuna = document.createElement('div');
                novaColuna.className = 'coluna';
                novaColuna.draggable = 'true';
                novaColuna.dataset.columnId = colunaInfo.Id;
                novaColuna.innerHTML = `
                    <div class="colunaHead">
                        <div class="colunaHeadTop">
                            <button class="minimiza" contenteditable="false" onclick="minimizarLista(this)">-</button>
                            <button class="deleteColuna" onclick="removerColuna(this)">X</button>
                        </div>
                        <h2 contenteditable="true">${colunaInfo.Title || 'Sem título'}</h2>
                    </div>
                    <div class="colunaBody"></div>
                `;

                const colunaBody = novaColuna.querySelector('.colunaBody');

                if (Array.isArray(colunaData.Tasks)) {
                    colunaData.Tasks.forEach(task => {
                        const novaTask = document.createElement('div');
                        novaTask.className = 'task';
                        novaTask.draggable = 'true';
                        novaTask.dataset.taskId = task.Id;
                        novaTask.innerHTML = `
                            <div class="taskHead">
                                <div class="taskTitle" contenteditable="true">${task.Title || 'Sem título'}</div>
                                <div class="taskActions">
                                    <button class="minimiza" contenteditable="false" onclick="minimizarTask(this)">-</button>
                                    <button class="deleteTask" contenteditable="false" onclick="removerTask(this)">X</button>
                                </div>
                            </div>
                            <div class="taskBody">
                                <div class="taskDescription" contenteditable="true">${task.Description || ''}</div>
                            </div>
                        `;
                        colunaBody.appendChild(novaTask);
                    });
                }
                //adiciona botao nova task
                const addTaskButton = document.createElement('div');
                addTaskButton.className = 'adicionarTask';
                addTaskButton.textContent = 'Adicionar Task';
                addTaskButton.onclick = () => adicionarTask(addTaskButton);
                colunaBody.appendChild(addTaskButton);
                //finalmente adiciona a coluna completa ao quadro
                quadroBodyContainer.appendChild(novaColuna);
            });
        }
        //adiciona botao Nova coluna
        const addColunaButton = document.createElement('div');
        addColunaButton.className = 'adicionarC';
        addColunaButton.id = 'colunaBotao';
        addColunaButton.textContent = 'Adicionar coluna +';
        addColunaButton.onclick = addColuna;

        quadroBodyContainer.appendChild(addColunaButton);

    } catch (error) {
        quadroBodyContainer.innerHTML = `<span style="color:red; padding: 20px;">Erro ao carregar o quadro #${boardId}. Verifique o console.</span>`;
        quadroTituloSpan.textContent = `Erro ao carregar quadro`;
        console.error("Erro ao carregar o quadro completo da API:", error);
    } finally {
        hideLoading(); // Esconde loading
    }
}

function adicionarTask(botao) {
    const coluna = botao.closest('.coluna');
    const novaTask = document.createElement('div');
    novaTask.className = 'task';
    novaTask.draggable = 'true';
    novaTask.innerHTML = `
        <div class="taskHead">
            <div class="taskTitle" contenteditable="true">Nova Task</div>
            <div class="taskActions">
                <button id="minimiza" class="minimiza" contenteditable="false" onclick="minimizarTask(this)">-</button>
                <button class="deleteTask" contenteditable="false" onclick="removerTask(this)">X</button>
            </div>
        </div>
        <div class="taskBody">
            <div class="taskDescription" contenteditable="true">Descrição da nova task</div>
        </div>
    `;
    coluna.querySelector('.colunaBody').insertBefore(novaTask, botao);
}

function addColuna() {
    if (!currentBoardId) {
        alert("Selecione ou crie um quadro primeiro para adicionar colunas.");
        return;
    }

    const novaColuna = document.createElement("div");
    novaColuna.className = 'coluna';
    novaColuna.draggable = "true";
    novaColuna.innerHTML = `
        <div class="colunaHead">
            <div class="colunaHeadTop">
                <button id="minimiza" class="minimiza" contenteditable="false" onclick="minimizarLista(this)">-</button>
                <button class="deleteColuna" onclick="removerColuna(this)">X</button>
            </div>
            <h2 contenteditable="true">Nova Coluna</h2>
        </div>
        <div class="colunaBody">
            <div class="adicionarTask" id="addTask" onclick="adicionarTask(this)">Adicionar Task</div>
        </div>`;

    document.getElementById('colunaBotao').insertAdjacentElement('beforebegin', novaColuna);
}

function verificarEnter(event) {
    if (event.key === "Enter") {
        criarQuadro();
    }
}

function removerColuna(element) {
    const coluna = element.closest('.coluna');
    if (!coluna) return;
    const confirmacao = confirm(`Tem certeza de que deseja remover a coluna "${coluna.querySelector('h2').innerText.trim()}" da sua visualização?`);
    
    if (!confirmacao) {
        return; // O usuário cancelou, então não fazemos nada.
    }
    coluna.remove();
}


async function removerTask(element) {
    const task = element.closest('.task');
    if (!task) return;

    const taskId = task.dataset.taskId;

    const confirmacao = confirm(`Tem certeza de que deseja excluir a tarefa "${task.querySelector('.taskTitle').innerText.trim()}"?`);
    if (!confirmacao) return;

    // Se a task tem um ID (já foi salva na API), tenta deletar da API
    if (taskId) {
        showLoading("Excluindo Tarefa...");
        try {
            const response = await fetch(`${deleteTaskEndpoint}?TaskId=${taskId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ao deletar tarefa da API: ${response.status} - ${errorText}`);
            }
            console.log(`Tarefa com ID ${taskId} deletada da API.`);
            task.remove(); // Remove do DOM apenas se a deleção na API for bem-sucedida
        } catch (error) {
            console.error("Erro ao deletar tarefa da API:", error);
            alert("Ocorreu um erro ao deletar a tarefa da API. Verifique o console.");
        } finally {
            hideLoading();
        }
    } else {
        // Se a task não tem ID, ela ainda não foi salva na API, então apenas remove do DOM
        task.remove();
    }
}

function fecharQuadro() {

    // Esconde a área do quadro
    document.getElementById('QUADRO').style.display = 'none';
    // Mostra a tela inicial novamente
    document.getElementById('telaInicial').style.display = 'flex';

    currentBoardId = null; 
    currentBoardName = ''; 
    // Limpa a URL para remover o ?boardId=... se ele existir
    window.history.pushState({}, document.title, window.location.pathname);
}

function minimizarTask(botao) {
    const task = botao.closest('.task');
    if (!task) return;
    const corpo = task.querySelector('.taskBody');
    if (!corpo) return;
    const estiloCorpo = window.getComputedStyle(corpo).display;
    if (estiloCorpo !== 'none') {
        corpo.style.display = 'none';
    } else {
        corpo.style.display = 'block';
    }
}

function minimizarLista(botao) {
    const coluna = botao.closest('.coluna');
    if (!coluna) return;
    const lista = coluna.querySelector('.colunaBody');
    if (!lista) return;
    const estilo = window.getComputedStyle(lista).display;
    if (estilo !== 'none') {
        lista.style.display = 'none';
    } else {
        lista.style.display = 'block';
    }
}
function abrirPaleta(iconeElemento) {
    if (paletaCores.style.display === 'block') {
        paletaCores.style.display = 'none';
        return;
    }
     const iconeRect = iconeElemento.getBoundingClientRect();
    paletaCores.style.display = 'block';
    paletaCores.style.top = (iconeRect.bottom + window.scrollY + 5) + 'px'; // 5px abaixo do ícone
    paletaCores.style.left = (iconeRect.left + window.scrollX) + 'px';
}

function aplicarCorDeFundo(hexColor) {
    // Aplica a cor ao fundo do quadro na UI
    quadroBodyContainer.style.backgroundColor = hexColor;

    // Armazena a cor em um atributo 'data-' para fácil acesso ao salvar
    quadroBodyContainer.dataset.bgColor = hexColor;
}

// Event listener para o seletor de cores
seletorCorInput.addEventListener('input', (event) => {
    aplicarCorDeFundo(event.target.value);
});

//Fecha a paleta se o usuário clicar fora dela
window.addEventListener('click', function(event) {
    if (!paletaCores.contains(event.target) && event.target.className !== 'paleta') {
        paletaCores.style.display = 'none';
    }
});


// --- Funções de Inicialização ---
window.onload = function () {
    carregarQuadrosNoDropdown();

    const urlParams = new URLSearchParams(window.location.search);
    const boardIdFromURL = urlParams.get('boardId');

    if (boardIdFromURL) {
        // Se um ID veio da URL, mostra o quadro diretamente
        mostrarQuadro(boardIdFromURL); 
    } else {
        // Se não, mostra a tela inicial
        document.getElementById('telaInicial').style.display = 'flex';
        document.getElementById('QUADRO').style.display = 'none';
    }
};

function editaNome() {
    if (document.getElementById('input-edita-nome')) {
        return;
    }
    const nomeAtual = currentBoardName;

    quadroTituloSpan.style.display = 'none';

    // Cria um elemento <input> dinamicamente.
    const inputNome = document.createElement('input');
    inputNome.type = 'text';
    inputNome.id = 'input-edita-nome'; 
    inputNome.className = 'titulo-input';
    inputNome.value = nomeAtual;

    // Adiciona o input ao lado do span.
    quadroTituloSpan.parentNode.insertBefore(inputNome, quadroTituloSpan.nextSibling);
    inputNome.focus(); // Foca o cursor no input para o usuário já poder digitar.

    const finalizarEdicao = () => {
        // Remove o input da tela e exibe titulo
        inputNome.remove();
        quadroTituloSpan.style.display = 'inline';
    };

    inputNome.addEventListener('keydown', (e) => {
        // Se a tecla for "Enter"
        if (e.key === 'Enter') {
            const novoNome = inputNome.value.trim();
            if (novoNome) { 
                currentBoardName = novoNome;
                quadroTituloSpan.textContent = `#${currentBoardId} ${novoNome}`;
            }
            finalizarEdicao();
        }
        // Se a tecla for "Esc"
        if (e.key === 'Escape') {
            finalizarEdicao(); // Apenas cancela, sem salvar o novo nome.
        }
    });

    // Cancela edição se o usuario clicar fora do input
    inputNome.addEventListener('blur', () => {
        finalizarEdicao();
    });
}