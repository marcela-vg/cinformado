import { db } from '../lib/firebaseAdmin.js';

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ message: 'Método no permitido.' });
    }

    // --- GUARDIÁN DE SEGURIDAD ---
    const providedSecret = request.headers['x-auth-secret'];
    const serverSecret = process.env.LOGIN_PASSWORD;

    if (!serverSecret || !providedSecret || providedSecret !== serverSecret) {
        console.warn("Acceso denegado a /api/get-consentimiento-individual.");
        return response.status(401).json({ message: 'Acceso no autorizado.' });
    }
    // --- FIN DEL GUARDIÁN ---

    try {
        const { id } = request.query;
        if (!id) {
            return response.status(400).json({ message: 'El ID es requerido.' });
        }
        const docRef = db.collection('consents').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return response.status(404).json({ message: 'Consentimiento no encontrado.' });
        }
        response.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error(`Error en get-consentimiento-individual:`, error);
        response.status(500).json({ message: 'Error interno del servidor.' });
    }
}
