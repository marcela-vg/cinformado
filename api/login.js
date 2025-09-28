document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.classList.add('hidden');

    try {
        // Hacemos una petición a nuestra nueva API de autenticación.
        const response = await fetch('/api/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: passwordInput.value }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Si la autenticación fue exitosa y recibimos un token...
            // Guardamos el TOKEN en sessionStorage, no un simple 'true'.
            sessionStorage.setItem('sessionToken', data.token);
            window.location.href = 'portal-consentimientos.html';
        } else {
            // Si el servidor nos dice que la contraseña es incorrecta...
            errorMessage.textContent = data.message || 'Contraseña incorrecta.';
            errorMessage.classList.remove('hidden');
            passwordInput.value = '';
            passwordInput.focus();
        }
    } catch (error) {
        console.error('Error al intentar iniciar sesión:', error);
        errorMessage.textContent = 'No se pudo conectar con el servidor. Intenta de nuevo.';
        errorMessage.classList.remove('hidden');
    }
});
