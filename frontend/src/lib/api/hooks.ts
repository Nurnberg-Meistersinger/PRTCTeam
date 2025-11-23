// React Query hooks for API calls

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import {
  getPolicyholderIncidents,
  getPolicyholderIncidentDetails,
  generateProof,
  getCompanyPortfolio,
  getCompanyIncidents,
  getInsurerIncidentDetails,
  verifyProof,
} from './client';
import {
  mapApiIncidentToAppIncident,
  mapApiIncidentListItemToAppIncident,
  mapApiCompanyToAppCompany,
} from './mappers';
import type { ProofStatusResponse } from './types';
import type { IncidentDetailsData } from '@/components/dashboard/incident/incident-details';
import type { Incident } from '@/components/dashboard/overview/latest-incidents';
import type { Company } from '@/components/dashboard/overview/latest-companies';

// Policyholder hooks

export function usePolicyholderIncidents(
  options?: Omit<UseQueryOptions<Incident[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Incident[], Error>({
    queryKey: ['policyholder', 'incidents'],
    queryFn: async () => {
      const data = await getPolicyholderIncidents();
      return data.map(item => mapApiIncidentListItemToAppIncident(item));
    },
    ...options,
  });
}

export function usePolicyholderIncidentDetails(
  incidentId: string,
  options?: Omit<UseQueryOptions<IncidentDetailsData | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<IncidentDetailsData | null, Error>({
    queryKey: ['policyholder', 'incident', incidentId],
    queryFn: async () => {
      const data = await getPolicyholderIncidentDetails(incidentId);
      return mapApiIncidentToAppIncident(data);
    },
    enabled: !!incidentId,
    ...options,
  });
}

export function useGenerateProof(
  options?: Omit<UseMutationOptions<ProofStatusResponse, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<ProofStatusResponse, Error, string>({
    mutationFn: async (incidentId: string) => {
      return generateProof(incidentId);
    },
    onSuccess: async (data, incidentId) => {
      // Invalidate and refetch incident details
      await queryClient.invalidateQueries({ queryKey: ['policyholder', 'incident', incidentId] });
      await queryClient.invalidateQueries({ queryKey: ['policyholder', 'incidents'] });
      // Explicitly refetch the incident details
      await queryClient.refetchQueries({ queryKey: ['policyholder', 'incident', incidentId] });
    },
    ...options,
  });
}

// Insurer hooks

export function useCompanyPortfolio(
  options?: Omit<UseQueryOptions<Company[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Company[], Error>({
    queryKey: ['insurer', 'companies'],
    queryFn: async () => {
      const data = await getCompanyPortfolio();
      // Note: API doesn't provide images, so we'll need to handle that separately
      return data.map(company => mapApiCompanyToAppCompany(company));
    },
    ...options,
  });
}

export function useCompanyPortfolioWithCounts(
  options?: Omit<UseQueryOptions<{ companies: Company[]; counts: Record<string, number> }, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<{ companies: Company[]; counts: Record<string, number> }, Error>({
    queryKey: ['insurer', 'companies', 'with-counts'],
    queryFn: async () => {
      const data = await getCompanyPortfolio();
      const companies = data.map(company => mapApiCompanyToAppCompany(company));
      const counts: Record<string, number> = {};
      for (const company of data) {
        counts[company.company_id] = company.incident_count;
      }
      return { companies, counts };
    },
    ...options,
  });
}

export function useCompanyIncidents(
  companyId: string,
  options?: Omit<UseQueryOptions<Incident[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Incident[], Error>({
    queryKey: ['insurer', 'company', companyId, 'incidents'],
    queryFn: async () => {
      const data = await getCompanyIncidents(companyId);
      return data.map(item => mapApiIncidentListItemToAppIncident(item));
    },
    enabled: !!companyId,
    ...options,
  });
}

export function useInsurerIncidentDetails(
  companyId: string,
  incidentId: string,
  options?: Omit<UseQueryOptions<IncidentDetailsData | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<IncidentDetailsData | null, Error>({
    queryKey: ['insurer', 'company', companyId, 'incident', incidentId],
    queryFn: async () => {
      const data = await getInsurerIncidentDetails(companyId, incidentId);
      return mapApiIncidentToAppIncident(data);
    },
    enabled: !!companyId && !!incidentId,
    ...options,
  });
}

export function useVerifyProof(
  options?: Omit<
    UseMutationOptions<ProofStatusResponse, Error, { companyId: string; incidentId: string }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<ProofStatusResponse, Error, { companyId: string; incidentId: string }>({
    mutationFn: async ({ companyId, incidentId }) => {
      return verifyProof(companyId, incidentId);
    },
    onSuccess: async (data, { companyId, incidentId }) => {
      // Invalidate and refetch incident details
      await queryClient.invalidateQueries({
        queryKey: ['insurer', 'company', companyId, 'incident', incidentId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['insurer', 'company', companyId, 'incidents'],
      });
      // Explicitly refetch the incident details
      await queryClient.refetchQueries({
        queryKey: ['insurer', 'company', companyId, 'incident', incidentId],
      });
    },
    ...options,
  });
}

