let total = 0;

// const editBlog = async (index, item) => {
//     const editingSection = document.getElementById("editing-section");
//     const blogContainer = document.getElementById("blog-container");
//     blogContainer.innerHTML = '';
//     editingSection.classList.remove("hidden");
//     const title = document.getElementById('editing-title');
//     title.value = item.title;
//     const quill = new Quill('#editor-container', {
//         theme: 'snow',  // Use 'bubble' for a different theme
//         placeholder: '',
//         modules: {
//             toolbar: [
//                 [{ header: [1, 2, 3, false] }],
//                 ['bold', 'italic', 'underline'],
//                 //['image', 'code-block'],
//                 //[{ list: 'ordered' }, { list: 'bullet' }],
//                 ['link']
//             ]
//         }
//     });
//     quill.root.innerHTML = item.content;

//     const submit = document.getElementById('submit');
//     submit.addEventListener('click', async() => {
//         const updatedItem = {
//             title: title.value,
//             content: quill.root.innerHTML
//         };

//         const token = localStorage.getItem('token');
//         if (!token) {
//             window.location.href = '../login/index.html'; // Redirect to login page if token is not available
//             //return;
//         }
//         try {
//             const response = await fetch(`https://motivation-mate-backend-tester.vercel.app/api/blogs/${item._id}`, { // Assuming the endpoint includes the item index
//                 method: 'PUT', // or 'PATCH' depending on your API
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify(updatedItem)
//             });
    
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
    
//             const data = await response.json();
//             console.log('Updated Blog Item:', data);
//             editingSection.classList.add("hidden");
//             document.addEventListener('DOMContentLoaded', fetching());
//             // Optionally, update the UI or notify the user of the successful update
//         } catch (error) {
//             console.error('Error:', error);
//             // Optionally, display the error message to the user
//         }
//     });
//     const cancel = document.getElementById('cancel');
//     cancel.addEventListener('click', ()=>{
//         editingSection.classList.add('hidden');
//         fetching();
//     });

// };

