const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '../login/index.html'; // Redirect to login page if token is not available
    
}

// Initialize Quill editor
const quill = new Quill('#editorContainer', {
    theme: 'snow',  // Use 'bubble' for a different theme
    placeholder: 'Compose an epic...',
    modules: {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            //['image', 'code-block'],
            // [{ list: 'bullet' }],
            ['link']
        ]
    }
});

// function addLiteralSpacesToLists(content) {
//     // Create a temporary container to parse the HTML content
//     const tempDiv = document.createElement('div');
//     tempDiv.innerHTML = content;

//     // Process <ul> and <ol> elements to add extra spaces
//     const lists = tempDiv.querySelectorAll('ul, ol');
//     lists.forEach(list => {
//         list.querySelectorAll('li').forEach(item => {
//             // Create a temporary container for the list item
//             const tempItemDiv = document.createElement('div');
//             tempItemDiv.innerHTML = item.innerHTML;

//             // Add extra spaces before the list item content
//             const extraSpaces = '&nbsp;&nbsp;&nbsp;&nbsp;'; // Adjust number of spaces as needed
//             item.innerHTML = extraSpaces + tempItemDiv.innerHTML;
//         });
//     });

//     // Return the modified HTML
//     return tempDiv.innerHTML;
// }

//const upload = async ()
// Add event listener to the button to get the content of the editor
document.getElementById('get-content').addEventListener('click', async () => {
    let titlebox = document.getElementById('title-input');
    let title = titlebox.value;
    //let unstructuredContent = quill.root.innerHTML;
    let content = quill.root.innerHTML;
    const requestBody = {
        title: title,
        content: content
    };
    try {
        const response = await fetch('https://motivation-mate-backend-tester.vercel.app/api/blogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
        //fetching();
        titlebox.value = '';
        quill.root.innerHTML = '';
        // Handle response and display todo items
    } catch (error) {
        console.error('Error:', error);
        // Handle error (e.g., display error message to user)
    }
});
