import { db } from '../lib/firebaseAdmin.js';

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ message: 'Método no permitido.' });
    }

    // --- GUARDIÁN DE SEGURIDAD ---
    const providedSecret = request.headers['x-auth-secret'];
    const serverSecret = process.env.LOGIN_PASSWORD;

    if (!serverSecret || !providedSecret || providedSecret !== serverSecret) {
        console.warn("Acceso denegado a /api/get-consentimientos.");
        return response.status(401).json({ message: 'Acceso no autorizado.' });
    }
    // --- FIN DEL GUARDIÁN ---

    try {
        const snapshot = await db.collection('consents').orderBy('fecha', 'desc').get();
        if (snapshot.empty) {
            return response.status(200).json([]);
        }
        const consentimientos = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                nombre: data.demograficos ? data.demograficos.nombre : 'Sin nombre',
                email: data.demograficos ? data.demograficos.email : 'Sin email',
                fecha: data.fecha
            };
        });
        response.status(200).json(consentimientos);
    } catch (error) {
        console.error("Error en get-consentimientos:", error);
        response.status(500).json({ message: 'Error interno del servidor.' });
    }
}
