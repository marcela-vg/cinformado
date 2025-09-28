// Esta es una función serverless que se ejecutará en Vercel.
// Su propósito es verificar de forma segura la contraseña del terapeuta.

export default async function handler(request, response) {
    // 1. Solo permitir solicitudes de tipo POST.
    if (request.method !== 'POST') {
        return response.status(405).json({ 
            success: false, 
            message: 'Método no permitido. Utiliza POST.' 
        });
    }

    console.log('--- Inicio de Intento de Login ---'); // TESTIGO 1: Vemos si la función se activa.

    try {
        // 2. Obtener la contraseña enviada desde el cliente (login.js).
        const { password: clientPassword } = request.body;
        
        // TESTIGO 2: Vemos exactamente qué contraseña llega del navegador.
        // ¡OJO! Esto es solo para depuración. Deberías quitar esta línea en producción.
        console.log(`Contraseña recibida del cliente: "${clientPassword}"`);

        // 3. Obtener la contraseña secreta desde las variables de entorno de Vercel.
        const serverPassword = process.env.LOGIN_PASSWORD;

        // TESTIGO 3: Verificamos si la variable de entorno se cargó.
        console.log('¿Variable LOGIN_PASSWORD encontrada en Vercel?:', !!serverPassword);

        // 4. Verificación de seguridad.
        if (!serverPassword) {
            console.error('CRITICAL: La variable de entorno LOGIN_PASSWORD no está definida en Vercel.');
            return response.status(500).json({ 
                success: false, 
                message: 'Error de configuración en el servidor.' 
            });
        }
        
        // 5. Comparar la contraseña del cliente con la del servidor.
        const passwordsMatch = clientPassword === serverPassword;

        // TESTIGO 4: Vemos el resultado de la comparación.
        console.log('¿Las contraseñas coinciden?:', passwordsMatch);
        console.log('--- Fin de Intento de Login ---');

        if (passwordsMatch) {
            return response.status(200).json({ success: true });
        } else {
            return response.status(401).json({ 
                success: false, 
                message: 'Contraseña incorrecta.' 
            });
        }

    } catch (error) {
        console.error('Error en /api/authenticate:', error);
        return response.status(500).json({ 
            success: false, 
            message: 'Ha ocurrido un error inesperado en el servidor.' 
        });
    }
}

