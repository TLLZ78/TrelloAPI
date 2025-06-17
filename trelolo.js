var qtdQuadros = 0;
var qtdListas = 0;


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
    qtdQuadros++;

    const novoQuadro = document.createElement('a');
    novoQuadro.innerText = "NovoQuadro";
    document.body.appendChild(novoParagrafo);

    carregarQuadrosNoDropdown();
}

function botaoNovoQuadro(){
    const doc = document.getElementById("novoQuadro");

        if(doc.style.display === 'none'){
            doc.style.display = 'flex';
            console.log(" Visivel");
            
        } else if(doc.style.display === "flex"){
            doc.style.display = "none";
        
        }
}




function adicionarTask(botao){
    const coluna = botao.closest('.coluna'); // Encontra a coluna mais próxima do botão clicado
    const novaTask = document.createElement('div');
    novaTask.className = 'task';
    novaTask.innerHTML = `
        <div class="taskHead" contenteditable="true" oninput="saveData()">Nova Task
        <span class="deleteTask" onclick="remover(this)">X</span>
        </div>
        <div class="taskBody" contenteditable="true" oninput="saveData()">Descrição da nova task</div>
    `;
    coluna.querySelector('.colunaBody').insertBefore(novaTask, botao); // Insere a nova task antes do botão

    saveData(); // Atualiza o localStorage
}

function addColuna(){
    console.log("funcionando");
    const novaColuna = document.createElement("div");
    novaColuna.className = 'coluna';
    novaColuna.innerHTML =  `
    <div class="colunaHead"><h2 contenteditable="true" oninput="saveData()">Nova Lista</h2>
    <span class="deleteColuna" onclick="remover(this)">X</span>
    </div>
    <div class="colunaBody">
    <div class="adicionarTask" id="addTask" onclick="adicionarTask(this)">Adicionar Task</div>
    </div>`;
    qtdListas++;
    document.getElementById('colunaBotao').insertAdjacentElement('beforebegin', novaColuna);

    saveData(); // Atualiza o localStorage
}

function verificarEnter(event) {
    if (event.key === "Enter") {
        criarQuadro(); // Chama a função criarQuadro ao pressionar Enter
    }
} 

function remover(element) {
    // Remove a task correspondente
    const task = element.closest('.task');
    if (task) {
    task.remove();
    }

    const coluna = element.closest('.coluna'); // Encontra a coluna mais próxima da task removida
    if (coluna && !task){
        coluna.remove(); // Remove a coluna
    }
    
    // Atualiza o localStorage
    saveData();
}

function removerQuadro() {
    const quadroTitulo = document.querySelector('.tituloQuadro').innerText.trim();
    if (!quadroTitulo) {
        alert("Nenhum quadro selecionado para excluir.");
        return;
    }

    const allBoards = JSON.parse(localStorage.getItem('boards')) || {};

    if (confirm(`Tem certeza de que deseja remover o quadro "${quadroTitulo}"?`)) {
        // Remove o quadro do localStorage
        delete allBoards[quadroTitulo];
        localStorage.setItem('boards', JSON.stringify(allBoards));
        

        // Atualiza a interface
        document.querySelector('.quadro').innerHTML = ''; // Limpa o conteúdo do quadro
        document.querySelector('.tituloQuadro').innerText = ''; // Remove o título do quadro
        alert(`O quadro "${quadroTitulo}" foi removido.`);

        carregarQuadrosNoDropdown(); // Atualiza o dropdown
    }


}

// Salva os dados do quadro no localStorage
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

// Carrega os quadros no dropdown
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
                button.textContent = board.Name || 'Quadro sem nome';
                button.href = '#';
                // Passa o BoardId para mostrarQuadro
                button.onclick = () => mostrarQuadro(board.Id, board.Name);
                console.log(board.Id)
                dropdown.appendChild(button);   
        //    }
            });
        } 
}

// Mostra o quadro selecionado e carrega suas tasks da API
async function mostrarQuadro(boardId, boardName) {
    const teste = document.getElementById('QUADRO');
    document.querySelector('.tituloQuadro').innerText = boardName || '';
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
                novaColuna.innerHTML = `
                    <div class="colunaHead">
                        <h2 contenteditable="true">${colunaInfo.Title || 'Sem título'}</h2>
                        <span class="deleteColuna" onclick="remover(this)">X</span>
                    </div>
                    <div class="colunaBody"></div>
                `;

                const colunaBody = novaColuna.querySelector('.colunaBody');

                // colunaData.Tasks é o array de tarefas
                if (Array.isArray(colunaData.Tasks)) {
                    colunaData.Tasks.forEach(task => {
                        const novaTask = document.createElement('div');
                        novaTask.className = 'task';
                        novaTask.innerHTML = `
                            <div class="taskHead" contenteditable="true">
                                ${task.Title || 'Sem título'}
                                <span class="deleteTask" onclick="remover(this)">X</span>
                            </div>
                            <div class="taskBody" contenteditable="true">${task.Description || ''}</div>
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

// Carrega os quadros no dropdown ao iniciar a página
window.onload = function () {
    carregarQuadrosNoDropdown();
};