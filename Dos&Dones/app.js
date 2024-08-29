// Async function to edit a todo item
let total = 0;
let whichButtonIsClicked = 0;
const editTodoItem = async (index) => {
    const titleInput = document.getElementById(`title${index}`);
    const titleText = titleInput.textContent;
    const descriptionInput = document.getElementById(`description${index}`);

    const updatedItem = {
        title: prompt("edit the todo", titleInput.textContent),
        description: prompt("edit the description", descriptionInput.textContent)
    };

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login/index.html'; // Redirect to login page if token is not available
        return;
    }

    try {
        const response = await fetch(`https://motivation-mate-backend-tester.vercel.app/api/todoList/title/${titleText}`, { // Assuming the endpoint includes the item index
            method: 'PUT', // or 'PATCH' depending on your API
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedItem)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Updated Todo Item:', data);
        // Optionally, update the UI or notify the user of the successful update
    } catch (error) {
        console.error('Error:', error);
        // Optionally, display the error message to the user
    }
    document.addEventListener('DOMContentLoaded', fetching());
};

const deleteTodoItem = async (index) => {
    const titleInput = document.getElementById(`title${index}`);
    const titleText = titleInput.textContent;

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html'; // Redirect to login page if token is not available
        return;
    }

    try {
        const response = await fetch(`https://motivation-mate-backend-tester.vercel.app/api/todoList/title/${titleText}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Deleted Todo Item:', titleText);
        // Optionally, update the UI to reflect the deletion
        fetching(); // Re-fetch the todo list to update the UI
    } catch (error) {
        console.error('Error:', error);
        // Optionally, display the error message to the user
    }
    document.addEventListener('DOMContentLoaded', fetching());
};

const updateTodoDone = async (index) => {
    const titleInput = document.getElementById(`title${index}`);
    const titleText = titleInput.textContent;

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html'; // Redirect to login page if token is not available
        return;
    }

    try {
        const response = await fetch(`https://motivation-mate-backend-tester.vercel.app/api/todoList/done/title/${titleText}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Done Todo Item:', titleText);
        // Optionally, update the UI to reflect the deletion
        fetching(); // Re-fetch the todo list to update the UI
    } catch (error) {
        console.error('Error:', error);
        // Optionally, display the error message to the user
    }
    if(whichButtonIsClicked ==0 )
    {
        document.addEventListener('DOMContentLoaded', fetching());
    }else{
        document.addEventListener('DOMContentLoaded', fetchingCompleted());
    }
};

