//line 7, line 107

const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '../login/login.html';
}
// CHACCHU 
// This is the function which gets called when you click on a certain user from the drop down box and then the blogs of the respective user is shown
// the username and userid is passed from it's parent function named populate dropdown. No change is perhaps needed in that function

//Logout Function

let logout = document.getElementById('logout');
logout.addEventListener('click', ()=>{
    const blogContainer = document.getElementById('blog-container'); 
    blogContainer.classList.add('disabled');
    const deleteDialog = document.getElementById('delete-dialog');
    deleteDialog.classList.remove('hidden');
    deleteDialog.innerHTML = '';
    const message = document.createElement('h3');
    message.textContent = 'Do you want to logout?';
    const okbutton = document.createElement('button');
    okbutton.textContent = 'Log Out';
    okbutton.classList.add('btn-delete');
    const cancelbutton = document.createElement('button');
    cancelbutton.textContent = 'Cancel';
    cancelbutton.classList.add('btn-cancel');
    okbutton.addEventListener('click', ()=>{
        localStorage.clear();
        window.location.href='../homepage.html'
    });
    cancelbutton.addEventListener('click', ()=>{
        deleteDialog.classList.add("hidden");
        blogContainer.classList.remove('disabled');
    });
    deleteDialog.appendChild(message);
    deleteDialog.appendChild(okbutton);
    deleteDialog.appendChild(cancelbutton);
});

const showUserBlogs = async (userid, username) => {
    const postContainer = document.getElementById('post-container');
    postContainer.innerHTML = '';
    
    try {
        const response = await fetch(`https://motivation-mate-backend-tester.vercel.app/api/showblogs/${userid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();

        data.forEach((item) => {
            const singlePost = document.createElement('div');
            singlePost.classList.add('post');

            const contentDiv = document.createElement('div');
            contentDiv.classList.add('content');

            const userDiv = document.createElement('div');
            userDiv.classList.add('user');

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('info');

            const usernameSpan = document.createElement('span');
            usernameSpan.id = 'username';
            usernameSpan.textContent = username;
            infoDiv.appendChild(usernameSpan);

            const postDate = document.createElement('p');
            postDate.id = 'postDate';
            postDate.textContent = `Posted at ${new Date(item.createdAt).toLocaleString()}`;
            infoDiv.appendChild(postDate);

            userDiv.appendChild(infoDiv);
            contentDiv.appendChild(userDiv);

            const title = document.createElement('h1');
            title.textContent = item.title;
            contentDiv.appendChild(title);

            const content = document.createElement('p');
            content.textContent = sanitizeContent(truncateContent(item.content));
            contentDiv.appendChild(content);

            singlePost.appendChild(contentDiv);
            postContainer.appendChild(singlePost);
        });

        dropdownContainer.classList.add('hidden');
    } catch (error) {
        console.error(error);
    }
};

function truncateContent(content, wordLimit = 70) {
    const words = content.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : content;
}

function sanitizeContent(content) {
    // This function removes all HTML tags from the content.
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.textContent || div.innerText || "";
}

const dropdownContainer = document.getElementById('dropdown-container');

function populateDropdown(dataArray) {
    // Clear existing items
    dropdownContainer.innerHTML = '';

    // Create a close icon
    const closeIcon = document.createElement('span');
    closeIcon.innerHTML = '&times;'; // HTML code for "×" symbol
    closeIcon.className = 'close-icon';
    closeIcon.style.cursor = 'pointer';
    closeIcon.style.fontSize = '24px';
    closeIcon.style.position = 'absolute';
    closeIcon.style.right = '10px';
    closeIcon.style.top = '0px';
    closeIcon.style.zIndex = '1000';
    
    // Add event listener to close the dropdown on click
    closeIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        dropdownContainer.classList.add('hidden'); // Directly manipulate the style
    });
    

    // Append the close icon to the dropdown container
    dropdownContainer.appendChild(closeIcon);

    // Populate the dropdown with items
    dataArray.forEach(profile => {
        const dropdownItem = document.createElement('div');
        dropdownItem.className = 'dropdown-item';
        dropdownItem.textContent = profile.username;

        dropdownItem.addEventListener('click', async () => {
            showUserBlogs(profile.id, profile.username);
        
            dropdownContainer.classList.add('hidden');// Hide dropdown after selecting an item
        });

        dropdownContainer.appendChild(dropdownItem);
    });

    dropdownContainer.classList.remove('hidden'); // Show the dropdown
}



document.querySelector('.search-bar').addEventListener('submit', async () => {
    event.preventDefault(); // Prevent the form from submitting

    // Get the selected radio button value
    const selectedFilter = document.querySelector('input[name="filter"]:checked').value;

    console.log(`Selected filter: ${selectedFilter}`);
    const value = document.getElementById('q').value;

    // You can now use `selectedFilter` to determine whether the search is for "username" or "title"
    if (selectedFilter === 'username') {
        console.log('Searching by username...');
        // Search by username
        try {
            const response = await fetch(`https://motivation-mate-backend-tester.vercel.app/api/search?username=${encodeURIComponent(value)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        //'Authorization': `Bearer ${token}`
                    }
                }
            )
            const data = await response.json();
            console.log(data);
            if (data.length) {
                populateDropdown(data);
            } else {
                dropdownContainer.classList.add('hidden'); // Hide dropdown if no results
            }
        } catch (error) {
            console.log(error);
        }


    } 
    // CHACCHU
    // This is when you call the search function by the title of the blogs
    else if (selectedFilter === 'title') {
        console.log('Searching by blog title...');
        try {
            const response = await fetch(`https://motivation-mate-backend-tester.vercel.app/api/search/blogs?title=${encodeURIComponent(value)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            const postContainer = document.getElementById('post-container');
            postContainer.innerHTML = '';
    
            data.forEach(async (item) => {
                const singlePost = document.createElement('div');
                singlePost.classList.add('post');
    
                const contentDiv = document.createElement('div');
                contentDiv.classList.add('content');
    
                const userDiv = document.createElement('div');
                userDiv.classList.add('user');
    
                const infoDiv = document.createElement('div');
                infoDiv.classList.add('info');
    
                try {
                    const userResponse = await fetch(`https://motivation-mate-backend-tester.vercel.app/api/search/userbyid/${item.user_id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    const userDetails = await userResponse.json();
                    const username = document.createElement('span');
                    username.id = 'username';
                    username.textContent = userDetails.username;
                    infoDiv.appendChild(username);
                } catch (error) {
                    console.error(error);
                    const username = document.createElement('span');
                    username.id = 'username';
                    username.textContent = 'Anonymous';
                    infoDiv.appendChild(username);
                }
    
                const postDate = document.createElement('p');
                postDate.id = 'postDate';
                postDate.textContent = `Posted at ${new Date(item.createdAt).toLocaleString()}`;
                infoDiv.appendChild(postDate);
    
                userDiv.appendChild(infoDiv);
                contentDiv.appendChild(userDiv);
    
                const title = document.createElement('h1');
                title.textContent = item.title;
                contentDiv.appendChild(title);
    
                const content = document.createElement('p');
                content.textContent = sanitizeContent(truncateContent(item.content));
                contentDiv.appendChild(content);
    
                singlePost.appendChild(contentDiv);
                postContainer.appendChild(singlePost);
                dropdownContainer.classList.add('hidden');
            });
        } catch (error) {
            console.error(error);
        }
    }
    function truncateContent(content, wordLimit = 70) {
        const words = content.split(' ');
        return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : content;
    }
    
    function sanitizeContent(content) {
        // This function removes all HTML tags from the content.
        const div = document.createElement('div');
        div.innerHTML = content;
        return div.textContent || div.innerText || "";
    }
    
});

