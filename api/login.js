document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos del DOM
  const togglePassword = document.getElementById('togglePassword');
  const password = document.getElementById('password');
  const eyeIcon = document.getElementById('eye-icon');
  const eyeSlashedIcon = document.getElementById('eye-slashed-icon');

  // Evento para alternar visibilidad de la contraseña
  togglePassword.addEventListener('click', function () {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);

    // Mostrar u ocultar los iconos de ojo
    eyeIcon.classList.toggle('hidden');
    eyeSlashedIcon.classList.toggle('hidden');
  });

  // Lógica para el envío del formulario de login
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.classList.add('hidden');
    try {
      const response = await fetch('/api/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
