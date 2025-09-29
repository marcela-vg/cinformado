// Esta es la función del servidor que actúa como "guardián".
// Su única misión es verificar si la contraseña que le envían es correcta.

export default async function handler(request, response) {
    // Solo permitimos que nos contacten con el método POST.
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Método no permitido.' });
    }

    try {
        const { password } = request.body;

        // Leemos la contraseña secreta desde las variables de entorno de Vercel.
        const serverPassword = process.env.LOGIN_PASSWORD;

        // Medida de seguridad: si la variable no está configurada, fallamos de forma segura.
        if (!serverPassword) {
            console.error("CRITICAL: La variable de entorno LOGIN_PASSWORD no está definida en Vercel.");
            return response.status(500).json({ success: false, message: 'Error de configuración del servidor.' });
        }

        // Comparamos la contraseña enviada por el usuario con la del servidor.
        if (password === serverPassword) {
            // Si coinciden, enviamos una respuesta de éxito.
            response.status(200).json({ success: true });
        } else {
            // Si no coinciden, enviamos un error de "no autorizado".
            response.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
        }

    } catch (error) {
        console.error("Error en la función de autenticación:", error);
        response.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
}



