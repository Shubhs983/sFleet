let isLoginMode = true;
let selectedRole = 'customer';

function selectRole(role) {
    selectedRole = role;
    document.getElementById('roleCustomerBtn').classList.toggle('active', role === 'customer');
    document.getElementById('roleDriverBtn').classList.toggle('active', role === 'driver');
}

function toggleForm() {
    isLoginMode = !isLoginMode;

    document.getElementById('formTitle').textContent = isLoginMode ? 'Welcome back' : 'Create your account';
    document.getElementById('formSub').textContent = isLoginMode ? 'Sign in to continue' : 'Join SFleet in seconds';
    document.getElementById('submitBtn').textContent = isLoginMode ? 'Sign in' : 'Create account';

    document.getElementById('nameField').classList.toggle('hidden', isLoginMode);
    document.getElementById('roleField').classList.toggle('hidden', isLoginMode);

    document.getElementById('toggleText').innerHTML = isLoginMode
        ? 'New to SFleet? <a onclick="toggleForm()">Create an account</a>'
        : 'Already have an account? <a onclick="toggleForm()">Sign in</a>';

    document.getElementById('message').textContent = '';
}

async function handleSubmit() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const messageEl = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');

    messageEl.textContent = '';
    messageEl.className = '';

    if (!email || !password) {
        messageEl.textContent = 'Please fill in email and password.';
        messageEl.className = 'error';
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = isLoginMode ? 'Signing in...' : 'Creating account...';

    try {
        if (isLoginMode) {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success) {
    const payload = JSON.parse(atob(data.token.split('.')[1]));
    const actualRole = payload.role;

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', actualRole);
    messageEl.textContent = data.message;
    messageEl.className = 'success';

    setTimeout(() => {
        window.location.href = actualRole === 'driver' ? '/driver.html' : '/customer.html';
    }, 800);
}
            else {
                messageEl.textContent = data.message;
                messageEl.className = 'error';
            }
        } else {
            const name = document.getElementById('name').value.trim();
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role: selectedRole })
            });
            const data = await res.json();

            messageEl.textContent = data.message;
            messageEl.className = data.success ? 'success' : 'error';

            if (data.success) {
                setTimeout(() => toggleForm(), 1200);
            }
        }
    } catch (error) {
        messageEl.textContent = 'Something went wrong. Please try again.';
        messageEl.className = 'error';
    }

    submitBtn.disabled = false;
    submitBtn.textContent = isLoginMode ? 'Sign in' : 'Create account';
}