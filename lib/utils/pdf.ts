import { PDFDocument } from 'pdf-lib';

/**
 * Utilitaires pour manipuler les PDFs
 */

/**
 * Télécharge un PDF depuis une URL et le convertit en Buffer
 */
export async function downloadPdf(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Convertit un PDF en images base64 (une par page)
 * NOTE: GPT-4 Vision ne peut PAS lire directement les PDFs !
 * Cette fonction retourne le PDF complet en base64 pour chaque page
 * car nous ne pouvons pas faire de vraie conversion sans dépendances système
 */
export async function convertPdfToImages(pdfBuffer: Buffer): Promise<string[]> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();

    console.log(`[PDF] Converting ${pageCount} pages to base64`);

    // Extraire chaque page individuellement
    const images: string[] = [];

    for (let i = 0; i < pageCount; i++) {
      try {
        // Créer un nouveau document avec une seule page
        const singlePageDoc = await PDFDocument.create();
        const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i]);
        singlePageDoc.addPage(copiedPage);

        // Convertir en bytes puis en base64
        const singlePageBytes = await singlePageDoc.save();
        const singlePageBase64 =
          Buffer.from(singlePageBytes).toString('base64');

        images.push(`data:application/pdf;base64,${singlePageBase64}`);

        console.log(`[PDF] Converted page ${i + 1}/${pageCount}`);
      } catch (pageError) {
        console.error(`[PDF] Failed to extract page ${i + 1}:`, pageError);
        // Continuer avec les autres pages
      }
    }

    if (images.length === 0) {
      throw new Error('No pages could be extracted from PDF');
    }

    console.log(`[PDF] Successfully converted ${images.length} pages`);
    return images;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw new Error(
      `Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Obtient le nombre de pages d'un PDF
 */
export async function getPdfPageCount(pdfBuffer: Buffer): Promise<number> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  return pdfDoc.getPageCount();
}

/**
 * Valide qu'un fichier est bien un PDF
 */
export function isPdfFile(filename: string): boolean {
  return filename.toLowerCase().endsWith('.pdf');
}

/**
 * Génère un nom de fichier unique pour un PDF
 */
export function generateUniquePdfFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = originalFilename.toLowerCase().endsWith('.pdf')
    ? ''
    : '.pdf';
  const cleanName = originalFilename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.pdf$/i, '');
  return `${cleanName}_${timestamp}_${random}${extension}`;
}
