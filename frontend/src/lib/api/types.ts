// API Types based on OpenAPI specification

export type ProofStatus = 'need_proof' | 'generating' | 'not_verified' | 'verified';
export type BlockchainStatus = 'none' | 'pending' | 'confirmed';

export interface IncidentListItem {
  incident_id: string;
  detected_at: string; // ISO date-time
  proof_status: ProofStatus;
}

export interface CompanyPortfolioItem {
  company_id: string;
  company_name: string;
  incident_count: number;
}

export interface ProofSummary {
  proof_hash: string;
  public_inputs: string[];
  commitment: string;
  transaction_hash: string;
}

export interface IncidentDetails {
  incident_id: string;
  company_id: string;
  company_name: string;
  detected_at: string; // ISO date-time
  commitment: string;
  proof_status: ProofStatus;
  transaction_hash: string | null;
  blockchain_status: BlockchainStatus;
  proof_summary: ProofSummary | null;
}

export interface ProofStatusResponse {
  incident_id: string;
  proof_status: ProofStatus;
}

