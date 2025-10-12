// Este archivo es nuestro "manual de seguridad".
// Define una función reutilizable que actúa como un guardia,
// verificando el token de sesión en cada petición protegida.

// El token será válido por 8 horas (en milisegundos).
const TOKEN_VALIDITY_MS = 8 * 60 * 60 * 1000;

function verifyAuth(request) {
    try {
        // 1. Buscamos el token en las cabeceras de la petición.
        // El cliente (portal-consentimientos.js) deberá enviarlo.
        const authHeader = request.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.warn("Acceso denegado: No se encontró el encabezado de autorización.");
            return { authenticated: false, error: 'Token no proporcionado.' };
        }

        const token = authHeader.split(' ')[1];

        // 2. Decodificamos el token para leer la marca de tiempo.
        const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
        if (!decodedToken.startsWith('auth_token:')) {
            console.warn("Acceso denegado: El token está malformado.");
            return { authenticated: false, error: 'Token inválido.' };
        }

        const timestamp = parseInt(decodedToken.split(':')[1], 10);

        // 3. Verificamos que el token no haya expirado.
        if (Date.now() - timestamp > TOKEN_VALIDITY_MS) {
            console.warn("Acceso denegado: El token ha expirado.");
            return { authenticated: false, error: 'La sesión ha expirado.' };
        }

        // 4. Si todas las verificaciones pasan, el usuario está autenticado.
        return { authenticated: true };

    } catch (error) {
        console.error("Error durante la verificación del token:", error);
        return { authenticated: false, error: 'Error en la validación del token.' };
    }
}

export { verifyAuth };
