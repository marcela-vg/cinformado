// Se espera a que todo el contenido del DOM (la página HTML) esté completamente cargado y listo.
document.addEventListener('DOMContentLoaded', () => {
    console.log('Cliente: DOM completamente cargado. Ejecutando login.js...');

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
    
    // TESTIGO CLAVE: ¿El script encuentra el formulario en la página?
    console.log('Cliente: Buscando el formulario. ¿Elemento encontrado?:', loginForm); 

    if (loginForm) {
        console.log('Cliente: Formulario encontrado. Adjuntando listener de "submit".');
        
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Cliente: Formulario enviado. Intentando llamar a /api/authenticate...'); 

            const passwordValue = document.getElementById('password').value;
            const errorMessageDiv = document.getElementById('errorMessage');
            
            errorMessageDiv.classList.add('hidden');
            errorMessageDiv.textContent = '';

            try {
                const response = await fetch('/api/authenticate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: passwordValue }),
                });

                console.log('Cliente: Respuesta recibida del servidor. Estado:', response.status);

                const data = await response.json();

                if (response.ok && data.success) {
                    console.log('Cliente: Autenticación exitosa. Redirigiendo...');
                    sessionStorage.setItem('consultorAuth', 'true'); 
                    window.location.href = 'portal-consentimientos.html';
                } else {
                    console.warn('Cliente: Falla en la autenticación.', data);
                    errorMessageDiv.textContent = data.message || 'Contraseña incorrecta.';
                    errorMessageDiv.classList.remove('hidden');
                    document.getElementById('password').value = '';
                    document.getElementById('password').focus();
                }
            } catch (error) {
                console.error('Cliente: Error CATASTRÓFICO al intentar llamar a la API.', error);
                errorMessageDiv.textContent = 'Error de conexión. Revisa la consola (F12) para más detalles.';
                errorMessageDiv.classList.remove('hidden');
            }
        });
    } else {
        // Si este mensaje aparece, el problema es que el ID del formulario en el HTML no coincide.
        console.error('Cliente: CRÍTICO - No se pudo encontrar el elemento del formulario con id="loginForm".');
    }
});
