// Se espera a que todo el contenido del DOM (la página HTML) esté completamente cargado y listo.
document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA PARA VISUALIZAR/OCULTAR CONTRASEÑA ---
    const togglePasswordButton = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    const eyeSlashedIcon = document.getElementById('eye-slashed-icon');

    if (togglePasswordButton && passwordInput && eyeIcon && eyeSlashedIcon) {
        togglePasswordButton.addEventListener('click', function () {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            eyeIcon.classList.toggle('hidden', isPassword);
            eyeSlashedIcon.classList.toggle('hidden', !isPassword);
        });
    }

    // --- LÓGICA PARA EL ENVÍO DEL FORMULARIO DE LOGIN ---
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const passwordValue = document.getElementById('password').value;
            const errorMessageDiv = document.getElementById('errorMessage');
            
            errorMessageDiv.classList.add('hidden');

            try {
                const response = await fetch('/api/authenticate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: passwordValue }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // --- CORRECCIÓN DE SEGURIDAD ---
                    // Guardamos tanto la confirmación de acceso como la contraseña (nuestro "pase")
                    sessionStorage.setItem('consultorAuth', 'true'); 
                    sessionStorage.setItem('apiSecret', passwordValue); // Este es el "pase de acceso"
                    
                    window.location.href = 'portal-consentimientos.html';
                } else {
                    errorMessageDiv.textContent = data.message || 'Contraseña incorrecta.';
                    errorMessageDiv.classList.remove('hidden');
                    document.getElementById('password').value = '';
                    document.getElementById('password').focus();
                }
            } catch (error) {
                errorMessageDiv.textContent = 'Error de conexión con el servidor.';
                errorMessageDiv.classList.remove('hidden');
            }
        });
    }
});


