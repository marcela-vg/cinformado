import { db } from '../lib/firebaseAdmin.js';

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ message: 'Método no permitido.' });
    }

    // --- GUARDIÁN DE SEGURIDAD MEJORADO ---
    const providedSecret = request.headers['x-auth-secret'];
    const serverSecret = process.env.LOGIN_PASSWORD;

    if (!providedSecret) {
        console.warn("Acceso denegado: La solicitud no incluyó el encabezado 'X-Auth-Secret'.");
        return response.status(401).json({ message: 'Acceso no autorizado.' });
    }
    
    if (providedSecret !== serverSecret) {
        console.warn("Acceso denegado: El 'X-Auth-Secret' proporcionado es incorrecto.");
        return response.status(401).json({ message: 'Acceso no autorizado.' });
    }

    try {
        const snapshot = await db.collection('consents').get();
        
        if (snapshot.empty) {
            return response.status(200).json([]);
        }
        
        const consentimientos = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                nombre: data.demograficos.nombre,
                email: data.demograficos.email,
                fecha: data.fecha
            };
        });
        
        // Ordenamos los resultados por fecha (del más reciente al más antiguo) aquí en el servidor.
        consentimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        response.status(200).json(consentimientos);

    } catch (error) {
        console.error("Error al obtener los consentimientos:", error);
        response.status(500).json({ message: 'Error interno del servidor al obtener los documentos.' });
    }
}

