import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { IncidentDetailsWrapper } from '@/components/dashboard/incident/incident-details-wrapper';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ companyId?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  return { title: `Incident ${id} | ${config.site.name}` };
}

export default async function Page({ params, searchParams }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const { companyId } = await searchParams;

  // Pass companyId from query params for Insurer role
  return <IncidentDetailsWrapper incidentId={id} companyId={companyId} />;
}

