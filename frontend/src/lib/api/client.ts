// API Client for Protectorium MVP API

import type {
  IncidentListItem,
  CompanyPortfolioItem,
  IncidentDetails,
  ProofStatusResponse,
} from './types';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Use Next.js API route as proxy to avoid CORS issues
  // Remove leading slash from endpoint for proxy path
  const proxyPath = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `/api/proxy/${proxyPath}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || `API request failed: ${response.statusText}`,
      response.status,
      response.statusText
    );
  }

  return response.json() as Promise<T>;
}

// Policyholder API

export async function getPolicyholderIncidents(): Promise<IncidentListItem[]> {
  return fetchApi<IncidentListItem[]>('/incidents');
}

export async function getPolicyholderIncidentDetails(
  incidentId: string
): Promise<IncidentDetails> {
  return fetchApi<IncidentDetails>(`/incident/${incidentId}`);
}

export async function generateProof(
  incidentId: string
): Promise<ProofStatusResponse> {
  return fetchApi<ProofStatusResponse>(`/incident/${incidentId}/generate-proof`, {
    method: 'POST',
  });
}

// Insurer API

export async function getCompanyPortfolio(): Promise<CompanyPortfolioItem[]> {
  return fetchApi<CompanyPortfolioItem[]>('/company/incidents/list');
}

export async function getCompanyIncidents(
  companyId: string
): Promise<IncidentListItem[]> {
  return fetchApi<IncidentListItem[]>(`/company/${companyId}/incidents`);
}

export async function getInsurerIncidentDetails(
  companyId: string,
  incidentId: string
): Promise<IncidentDetails> {
  return fetchApi<IncidentDetails>(`/company/${companyId}/incident/${incidentId}`);
}

export async function verifyProof(
  companyId: string,
  incidentId: string
): Promise<ProofStatusResponse> {
  return fetchApi<ProofStatusResponse>(
    `/company/${companyId}/incident/${incidentId}/verify`,
    {
      method: 'POST',
    }
  );
}

