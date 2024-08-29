let todo = [];
let completed = [];
let editIndex = null;
let editItem = {};

function addTodo() {
    const title = document.getElementById('title-input').value;
    const description = document.getElementById('description-input').value;

    if (title && description) {
        const newTodo = {
            title: title,
            description: description
        };
        todo.push(newTodo);
        localStorage.setItem('todolist', JSON.stringify(todo));
        renderTodoList();
        document.getElementById('title-input').value = '';
        document.getElementById('description-input').value = '';
    }
}

function renderTodoList() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';
    todo.forEach((item, index) => {
        if (editIndex === index) {
            todoList.innerHTML += `
                <div class="edit" key=${index}>
                    <input id="edit-title" placeholder='Updated title' value='${editItem.title || ''}' />
                    <textarea id="edit-description" placeholder='Updated description' rows='4'>${editItem.description || ''}</textarea>
                    <button type='button' class='primary-btn' onclick='updateTodo()'>Update</button>
                </div>
            `;
        } else {
            todoList.innerHTML += `
                <div class="item" key=${index}>
                    <div>
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>
                    <div>
                        <span class="delete" onclick="deleteTodo(${index})">&#128465;</span>
                        <span class="check" onclick="completeTodo(${index})">&#10003;</span>
                        <span class="edit2" onclick="editTodo(${index})">&#9998;</span>
                    </div>
                </div>
            `;
        }
    });
}

function deleteTodo(index) {
    todo.splice(index, 1);
    localStorage.setItem('todolist', JSON.stringify(todo));
    renderTodoList();
}

function completeTodo(index) {
    const now = new Date();
    const completedOn = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()} at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    const completedTodo = {
        ...todo[index],
        completedOn: completedOn
    };
    completed.push(completedTodo);
    deleteTodo(index);
    localStorage.setItem('completedTodos', JSON.stringify(completed));
    renderCompletedList();
}

function renderCompletedList() {
    const completedList = document.getElementById('completed-list');
    completedList.innerHTML = '';
    completed.forEach((item, index) => {
        completedList.innerHTML += `
            <div class="item" key=${index}>
                <div>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <p><small>Completed on: ${item.completedOn}</small></p>
                </div>
                <div>
                    <span class="delete" onclick="deleteCompleted(${index})">&#128465;</span>
                </div>
            </div>
        `;
    });
}

function deleteCompleted(index) {
    completed.splice(index, 1);
    localStorage.setItem('completedTodos', JSON.stringify(completed));
    renderCompletedList();
}

function editTodo(index) {
    editIndex = index;
    editItem = { ...todo[index] };
    renderTodoList();
}

function updateTodo() {
    const updatedTitle = document.getElementById('edit-title').value;
    const updatedDescription = document.getElementById('edit-description').value;
    if (updatedTitle && updatedDescription) {
        todo[editIndex] = { title: updatedTitle, description: updatedDescription };
        localStorage.setItem('todolist', JSON.stringify(todo));
        editIndex = null;
        editItem = {};
        renderTodoList();
    }
}

function showTodo() {
    document.getElementById('todo-list').style.display = 'block';
    document.getElementById('completed-list').style.display = 'none';
    document.querySelector('.second-btn.active').classList.remove('active');
    document.querySelector('.second-btn:nth-child(1)').classList.add('active');
}

function showCompleted() {
    document.getElementById('todo-list').style.display = 'none';
    document.getElementById('completed-list').style.display = 'block';
    document.querySelector('.second-btn.active').classList.remove('active');
    document.querySelector('.second-btn:nth-child(2)').classList.add('active');
}

window.onload = () => {
    todo = JSON.parse(localStorage.getItem('todolist')) || [];
    completed = JSON.parse(localStorage.getItem('completedTodos')) || [];
    renderTodoList();
    renderCompletedList();
};