const editBlog = async (index, item) => {
    const editingSection = document.getElementById("editing-section");
    const blogContainer = document.getElementById("blog-container");
    blogContainer.innerHTML = '';
    editingSection.classList.remove("hidden");
    const title = document.getElementById('editing-title');
    title.value = item.title;

    // Check if a Quill instance already exists and destroy it
    if (window.quillInstance) {
        window.quillInstance.destroy();
        window.quillInstance = null;
    }

    // Create a new Quill instance and store it globally
    window.quillInstance = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: '',
        modules: {
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                ['link']
            ]
        }
    });
    window.quillInstance.root.innerHTML = item.content;

    const submit = document.getElementById('submit');
    const cancel = document.getElementById('cancel');

    // Remove existing event listeners to avoid multiple bindings
    submit.replaceWith(submit.cloneNode(true));
    cancel.replaceWith(cancel.cloneNode(true));

    document.getElementById('submit').addEventListener('click', async () => {
        const updatedItem = {
            title: title.value,
            content: window.quillInstance.root.innerHTML
        };

        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '../login/index.html';
        }

        try {
            const response = await fetch(`https://motivation-mate-backend-tester.vercel.app/api/blogs/${item._id}`, {
                method: 'PUT',
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
            console.log('Updated Blog Item:', data);
            editingSection.classList.add("hidden");
            document.addEventListener('DOMContentLoaded', fetching());
        } catch (error) {
            console.error('Error:', error);
        }
    });

    document.getElementById('cancel').addEventListener('click', () => {
        editingSection.classList.add('hidden');
        fetching();
    });
};
const deleteBlog = async (index, item) => {
    console.log('Delete');
    const blogContainer = document.getElementById('blog-container'); 
    blogContainer.classList.add('disabled');
    const deleteDialog = document.getElementById('delete-dialog');
    deleteDialog.classList.remove('hidden');
    deleteDialog.innerHTML = '';
    const message = document.createElement('h3');
    message.textContent = 'Do you want to delete this item?';
    const okbutton = document.createElement('button');
    okbutton.textContent = 'Delete';
    okbutton.classList.add('btn-delete');
    const cancelbutton = document.createElement('button');
    cancelbutton.textContent = 'Cancel';
    cancelbutton.classList.add('btn-cancel');
    okbutton.addEventListener('click', async() => {
        const token = localStorage.getItem('token');
    if(!token){
        window.location.href = '../login/index.html';
    }
    try {
        const response = await fetch(`https://motivation-mate-backend-tester.vercel.app/api/blogs/${item._id}`, { // Assuming the endpoint includes the item index
            method: 'DELETE', // or 'PATCH' depending on your API
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            //body: JSON.stringify(updatedItem)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        //const data = await response.json();
        console.log('Deleted Blog Item:');
        deleteDialog.classList.add("hidden");
        blogContainer.classList.remove('disabled');
        //editingSection.classList.add("hidden");
        document.addEventListener('DOMContentLoaded', fetching());
        // Optionally, update the UI or notify the user of the successful update
    } catch (error) {
        console.error('Error:', error);
        deleteDialog.classList.add("hidden");
        blogContainer.classList.remove('disabled');
        // Optionally, display the error message to the user
    }
    });
    cancelbutton.addEventListener('click', ()=>{
        deleteDialog.classList.add("hidden");
        blogContainer.classList.remove('disabled');
    });
    deleteDialog.appendChild(message);
    deleteDialog.appendChild(okbutton);
    deleteDialog.appendChild(cancelbutton);
};

const fetching = async () => {
    const token = localStorage.getItem('token');
    console.log(token);

    if (!token) {
        window.location.href = 'login.html'; // Redirect to login page if token is not available
        return;
    }

    try {
        const response = await fetch('https://motivation-mate-backend-tester.vercel.app/api/blogs', {
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
        console.log('Blog List:', data);
        total = data.length;

        // Update the DOM with the todo items
        const blogContainer = document.getElementById('blog-container');
        blogContainer.innerHTML = '';

        data.forEach((item, index) => {
            const blogItem = document.createElement('div');
            blogItem.className = 'blog-post';
            blogItem.id = `blog-post-${index}`; // Dynamically set the ID

            const title = document.createElement('h2');
            //title.id = `title${index}`;
            //title.className = 'title';
            title.textContent = item.title;
            const content = document.createElement('div');
            content.className = 'blog-description';
            content.innerHTML = item.content;
            content.id = `description${index}`;
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = 'Edit';
            editBtn.id = `edit-btn-${index}`;
            editBtn.addEventListener('click', () => {
                editBlog(index, item);
            });
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.id = `delete-btn-${index}`;
            deleteBtn.addEventListener('click', () => {
                deleteBlog(index, item);
            });
            blogItem.appendChild(title);
            blogItem.appendChild(content);
            blogContainer.appendChild(blogItem);
            const blogActions = document.createElement('div');
            blogActions.className = 'blog-actions';
            blogActions.appendChild(editBtn);
            blogActions.appendChild(deleteBtn);
            blogContainer.appendChild(blogActions);
            // const doneBtn=document.createElement('button');
            // doneBtn.classname='done-btn';
            // doneBtn.textContent='Done';
            // doneBtn.id=`done-btn-${index}`;
            // doneBtn.addEventListener('click',()=>{
            //     updateTodoDone(index);
            // });

            // const doneBtn = document.createElement('input');
            // doneBtn.type = 'checkbox';
            // doneBtn.checked = item.done;
            // doneBtn.className = "done";
            // doneBtn.id = `done-btn-${index}`;
            // doneBtn.addEventListener('change', () => updateTodoDone(index));
            // todoItem.appendChild(title);
            // todoItem.appendChild(description);
            // todoItem.appendChild(editBtn);
            // todoItem.appendChild(deleteBtn);
            // todoItem.appendChild(doneBtn);
            // if (item.done == false) {
            //     console.log(item.title);
            //     todoContainer.appendChild(todoItem);
            // }
            console.log(item.title);
        });
    } catch (error) {
        console.error('Error:', error);
        // Optionally, display the error message to the user in the DOM
        const todoContainer = document.getElementById('todo-container');
        todoContainer.innerHTML = '<p>Failed to load todo items. Please try again later.</p>';
    }

};

document.addEventListener('DOMContentLoaded', fetching());