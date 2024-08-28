document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const requestBody = {
            email: email,
            password: password
        };

        try {
            const response = await fetch('https://motivation-mate-backend-tester.vercel.app/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.accessToken); // Store the token
                setTimeout(() => {
                    // Redirect to the homepage
                    window.location.href = '../Blog/blogs.html';
                }, 100);  // Redirect to the homepage
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });
});
