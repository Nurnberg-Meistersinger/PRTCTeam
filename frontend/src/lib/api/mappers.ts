// Mappers to convert API types to application types

import type { IncidentDetails as ApiIncidentDetails } from './types';
import type { IncidentDetailsData } from '@/components/dashboard/incident/incident-details';
import type { Incident } from '@/components/dashboard/overview/latest-incidents';
import type { Company } from '@/components/dashboard/overview/latest-companies';

/**
 * Maps API proof_status to application status
 */
function mapProofStatusToAppStatus(
  proofStatus: 'need_proof' | 'generating' | 'not_verified' | 'verified'
): 'Need Proof' | 'Proof Not Verified' | 'ZK proof Verified' {
  switch (proofStatus) {
    case 'need_proof':
    case 'generating': {
      return 'Need Proof';
    }
    case 'not_verified': {
      return 'Proof Not Verified';
    }
    case 'verified': {
      return 'ZK proof Verified';
    }
    default: {
      return 'Need Proof';
    }
  }
}

/**
 * Maps API IncidentDetails to application IncidentDetailsData
 * Returns data with companyName included for Insurer role
 */
export function mapApiIncidentToAppIncident(
  apiIncident: ApiIncidentDetails
): IncidentDetailsData & { companyName?: string } {
  return {
    id: apiIncident.incident_id,
    incident_id: apiIncident.incident_id,
    companyId: apiIncident.company_id,
    companyName: apiIncident.company_name, // Include company name from API
    commitment: apiIncident.commitment,
    txHash: apiIncident.transaction_hash || undefined,
    status: mapProofStatusToAppStatus(apiIncident.proof_status),
    proof: apiIncident.proof_summary
      ? {
          hash: apiIncident.proof_summary.proof_hash,
          size: 0, // Not provided by API, can be calculated or set to 0
          jsonUrl: `/api/proofs/${apiIncident.incident_id}.json`,
          publicInputs: apiIncident.proof_summary.public_inputs,
          txHash: apiIncident.proof_summary.transaction_hash,
          blockchainStatus:
            apiIncident.blockchain_status === 'confirmed'
              ? 'Confirmed'
              : apiIncident.blockchain_status === 'pending'
                ? 'Pending'
                : undefined,
        }
      : undefined,
    createdAt: new Date(apiIncident.detected_at),
  };
}

/**
 * Maps API IncidentListItem to application Incident
 */
export function mapApiIncidentListItemToAppIncident(
  apiIncident: { incident_id: string; detected_at: string; proof_status: string }
): Incident {
  return {
    id: apiIncident.incident_id,
    incident_id: apiIncident.incident_id,
    status: mapProofStatusToAppStatus(
      apiIncident.proof_status as 'need_proof' | 'generating' | 'not_verified' | 'verified'
    ),
    createdAt: new Date(apiIncident.detected_at),
  };
}

import { getCompanyLogo } from './company-logos';

/**
 * Maps API CompanyPortfolioItem to application Company
 * Returns Company type with incident_count preserved
 */
export function mapApiCompanyToAppCompany(
  apiCompany: { company_id: string; company_name: string; incident_count: number },
  image?: string
): Company {
  return {
    id: apiCompany.company_id,
    name: apiCompany.company_name,
    image: image || getCompanyLogo(apiCompany.company_id), // Use logo mapping if image not provided
    updatedAt: new Date(), // API doesn't provide this, use current date
  };
}

/**
 * Extracts incident_count from API company data
 */
export function getCompanyIncidentCount(
  apiCompany: { company_id: string; company_name: string; incident_count: number }
): number {
  return apiCompany.incident_count;
}

