// Se espera a que todo el contenido del DOM (la página HTML) esté completamente cargado y listo.
document.addEventListener('DOMContentLoaded', () => {
    
    // --- SECCIÓN 1: LÓGICA PARA VISUALIZAR/OCULTAR CONTRASEÑA ---

    // Obtenemos las referencias a los elementos HTML que necesitamos.
    const togglePasswordButton = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    const eyeSlashedIcon = document.getElementById('eye-slashed-icon');

    // Verificamos que todos los elementos existan para evitar errores.
    if (togglePasswordButton && passwordInput && eyeIcon && eyeSlashedIcon) {
        // Añadimos un "escuchador de eventos" que se activa cuando el usuario hace clic en el botón.
        togglePasswordButton.addEventListener('click', function () {
            // 1. Verificamos el tipo actual del campo de contraseña.
            const isPassword = passwordInput.getAttribute('type') === 'password';
            
            // 2. Cambiamos el tipo: si es 'password', lo cambiamos a 'text', y viceversa.
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

            // 3. Alternamos la clase 'hidden' de TailwindCSS en los íconos para mostrar el correcto.
            eyeIcon.classList.toggle('hidden', isPassword);
            eyeSlashedIcon.classList.toggle('hidden', !isPassword);
        });
    }

    // --- SECCIÓN 2: LÓGICA PARA EL ENVÍO DEL FORMULARIO DE LOGIN ---

    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // Añadimos un "escuchador" para el evento 'submit' del formulario.
        loginForm.addEventListener('submit', async (event) => {
            // Prevenimos el comportamiento por defecto del formulario (que es recargar la página).
            event.preventDefault();
            
            const passwordValue = document.getElementById('password').value;
            const errorMessageDiv = document.getElementById('errorMessage');
            
            // Ocultamos cualquier mensaje de error previo.
            errorMessageDiv.classList.add('hidden');
            errorMessageDiv.textContent = ''; // Limpiamos el texto del error.

            // Hacemos una llamada a la API de autenticación en el servidor.
            try {
                const response = await fetch('/api/authenticate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password: passwordValue }),
                });

                const data = await response.json();

                // Si la respuesta del servidor es exitosa (código 200-299) y contiene success: true...
                if (response.ok && data.success) {
                    // Guardamos un indicador en la sesión del navegador para mantener al usuario logueado.
                    sessionStorage.setItem('consultorAuth', 'true');
                    // Redirigimos al usuario al portal de consentimientos.
                    window.location.href = 'portal-consentimientos.html';
                } else {
                    // Si hay un error, lo mostramos en la página.
                    errorMessageDiv.textContent = data.message || 'Contraseña incorrecta.';
                    errorMessageDiv.classList.remove('hidden');
                    document.getElementById('password').value = ''; // Limpiamos el campo
                    document.getElementById('password').focus(); // Ponemos el foco de nuevo en el campo
                }
            } catch (error) {
                // Si hay un error de red (ej. no se puede conectar al servidor).
                console.error('Error al intentar iniciar sesión:', error);
                errorMessageDiv.textContent = 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
                errorMessageDiv.classList.remove('hidden');
            }
        });
    }
});
