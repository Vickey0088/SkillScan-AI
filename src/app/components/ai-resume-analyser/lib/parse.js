// lib/parse.js
import mammoth from 'mammoth';

/**
 * Extracts text from a PDF buffer.
 * This version uses a dynamic import for 'pdf-parse' to improve compatibility
 * and adds more robust checks to ensure the output is always a string.
 * This helps prevent runtime errors that can cause a 500 status on the server.
 * @param {Buffer} buffer The PDF file content as a buffer.
 * @returns {Promise<string>} The extracted text content.
 */
async function extractPDFText(buffer) {
  try {
    // Dynamically import pdf-parse to better handle module resolution.
    // The .default is crucial for compatibility with CommonJS modules like pdf-parse.
    const pdf = (await import('pdf-parse')).default;
    const data = await pdf(buffer);

    // Defensive check: ensure the returned data object and its text property exist and are strings.
    if (data && typeof data.text === 'string') {
      return data.text.trim();
    }

    // If data.text is not a string or is missing, fall back to string conversion.
    console.warn('PDF parsing returned data but no valid text property was found.', data);
  } catch (error) {
    console.warn('An error occurred during PDF parsing with pdf-parse:', error.message);
  }

  // Fallback: simple string conversion.
  const fallbackText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, '');
  if (fallbackText && fallbackText.trim().length > 10) {
    console.info('Using fallback string conversion for PDF text extraction.');
    return fallbackText.trim();
  }

  // If fallback also fails, throw error.
  throw new Error('All PDF text extraction methods failed. The file might be image-based or corrupted.');
}

/**
 * Extracts text from a DOCX buffer using the mammoth library.
 * @param {Buffer} buffer The DOCX file content as a buffer.
 * @returns {Promise<string>} The extracted text content.
 */
async function extractDOCXText(buffer) {
  try {
    const { value } = await mammoth.extractRawText({ buffer });
    return value.trim() || '';
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from the DOCX file.');
  }
}

/**
 * Main function to process an uploaded file, identify its type,
 * and extract text content from its buffer.
 * @param {File} file The file object from the form data.
 * @param {string} filename The name of the file.
 * @returns {Promise<string>} The extracted text from the file.
 */
export async function extractTextFromFile(file, filename) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new Error('A valid file object was not provided for text extraction.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const name = (filename || file.name).toLowerCase();

  if (buffer.length === 0) {
    throw new Error('The provided file is empty and contains no content.');
  }

  if (name.endsWith('.pdf')) {
    return extractPDFText(buffer);
  }

  if (name.endsWith('.docx')) {
    return extractDOCXText(buffer);
  }

  if (name.endsWith('.txt')) {
    return buffer.toString('utf-8').trim();
  }

  throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
}

