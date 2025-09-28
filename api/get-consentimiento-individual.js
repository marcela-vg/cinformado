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

    // Si llegamos a este punto, significa que el token es válido.
    try {
        const { id } = request.query;
        if (!id) {
            return response.status(400).json({ message: 'El ID del consentimiento es requerido.' });
        }

        const docRef = db.collection('consents').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return response.status(404).json({ message: 'Consentimiento no encontrado.' });
        }
        
        const responseData = {
            id: doc.id,
            ...doc.data()
        };
        response.status(200).json(responseData);

    } catch (error) {
        console.error(`Error al obtener el consentimiento individual ${request.query.id}:`, error);
        response.status(500).json({ message: 'Error interno del servidor.' });
    }
}
