// Esta es nuestra nueva función de servidor (el "portero").
// Su única misión es verificar la contraseña y devolver un token.

export default async function handler(request, response) {
    // Solo aceptamos peticiones POST.
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Método no permitido.' });
    }

    try {
        const { password } = request.body;

        // Obtenemos la contraseña real desde las variables de entorno de Vercel.
        // NUNCA se escribe la contraseña directamente en el código.
        const serverPassword = process.env.LOGIN_PASSWORD;

        if (!serverPassword) {
            console.error("CRITICAL: La variable de entorno LOGIN_PASSWORD no está definida en Vercel.");
            return response.status(500).json({ success: false, message: 'Error de configuración del servidor.' });
        }

        // Comparamos la contraseña enviada por el usuario con la del servidor.
        if (password === serverPassword) {
            // Si la contraseña es correcta, creamos un token simple y seguro.
            // En una app más compleja, aquí se usaría una librería como JWT (JSON Web Tokens).
            // Para nuestro caso, un token basado en tiempo es suficiente.
            const token = Buffer.from(`auth_token:${Date.now()}`).toString('base64');
            
            // Enviamos el token de vuelta al cliente.
            response.status(200).json({ success: true, token: token });
        } else {
            // Si la contraseña es incorrecta, devolvemos un error de no autorizado.
            response.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }

    } catch (error) {
        console.error("Error en la función de autenticación:", error);
        response.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
}