const fetching = async () => {
    const token = localStorage.getItem('token');
    console.log(token);

    if (!token) {
        window.location.href = 'login.html'; // Redirect to login page if token is not available
        return;
    }

    try {
        const response = await fetch('https://motivation-mate-backend-tester.vercel.app/api/todoList', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Todo List:', data);
        total = data.length;

        // Update the DOM with the todo items
        const todoContainer = document.getElementById('todo-list');
        const completedContainer = document.getElementById('completed-list');
        //todoContainer.innerHTML = '';
        completedContainer.innerHTML = '';
        todoContainer.innerHTML = ''; // Clear any existing content

        data.forEach((item, index) => {
            const todoItem = document.createElement('div');
            todoItem.className = 'todo-item';
            todoItem.id = `todo-item-${index}`; // Dynamically set the ID
            if (item.done) {
                todoItem.classList.add('Cross');
            } else {
                todoItem.classList.remove('Cross');
            }
            const title = document.createElement('div');
            title.id = `title${index}`;
            title.className = 'title';
            title.textContent = item.title;
            const description = document.createElement('div');
            description.className = 'description';
            description.textContent = item.description;
            description.id = `description${index}`;
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = 'Edit';
            editBtn.id = `edit-btn-${index}`;
            editBtn.addEventListener('click', () => {
                editTodoItem(index);
            });
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.id = `delete-btn-${index}`;
            deleteBtn.addEventListener('click', () => {
                deleteTodoItem(index);
            });
            // const doneBtn=document.createElement('button');
            // doneBtn.classname='done-btn';
            // doneBtn.textContent='Done';
            // doneBtn.id=`done-btn-${index}`;
            // doneBtn.addEventListener('click',()=>{
            //     updateTodoDone(index);
            // });

            const doneBtn = document.createElement('input');
            doneBtn.type = 'checkbox';
            doneBtn.checked = item.done;
            doneBtn.className = "done";
            doneBtn.id = `done-btn-${index}`;
            doneBtn.addEventListener('change', () => updateTodoDone(index));
            todoItem.appendChild(title);
            todoItem.appendChild(description);
            todoItem.appendChild(editBtn);
            todoItem.appendChild(deleteBtn);
            todoItem.appendChild(doneBtn);
            if (item.done == false) {
                console.log(item.title);
                todoContainer.appendChild(todoItem);
            }
            console.log(item.title);
        });
    } catch (error) {
        console.error('Error:', error);
        // Optionally, display the error message to the user in the DOM
        const todoContainer = document.getElementById('todo-container');
        todoContainer.innerHTML = '<p>Failed to load todo items. Please try again later.</p>';
    }

};

const fetchingCompleted = async () => {
    const token = localStorage.getItem('token');
    console.log(token);

    if (!token) {
        window.location.href = 'login.html'; // Redirect to login page if token is not available
        return;
    }

    try {
        const response = await fetch('https://motivation-mate-backend-tester.vercel.app/api/todoList', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Todo List:', data);
        total = data.length;

        // Update the DOM with the todo items
        const todoContainer = document.getElementById('todo-list');
        const completedContainer = document.getElementById('completed-list');
        completedContainer.innerHTML = '';
        todoContainer.innerHTML = '';

        data.forEach((item, index) => {
            const todoItem = document.createElement('div');
            todoItem.className = 'todo-item';
            todoItem.id = `todo-item-${index}`; // Dynamically set the ID
            if (item.done) {
                todoItem.classList.add('Cross');
            } else {
                todoItem.classList.remove('Cross');
            }
            const title = document.createElement('div');
            title.id = `title${index}`;
            title.className = 'title';
            title.textContent = item.title;
            const description = document.createElement('div');
            description.className = 'description';
            description.textContent = item.description;
            description.id = `description${index}`;
            // const editBtn = document.createElement('button');
            // editBtn.className = 'edit-btn';
            // editBtn.textContent = 'Edit';
            // editBtn.id = `edit-btn-${index}`;
            // editBtn.addEventListener('click', () => {
            //     editTodoItem(index);
            // });
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.id = `delete-btn-${index}`;
            deleteBtn.addEventListener('click', () => {
                deleteTodoItem(index);
            });
            // const doneBtn=document.createElement('button');
            // doneBtn.classname='done-btn';
            // doneBtn.textContent='Done';
            // doneBtn.id=`done-btn-${index}`;
            // doneBtn.addEventListener('click',()=>{
            //     updateTodoDone(index);
            // });

            const doneBtn = document.createElement('input');
            doneBtn.type = 'checkbox';
            doneBtn.checked = item.done;
            doneBtn.className = "done";
            doneBtn.id = `done-btn-${index}`;
            doneBtn.addEventListener('change', () => updateTodoDone(index));
            todoItem.appendChild(title);
            todoItem.appendChild(description);
            // todoItem.appendChild(editBtn);
            todoItem.appendChild(deleteBtn);
            todoItem.appendChild(doneBtn);
            if (item.done == true) {
                completedContainer.appendChild(todoItem);
            }
        });
    } catch (error) {
        console.error('Error:', error);
        // Optionally, display the error message to the user in the DOM
        const todoContainer = document.getElementById('todo-container');
        todoContainer.innerHTML = '<p>Failed to load todo items. Please try again later.</p>';
    }

};

document.addEventListener('DOMContentLoaded', fetching());
//document.addEventListener('DOMContentLoaded',editing());
let addtodo = document.getElementById("addtodo");
addtodo.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    let titlebox = document.getElementById('title-input');
    let title = titlebox.value;
    let descriptionbox = document.getElementById('description-input');
    let description = descriptionbox.value;
    const requestBody = {
        title: title,
        description: description
    };
    try {
        const response = await fetch('https://motivation-mate-backend-tester.vercel.app/api/todoList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
        fetching();

        // Handle response and display todo items
    } catch (error) {
        console.error('Error:', error);
        // Handle error (e.g., display error message to user)
    }
});
// let logout=document.getElementById("logout").addEventListener('click',()=>{
//     localStorage.removeItem('token');
//     window.location.href = '../login/index.html';
// })
document.getElementById("todo-button").addEventListener('click', () => {
    console.log("todo");
    whichButtonIsClicked = 0;
    fetching();
});

document.getElementById("completed-button").addEventListener('click', () => {
    console.log("comomomo");
    whichButtonIsClicked = 0;
    fetchingCompleted();
});







