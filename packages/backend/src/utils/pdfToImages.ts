import { pdfToPng } from "pdf-to-png-converter";

export type PdfToImagesOptions = {
  maxPages?: number;
};

/**
 * Rasterize PDF pages to PNG buffers for vision LLM parsing.
 */
export async function pdfBufferToPngImages(
  pdfBuffer: Buffer,
  options: PdfToImagesOptions = {}
): Promise<Buffer[]> {
  const maxPages = options.maxPages ?? 1;
  const pagesToProcess = Array.from({ length: maxPages }, (_, index) => index + 1);

  const pages = await pdfToPng(pdfBuffer, {
    pagesToProcess,
    verbosityLevel: 0,
  });

  if (!pages.length) {
    throw new Error("PDF has no pages.");
  }

  return pages
    .map((page) => page.content)
    .filter((content): content is Buffer => !!content);
}
