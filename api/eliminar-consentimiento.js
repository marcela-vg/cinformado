import { db } from '../lib/firebaseAdmin.js';
import { verifyAuth } from '../lib/verifyAuth.js'; // Importamos nuestro manual de seguridad.

export default async function handler(request, response) {
    if (request.method !== 'DELETE') {
        return response.status(405).json({ message: 'Método no permitido.' });
    }

    // --- INICIO DEL BLINDAJE DE SEGURIDAD ---
    // 1. Llamamos a nuestro guardia para que verifique el token.
    const authResult = verifyAuth(request);

    // 2. Si no está autenticado, denegamos la acción de eliminar inmediatamente.
    if (!authResult.authenticated) {
        return response.status(401).json({ message: 'Acceso no autorizado.', error: authResult.error });
    }
    // --- FIN DEL BLINDAJE DE SEGURIDAD ---

    // Si la autenticación es exitosa, procedemos.
    try {
        const { id } = request.query;
        if (!id) {
            return response.status(400).json({ message: 'El ID del consentimiento es requerido.' });
        }

        // Apuntar al documento específico y eliminarlo.
        await db.collection('consents').doc(id).delete();

        console.log(`Servidor: Consentimiento con ID: ${id} eliminado exitosamente por un usuario autenticado.`);
        
        response.status(200).json({ message: 'Consentimiento eliminado exitosamente.' });

    } catch (error) {
        console.error(`Error al eliminar el consentimiento ${request.query.id}:`, error);
        response.status(500).json({ message: 'Error interno del servidor al eliminar el documento.' });
    }
}
