import { db } from '../lib/firebaseAdmin.js';
import { verifyAuth } from '../lib/verifyAuth.js'; // Importamos nuestro manual de seguridad.

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ message: 'Método no permitido.' });
    }

    // --- INICIO DEL BLINDAJE DE SEGURIDAD ---
    // 1. Llamamos a nuestro guardia para que verifique el token.
    const authResult = verifyAuth(request);

    // 2. Si el guardia nos dice que no está autenticado, denegamos el acceso inmediatamente.
    if (!authResult.authenticated) {
        return response.status(401).json({ message: 'Acceso no autorizado.', error: authResult.error });
    }
    // --- FIN DEL BLINDAJE DE SEGURIDAD ---

    // Si llegamos a este punto, significa que el token es válido y podemos proceder.
    try {
        const snapshot = await db.collection('consents').orderBy('fecha', 'desc').get();
        
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
        
        response.status(200).json(consentimientos);

    } catch (error) {
        console.error("Error al obtener los consentimientos:", error);
        response.status(500).json({ message: 'Error interno del servidor al obtener los documentos.' });
    }
}
