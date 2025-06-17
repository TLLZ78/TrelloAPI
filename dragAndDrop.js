// Drag and drop para tasks
document.addEventListener('DOMContentLoaded', () => {
    const quadro = document.querySelector('.quadro'); // Elemento pai que contém as colunas
    let draggedTask = null; // Armazena a task que está sendo arrastada
    let placeholder = document.createElement('div'); // Placeholder para indicar a posição
    placeholder.className = 'placeholder'; // Classe para estilizar o placeholder

    // Delegação de eventos para dragstart
    quadro.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('task')) {
            draggedTask = e.target; // Armazena a task que está sendo arrastada
            draggedTask.classList.add('dragging'); // Adiciona uma classe para estilizar a task arrastada
            setTimeout(() => draggedTask.style.display = 'none', 0); // Oculta a task enquanto é arrastada
        }
    });

    // Delegação de eventos para dragend
    quadro.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('task')) {
            draggedTask.style.display = 'block'; // Mostra a task novamente
            draggedTask.classList.remove('dragging'); // Remove a classe de estilização
            draggedTask = null; // Limpa a referência da task arrastada
            if (placeholder.parentNode) {
                placeholder.parentNode.removeChild(placeholder); // Remove o placeholder
            }
        }
    });

    // Delegação de eventos para dragover
    quadro.addEventListener('dragover', (e) => {
        e.preventDefault(); // Permite o drop
        if (draggedTask && e.target.classList.contains('colunaBody')) { // Verifica se é uma task sendo arrastada
            const afterElement = getDragAfterElement(e.target, e.clientY); // Obtém o elemento após o qual o placeholder será inserido
            const addTaskButton = e.target.querySelector(".adicionarTask");
            if (afterElement == null) {
                e.target.appendChild(placeholder); // Adiciona o placeholder no final da coluna
                e.target.insertBefore(placeholder, addTaskButton);
            } else {
                e.target.insertBefore(placeholder, afterElement); // Adiciona o placeholder antes do elemento encontrado
            }
        }
    });

    
    quadro.addEventListener('drop', (e) => {
        e.preventDefault(); // Previne o comportamento padrão do navegador
        if (draggedTask && (e.target.classList.contains('colunaBody') || e.target === placeholder)) { // Verifica se é uma task sendo arrastada
            if (placeholder.parentNode) {
                placeholder.parentNode.replaceChild(draggedTask, placeholder); // Substitui o placeholder pela task arrastada
            }
            draggedTask.style.display = 'block'; // Mostra a task novamente
            draggedTask.classList.remove('dragging'); // Remove a classe de estilização
            draggedTask = null; // Limpa a referência da task arrastada
        }
    });

    // Função para obter o elemento após o qual o placeholder será inserido
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2; // Calcula a distância do mouse ao centro do elemento
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});

// Drag and drop para colunas
document.addEventListener('DOMContentLoaded', () => {
    const quadro = document.querySelector('.quadro'); // Elemento pai que contém as colunas
    let draggedColumn = null; // Armazena a coluna que está sendo arrastada
    let columnPlaceholder = document.createElement('div'); // Placeholder para indicar a posição da coluna
    columnPlaceholder.className = 'column-placeholder'; // Classe para estilizar o placeholder da coluna

    // Delegação de eventos para dragstart nas colunas
    quadro.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('coluna')) {
            draggedColumn = e.target; // Armazena a coluna que está sendo arrastada
            draggedColumn.classList.add('dragging'); // Adiciona uma classe para estilizar a coluna arrastada
            setTimeout(() => draggedColumn.style.display = 'none', 0); // Oculta a coluna enquanto é arrastada
        }
    });

    // Delegação de eventos para dragend nas colunas
    quadro.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('coluna')) {
            draggedColumn.style.display = 'flex'; // Mostra a coluna novamente
            draggedColumn.classList.remove('dragging'); // Remove a classe de estilização
            draggedColumn = null; // Limpa a referência da coluna arrastada
            if (columnPlaceholder.parentNode) {
                columnPlaceholder.parentNode.removeChild(columnPlaceholder); // Remove o placeholder
            }
        }
    });

    // Delegação de eventos para dragover nas colunas
    quadro.addEventListener('dragover', (e) => {
    e.preventDefault(); // Permite o drop
    if (draggedColumn) { // Verifica se é uma coluna sendo arrastada
        const afterColumn = getDragAfterElementForColumns(quadro, e.clientX); // Obtém a coluna após a qual o placeholder será inserido
        const btnColuna = quadro.querySelector('.adicionarC'); // Seleciona o botão "Adicionar Coluna" diretamente do contêiner principal

        if (afterColumn == null) {
            quadro.insertBefore(columnPlaceholder, btnColuna); // Adiciona o placeholder antes do botão "Adicionar Coluna"
        } else {
            quadro.insertBefore(columnPlaceholder, afterColumn); // Adiciona o placeholder antes da coluna encontrada
        }
    }
});

    // Delegação de eventos para drop nas colunas
    quadro.addEventListener('drop', (e) => {
        e.preventDefault(); // Previne o comportamento padrão do navegador
        if (draggedColumn && columnPlaceholder.parentNode) { // Verifica se é uma coluna sendo arrastada
            columnPlaceholder.parentNode.replaceChild(draggedColumn, columnPlaceholder); // Substitui o placeholder pela coluna arrastada
            draggedColumn.style.display = 'flex'; // Mostra a coluna novamente
            draggedColumn.classList.remove('dragging'); // Remove a classe de estilização
            draggedColumn = null; // Limpa a referência da coluna arrastada
        }
    });

    // Função para obter o elemento após o qual o placeholder será inserido (para colunas)
    function getDragAfterElementForColumns(container, x) {
        const draggableColumns = [...container.querySelectorAll('.coluna:not(.dragging)')];

        return draggableColumns.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2; // Calcula a distância do mouse ao centro horizontal da coluna
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});