const fetching = async (req, res) => {
    try {
        const response = await fetch(`https://motivation-mate-backend-tester.vercel.app/api/timeline`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        const postContainer = document.getElementById('post-container');
        postContainer.innerHTML = '';

        data.forEach(async (item) => {
            const singlePost = document.createElement('div');
            singlePost.classList.add('post');

            const contentDiv = document.createElement('div');
            contentDiv.classList.add('content');

            const userDiv = document.createElement('div');
            userDiv.classList.add('user');

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('info');

            try {
                const userResponse = await fetch(`https://motivation-mate-backend-tester.vercel.app/api/search/userbyid/${item.user_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const userDetails = await userResponse.json();
                const username = document.createElement('span');
                username.id = 'username';
                username.textContent = userDetails.username;
                infoDiv.appendChild(username);
            } catch (error) {
                console.error(error);
                const username = document.createElement('span');
                username.id = 'username';
                username.textContent = 'Anonymous';
                infoDiv.appendChild(username);
            }

            const postDate = document.createElement('p');
            postDate.id = 'postDate';
            postDate.textContent = `Posted at ${new Date(item.createdAt).toLocaleString()}`;
            infoDiv.appendChild(postDate);

            userDiv.appendChild(infoDiv);
            contentDiv.appendChild(userDiv);

            const title = document.createElement('h1');
            title.textContent = item.title;
            contentDiv.appendChild(title);

            const content = document.createElement('p');
            content.textContent = sanitizeContent(truncateContent(item.content));
            contentDiv.appendChild(content);

            singlePost.appendChild(contentDiv);
            postContainer.appendChild(singlePost);
        });
    } catch (error) {
        console.error(error);
    }
};

function truncateContent(content, wordLimit = 70) {
    const words = content.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : content;
}

function sanitizeContent(content) {
    // This function removes all HTML tags from the content.
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.textContent || div.innerText || "";
}




document.addEventListener('DOMContentLoaded', fetching());
