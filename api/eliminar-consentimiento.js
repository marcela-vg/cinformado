import { db } from '../lib/firebaseAdmin.js';

export default async function handler(request, response) {
    // Solo permitimos el método DELETE para esta operación.
    if (request.method !== 'DELETE') {
        return response.status(405).json({ message: 'Método no permitido.' });
    }

    // --- GUARDIÁN DE SEGURIDAD ---
    // Verificamos el "pase de acceso" para asegurar que solo un usuario autorizado pueda eliminar.
    const providedSecret = request.headers['x-auth-secret'];
    const serverSecret = process.env.LOGIN_PASSWORD;

    if (!providedSecret || providedSecret !== serverSecret) {
        console.warn("Acceso denegado a /api/eliminar-consentimiento.");
        return response.status(401).json({ message: 'Acceso no autorizado.' });
    }

    try {
        // Obtenemos el ID del documento que se va a eliminar desde la URL.
        const { id } = request.query;
        if (!id) {
            return response.status(400).json({ message: 'El ID del consentimiento es requerido para la eliminación.' });
        }

        // Apuntamos al documento y lo eliminamos.
        await db.collection('consents').doc(id).delete();
        
        // Enviamos una respuesta de éxito.
        response.status(200).json({ message: 'Consentimiento eliminado exitosamente.' });

    } catch (error) {
        console.error(`Error al eliminar el consentimiento ${request.query.id}:`, error);
        response.status(500).json({ message: 'Error interno del servidor.' });
    }
}
