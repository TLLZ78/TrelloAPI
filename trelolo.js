function criarQuadro(){

    const nome = document.getElementById('nomeQuadro').value;
    const allBoards = JSON.parse(localStorage.getItem("boards")) || {};
    

    if(nome === ""){
        alert("A area não pode estar vazia");
        return;
    }

    if (allBoards[nome]) {
        alert("Já existe um quadro com esse nome. Escolha outro nome.");
        return;
    }

    alert("Novo quadro criado");
    botaoNovoQuadro();
    mostrarQuadro(nome);

    const novoQuadro = document.createElement('a');
    novoQuadro.innerText = "NovoQuadro";
    document.body.appendChild(novoParagrafo);

    carregarQuadrosNoDropdown();
}

async function carregarQuadrosNoDropdown() {
    const dropdown = document.querySelector('.dropDownContent');
    dropdown.innerHTML = ''; // Limpa o dropdown antes de adicionar novos quadros

        const response = await fetch('https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/GetBoards');
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0 ) {
            //const filtro = "testanto";
            

            data.forEach(board => {
          //       if ((board.Name || '').includes(filtro)) { // Só adiciona se passar no filtro
                const button = document.createElement('a');
                if(!board.Name){
                button.textContent = `#${board.Id} Quadro Sem Nome`
                }else{
                button.textContent = `#${board.Id} ${board.Name}`;
                }
                button.href = '#';
                // Passa o BoardId para mostrarQuadro
                button.onclick = () => mostrarQuadro(board.Id, board.Name);
                dropdown.appendChild(button);   
        //    }
            });
        } 
}

function botaoNovoQuadro(){ //pop up
    const doc = document.getElementById("novoQuadro");

        if(doc.style.display === 'none'){
            doc.style.display = 'flex';
            
        } else if(doc.style.display === "flex"){
            doc.style.display = "none";
        }
}

function adicionarTask(botao){
    const coluna = botao.closest('.coluna'); // Encontra a coluna mais próxima do botão clicado
    const novaTask = document.createElement('div');
    novaTask.className = 'task';
    novaTask.draggable = 'true';
    novaTask.innerHTML = `
        <div class="taskHead">
            <div class="taskTitle" contenteditable="true">Titulo task</div>
            <div class="taskActions">
                <button id="minimiza" class="minimiza" contenteditable="false" onclick="minimizarTask(this)">-</button>
                <button class="deleteTask" contenteditable="false" onclick="removerTask(this)">X</button>
            </div>
        </div>
        <div class="taskBody">
            <div class="taskDescription" contenteditable="true">Descrição da nova task</div>
        </div>
    `;
    coluna.querySelector('.colunaBody').insertBefore(novaTask, botao); // Insere a nova task antes do botão
    novaTask.querySelector('.taskTitle').addEventListener('input', salvarQuadro);
    novaTask.querySelector('.taskDescription').addEventListener('input', salvarQuadro);
}

function addColuna(){
    const novaColuna = document.createElement("div");
    novaColuna.className = 'coluna';
    novaColuna.draggable = "ture";
    novaColuna.innerHTML =  `
            <div class="colunaHead">
                <div class="colunaHeadTop">
                    <button id="minimiza" class="minimiza" contenteditable="false" onclick="minimizarLista(this)">-</button>
                    <button class="deleteColuna" onclick="removerColuna(this)">X</button>
                </div>
                <h2 contenteditable="true">Nova Lista</h2>
            </div>
    <div class="colunaBody">
    <div class="adicionarTask" id="addTask" onclick="adicionarTask(this)">Adicionar Task</div>
    </div>`;
    document.getElementById('colunaBotao').insertAdjacentElement('beforebegin', novaColuna);
    novaColuna.querySelector('h2[contenteditable="true"]').addEventListener('input', salvarQuadro);
    //salvarQuadro();
}

function verificarEnter(event) {
    if (event.key === "Enter") {
        criarQuadro(); // Chama a função criarQuadro ao pressionar Enter
    }
} 

function removerColuna(element) {
    // Remove a coluna correspondente
    const coluna = element.closest('.coluna');
    if (coluna) {
        coluna.remove();
    }
   // salvarQuadro()

}

function removerTask(element) {
    // Remove a task correspondente
    const task = element.closest('.task');
    if (task) {
        task.remove();
    }
    //salvarQuadro()

}

function saveData() {
    const colunas = document.querySelectorAll('.coluna');
    const boardData = [];

    colunas.forEach(coluna => {
        const colunaHead = coluna.querySelector('.colunaHead h2').innerText.trim();
        const tasks = [];
        const taskElements = coluna.querySelectorAll('.task');

        taskElements.forEach(task => {
            const taskHead = task.querySelector('.taskHead')
            const taskBody = task.querySelector('.taskBody').innerText.trim();
            const deleteButton = taskHead.querySelector('.deleteTask');
            if (deleteButton) deleteButton.remove();

            const taskHeadText = taskHead.innerText.trim();
            tasks.push({ title: taskHeadText, description: taskBody });

            if (deleteButton) taskHead.appendChild(deleteButton);
        });

        boardData.push({ columnTitle: colunaHead, tasks });
    });

    const currentBoardName = document.querySelector('.tituloQuadro').innerText.trim();
    const allBoards = JSON.parse(localStorage.getItem('boards')) || {};
    allBoards[currentBoardName] = boardData;

    localStorage.setItem('boards', JSON.stringify(allBoards));
}

