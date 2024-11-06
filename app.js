document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.querySelector('#task_controller input');
    const addButton = document.querySelector('#task_controller button');
    const inProgressContainer = document.querySelector('#en_cours .tasks');
    const completedContainer = document.querySelector('#termine .tasks');

    // Load tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || { inProgress: [], completed: [] };

    // Function to render tasks
    function renderTasks() {
        inProgressContainer.innerHTML = '';
        completedContainer.innerHTML = '';

        tasks.inProgress.forEach(task => createTaskElement(task, inProgressContainer));
        tasks.completed.forEach(task => createTaskElement(task, completedContainer));
    }

    // Create task element
    function createTaskElement(task, container) {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task');
        taskElement.setAttribute('draggable', true);
        taskElement.dataset.id = task.id;

        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        taskElement.appendChild(taskText);

        const modifyButton = document.createElement('button');
        modifyButton.textContent = 'Modifier';
        modifyButton.addEventListener('click', () => modifyTask(task, taskElement));
        taskElement.appendChild(modifyButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.addEventListener('click', () => deleteTask(task, taskElement));
        taskElement.appendChild(deleteButton);

        taskElement.addEventListener('dragstart', () => onDragStart(taskElement));
        taskElement.addEventListener('dragend', () => onDragEnd(taskElement));

        container.appendChild(taskElement);
    }

    // Modify task
    function modifyTask(task, taskElement) {
        const newText = prompt('Modifier la tâche:', task.text);
        if (newText) {
            task.text = newText;
            saveTasks();
            renderTasks();
        }
    }

    // Delete task
    function deleteTask(task, taskElement) {
        taskElement.classList.add('deleted');
        const deletedLine = document.createElement('span');
        deletedLine.classList.add('deleted-line');
        deletedLine.textContent = task.text;
        taskElement.appendChild(deletedLine);

        setTimeout(() => {
            // Remove task from DOM
            if (taskElement.classList.contains('deleted')) {
                removeTaskFromDOM(task);
            }
        }, 500);
    }

    // Remove task from DOM after animation
    function removeTaskFromDOM(task) {
        const taskElement = document.querySelector(`[data-id="${task.id}"]`);
        taskElement.remove();
        tasks.inProgress = tasks.inProgress.filter(t => t.id !== task.id);
        tasks.completed = tasks.completed.filter(t => t.id !== task.id);
        saveTasks();
    }

    // Drag and Drop
    function onDragStart(taskElement) {
        taskElement.classList.add('dragging');
    }

    function onDragEnd(taskElement) {
        taskElement.classList.remove('dragging');
    }

    function onDrop(event, status) {
        event.preventDefault();
        const taskElement = document.querySelector('.dragging');
        const taskId = taskElement.dataset.id;
        const task = findTaskById(taskId);

        if (status === 'inProgress' && !tasks.inProgress.includes(task)) {
            tasks.inProgress.push(task);
            tasks.completed = tasks.completed.filter(t => t.id !== taskId);
        } else if (status === 'completed' && !tasks.completed.includes(task)) {
            tasks.completed.push(task);
            tasks.inProgress = tasks.inProgress.filter(t => t.id !== taskId);
        }

        saveTasks();
        renderTasks();
    }

    function onDragOver(event) {
        event.preventDefault();
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Add task from input
    addButton.addEventListener('click', () => {
        const taskText = inputField.value.trim();
        if (taskText) {
            const newTask = {
                id: Date.now().toString(),
                text: taskText
            };
            tasks.inProgress.push(newTask);
            inputField.value = '';
            saveTasks();
            renderTasks();
        }
    });

    // Helper to find task by ID
    function findTaskById(id) {
        return [...tasks.inProgress, ...tasks.completed].find(task => task.id === id);
    }

    // Initialize drag and drop event listeners
    inProgressContainer.addEventListener('dragover', onDragOver);
    inProgressContainer.addEventListener('drop', (event) => onDrop(event, 'inProgress'));

    completedContainer.addEventListener('dragover', onDragOver);
    completedContainer.addEventListener('drop', (event) => onDrop(event, 'completed'));

    // Initial render
    renderTasks();
});
