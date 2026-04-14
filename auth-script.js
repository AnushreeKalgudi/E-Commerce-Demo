function toggleForm(type) {
    document.getElementById('login-form').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = type === 'register' ? 'block' : 'none';
}

async function handleAuth(type) {
    const msg = document.getElementById('auth-msg');
    let url = type === 'login' ? 'http://localhost:5000/login' : 'http://localhost:5000/register';
    
    let payload = {};
    if (type === 'login') {
        payload = {
            email: document.getElementById('auth-email').value,
            password: document.getElementById('auth-password').value
        };
    } else {
        payload = {
            name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value
        };
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success || data.userId) {
            msg.style.color = "green";
            msg.innerText = type === 'login' ? "Success! Redirecting..." : "Account Created! Please Login.";
            
            if (type === 'login') {
                // Save the name to local storage so the home page can see it
                localStorage.setItem('userName', data.user.name);
                setTimeout(() => { window.location.href = 'index.html'; }, 1000);
            } else {
                setTimeout(() => { toggleForm('login'); }, 1500);
            }
        } else {
            msg.style.color = "red";
            msg.innerText = data.message || "Error occurred";
        }
    } catch (err) {
        msg.innerText = "Connection failed!";
    }
}