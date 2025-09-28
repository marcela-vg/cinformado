// Listener que se ejecuta cuando el contenido del HTML está listo.
document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA PARA VISUALIZAR/OCULTAR CONTRASEÑA ---
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    const eyeSlashedIcon = document.getElementById('eye-slashed-icon');

    togglePassword.addEventListener('click', function () {
        // Cambia el tipo del input entre 'password' y 'text'
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);

        // Alterna la visibilidad de los íconos de ojo
        eyeIcon.classList.toggle('hidden');
        eyeSlashedIcon.classList.toggle('hidden');
    });

    // --- LÓGICA PARA EL ENVÍO DEL FORMULARIO DE LOGIN ---
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('errorMessage');
        
        errorMessage.classList.add('hidden');

        try {
            const response = await fetch('/api/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: passwordInput.value }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                sessionStorage.setItem('sessionToken', data.token);
                window.location.href = 'portal-consentimientos.html';
            } else {
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
});

