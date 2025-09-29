import { db } from '../lib/firebaseAdmin.js';

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ message: 'Método no permitido.' });
    }

    // --- AÑADIMOS EL MISMO GUARDIÁN DE SEGURIDAD ---
    const providedSecret = request.headers['x-auth-secret'];
    const serverSecret = process.env.LOGIN_PASSWORD;

    if (!providedSecret || providedSecret !== serverSecret) {
        console.warn("Acceso denegado a /api/get-consentimiento-individual.");
        return response.status(401).json({ message: 'Acceso no autorizado.' });
    }

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
