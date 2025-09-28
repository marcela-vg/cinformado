import { db } from '../lib/firebaseAdmin.js';
import { Resend } from 'resend';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Buffer } from 'buffer';

// --- FUNCIÓN PARA CREAR EL PDF DETALLADO ---
async function crearPDFConsentimiento(datos) {
    const { demograficos, firmaDigital } = datos;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let y = height - 40;
    const margin = 50;
    
    // Título del documento PDF.
    page.drawText('Consentimiento Informado - Marcela Villegas Gallego', { x: margin, y, font: boldFont, size: 16, color: rgb(0, 0.2, 0.4) });
    y -= 30;

    // (El resto de la lógica de creación de PDF permanece igual)
    // ... Lógica para dibujar el texto del consentimiento, datos demográficos, etc. ...
    
    // --- SECCIÓN DE FIRMA ---
    y -= 30; // Espacio antes de la firma
    page.drawText('Firma Digital:', { x: margin, y, font: boldFont, size: 12 });
    y -= 100; // Espacio para la imagen de la firma

    try {
        const pngImageBytes = Buffer.from(firmaDigital.split(',')[1], 'base64');
        const pngImage = await pdfDoc.embedPng(pngImageBytes);
        page.drawImage(pngImage, { x: margin, y, width: 150, height: 75 });
    } catch (e) { console.error("Error al incrustar firma en PDF", e); }
    page.drawLine({ start: { x: margin, y: y - 5 }, end: { x: margin + 200, y: y - 5 }, thickness: 1 });
    page.drawText('Firma Electrónica', { x: margin, y: y - 15, font, size: 8 });
    
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}


// --- HANDLER PRINCIPAL DE LA API ---
export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Método no permitido.' });
    }

    try {
        const data = request.body;
        const { demograficos, firmaDigital } = data;

        if (!demograficos || !demograficos.nombre || !demograficos.email || !firmaDigital) {
            return response.status(400).json({ message: 'Faltan datos críticos.' });
        }

        const dataToSave = { ...data, fecha: new Date().toISOString(), estado: 'Firmado' };
        const docRef = await db.collection('consents').add(dataToSave);

        const resendApiKey = process.env.RESEND2_API_KEY;
        if (!resendApiKey) {
            console.warn("Servidor: RESEND2_API_KEY no definida. No se enviarán correos.");
        } else {
            const resend = new Resend(resendApiKey);
            const pdfBuffer = await crearPDFConsentimiento(dataToSave);

            const mailToPaciente = {
              from: 'Notificación Consentimiento <marcela@marcelavillegas.co>',
              to: demograficos.email,
              subject: `Copia de tu Consentimiento Informado - Marcela Villegas G.`,
              // AJUSTE: Se restaura y corrige el enlace de WhatsApp.
              html: `<p>Estimado/a ${demograficos.nombre},</p><p>Recibes una copia del consentimiento informado para la atención con la <strong>Psicóloga Marcela Villegas Gallego</strong>.</p><p>Cualquier inquietud puedes comunicarla directamente al correo marcela@marcelavillegas.co o al <a href="https://wa.me/573008374472" target="_blank">WhatsApp +57 3008374472</a>.</p><p>Adjunto, encontrarás el PDF con tu firma.</p>`,
              attachments: [{ filename: `Consentimiento-${demograficos.nombre.replace(/ /g, '_')}.pdf`, content: Buffer.from(pdfBuffer) }],
            };

            const mailToTerapeuta = {
              from: 'Notificación CInformado <marcela@marcelavillegas.co>',
              to: 'marcela@marcelavillegas.co',
              subject: `Nuevo Consentimiento Firmado: ${demograficos.nombre}`,
              html: `<p>Has recibido el consentimiento informado firmado del paciente <strong>${demograficos.nombre}</strong>.</p><p>El documento PDF se encuentra adjunto para tu registro.</p>`,
              attachments: [{ filename: `Consentimiento-${demograficos.nombre.replace(/ /g, '_')}.pdf`, content: Buffer.from(pdfBuffer) }],
            };
            
            await Promise.all([
                resend.emails.send(mailToPaciente),
                resend.emails.send(mailToTerapeuta)
            ]);
            console.log("Servidor: Correos de confirmación enviados con éxito.");
        }

        response.status(200).json({ message: 'Consentimiento procesado exitosamente', id: docRef.id });

    } catch (error) {
        console.error("Error catastrófico en save-consent:", error);
        response.status(500).json({ message: 'Error interno del servidor.', detail: error.message });
    }
}