function atualizarListaQuadros() {
    const quadrosSalvos = JSON.parse(localStorage.getItem('quadros')) || [];
    const dropDownContent = document.querySelector('.dropDownContent');

    // Limpa a lista atual
    dropDownContent.innerHTML = '';

    // Adiciona cada quadro salvo a lista
    quadrosSalvos.forEach((quadro, index) => {
        const link = document.createElement('a');
        link.href = '#';
        link.innerText = quadro.nome;
        const nomeQuadro = document.querySelector('.tituloQuadro span').innerText.trim();
        link.onclick = () => carregarQuadro(index); 
        dropDownContent.appendChild(link);
    });
}

async function mostrarQuadro(boardId, boardName) {
    if(!boardName){
        boardName = "Quadro Sem Nome"
    }
    const teste = document.getElementById('QUADRO');
    document.querySelector('.tituloQuadro').innerHTML = 
    `#${boardId}  ${boardName} <span class="closeQuadro" onclick="fecharQuadro()">X</span>` || '';
    
    teste.style.display = 'flex';

    const quadro = document.querySelector('.quadro');
    quadro.innerHTML = '';

    try {
        const response = await fetch(`https://personal-ga2xwx9j.outsystemscloud.com/Trellospl/rest/Trello/GetCompleteBoard?BoardId=${boardId}`);
        const boardData = await response.json();

        // Agora usamos boardData.ColumnStrs
        if (Array.isArray(boardData.ColumnStrs)) {
            boardData.ColumnStrs.forEach(colunaData => {
                const colunaInfo = colunaData.Column;
                const novaColuna = document.createElement('div');
                novaColuna.className = 'coluna';
                novaColuna.draggable = 'true';
                novaColuna.innerHTML = `
                    <div class="colunaHead">
                        <div class="colunaHeadTop">
                            <button id="minimiza" class="minimiza" contenteditable="false" onclick="minimizarLista(this)">-</button>
                            <button class="deleteColuna" onclick="removerColuna(this)">X</button>
                        </div>
                    <h2 contenteditable="true">${colunaInfo.Title || 'Sem título'}</h2>
                    </div>
                    <div class="colunaBody"></div>
                `;

                const colunaBody = novaColuna.querySelector('.colunaBody');

                // colunaData.Tasks é o array de tarefas
                if (Array.isArray(colunaData.Tasks)) {
                    colunaData.Tasks.forEach(task => {
                        const novaTask = document.createElement('div');
                        novaTask.className = 'task';
                        novaTask.draggable = 'true';
                        novaTask.innerHTML = `
                        <div class="taskHead">
                            <div class="taskTitle" contenteditable="true">${task.Title || 'Sem título'}</div>
                            <div class="taskActions">
                                <button id="minimiza" class="minimiza" contenteditable="false" onclick="minimizarTask(this)">-</button>
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

                const addTaskButton = document.createElement('div');
                addTaskButton.className = 'adicionarTask';
                addTaskButton.textContent = 'Adicionar Task';
                addTaskButton.onclick = () => adicionarTask(addTaskButton);

                colunaBody.appendChild(addTaskButton);
                quadro.appendChild(novaColuna);
            });
        }

        const addColunaButton = document.createElement('div');
        addColunaButton.className = 'adicionarC';
        addColunaButton.id = 'colunaBotao';
        addColunaButton.textContent = 'Adicionar coluna +';
        addColunaButton.onclick = addColuna;

        quadro.appendChild(addColunaButton);

    } catch (error) {
        quadro.innerHTML = '<span style="color:red">Erro ao carregar o quadro.</span>';
        console.error(error);
    }
}

window.onload = function () {
    carregarQuadrosNoDropdown();
};

function excluirQuadro() {
    // Exibe um alerta de confirmação
    const confirmacao = confirm('Tem certeza de que deseja excluir este quadro?');

    if (!confirmacao) {
        // Se o usuário cancelar, não faz nada
        return;
    }

    // Captura o nome do quadro atual
    const nomeQuadro = document.querySelector('.tituloQuadro span').innerText.trim();

    // Recupera os quadros salvos no localStorage
    let quadrosSalvos = JSON.parse(localStorage.getItem('quadros')) || [];
    quadrosSalvos = quadrosSalvos.filter(quadro => quadro.nome !== nomeQuadro);

    // Atualiza o localStorage com a nova lista de quadros
    localStorage.setItem('quadros', JSON.stringify(quadrosSalvos));

    // Atualiza a lista de quadros no menu "Quadros"
    atualizarListaQuadros();

    // Limpa o conteúdo do quadro atual
    const quadroContainer = document.querySelector('.quadro');
    quadroContainer.innerHTML = ''; // Limpa o conteúdo do quadro
    document.querySelector('.tituloQuadro span').innerText = '';

    // Oculta o quadro e exibe a tela inicial
    document.getElementById('QUADRO').style.display = 'none';
    document.getElementById('telaInicial').style.display = 'flex';

    alert('Quadro excluído com sucesso!');
}

function fecharQuadro() {
    // Oculta o quadro
    document.getElementById('QUADRO').style.display = 'none';

}

//a fazer
function minimizarTask(botao) {
    const task = botao.closest('.task');
    if (!task) return;
    const corpo = task.querySelector('.taskBody');
    if (!corpo) return;
    const estiloCorpo = window.getComputedStyle(corpo).display;
    if (estiloCorpo !== 'none') {
        corpo.style.display = 'none';
    } else {
        corpo.style.display = 'block'; // Garante que o layout flex seja restaurado
    }
}

function minimizarLista(botao){
    const coluna = botao.closest('.coluna');
    if (!coluna) return;
    const lista = coluna.querySelector('.colunaBody');
    if (!lista) return;
    const estilo = window.getComputedStyle(lista).display;
    if(estilo !== 'none'){
        lista.style.display = 'none';
    }else{
        lista.style.display = 'block'; // block funciona para colunaBody
    }
}