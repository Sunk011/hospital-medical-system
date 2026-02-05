/**
 * Generate a unique medical number
 * Format: MRN + YYYYMMDD + 4-digit sequence
 */
export function generateMedicalNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MRN${dateStr}${random}`;
}

/**
 * Generate a unique record number
 * Format: REC + YYYYMMDD + 6-digit sequence
 */
export function generateRecordNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `REC${dateStr}${random}`;
}

/**
 * Calculate pagination values
 */
export function calculatePagination(
  page: number = 1,
  pageSize: number = 10,
  total: number
): { skip: number; take: number; totalPages: number } {
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(Math.max(1, pageSize), 100);
  const totalPages = Math.ceil(total / validPageSize);
  const skip = (validPage - 1) * validPageSize;

  return {
    skip,
    take: validPageSize,
    totalPages,
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Get client IP address from request
 */
export function getClientIp(req: { ip?: string; headers: { 'x-forwarded-for'?: string } }): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}
