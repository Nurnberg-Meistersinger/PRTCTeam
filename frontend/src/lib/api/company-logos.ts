// Company logo mapping based on company_id
// Since API doesn't provide logos, we map them on the frontend
// Using the same mapping as in dummy-data for consistency

const companyLogoMap: Record<string, string> = {
  'COMP-001': '/assets/logo-slack.png',
  'COMP-002': '/assets/logo-dropbox.png',
  'COMP-003': '/assets/logo-github.png',
  'COMP-004': '/assets/logo-lyft.png',
  'COMP-005': '/assets/logo-medium.png',
  'COMP-006': '/assets/logo-squarespace.png',
};

// Fallback logos for companies not in the map
const fallbackLogos = [
  '/assets/logo-slack.png',
  '/assets/logo-dropbox.png',
  '/assets/logo-github.png',
  '/assets/logo-lyft.png',
  '/assets/logo-medium.png',
  '/assets/logo-squarespace.png',
] as const;

/**
 * Get logo for a company by its ID
 * Returns mapped logo if company ID exists in the map, otherwise uses hash-based fallback
 */
export function getCompanyLogo(companyId: string): string {
  // Return mapped logo if exists
  if (companyId in companyLogoMap) {
    return companyLogoMap[companyId];
  }

  // Fallback: use hash-based assignment for unknown company IDs
  let hash = 0;
  for (let i = 0; i < companyId.length; i++) {
    const char = companyId.codePointAt(i) ?? 0;
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get logo index
  const logoIndex = Math.abs(hash) % fallbackLogos.length;
  return fallbackLogos[logoIndex];
}

