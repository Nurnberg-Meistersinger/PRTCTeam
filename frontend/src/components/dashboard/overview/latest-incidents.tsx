'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

import { paths } from '@/paths';

const statusMap = {
  'Need Proof': { label: 'Need Proof', color: 'error' },
  'Proof Not Verified': { label: 'Proof Not Verified', color: 'warning' },
  'ZK proof Verified': { label: 'ZK proof Verified', color: 'success' },
} as const;

export interface Incident {
  id: string;
  incident_id: string;
  status: 'Need Proof' | 'Proof Not Verified' | 'ZK proof Verified';
  createdAt: Date;
}

export interface LatestIncidentsProps {
  incidents?: Incident[];
  companyName?: string;
  title?: string;
  sx?: SxProps;
}

type SortDirection = 'asc' | 'desc';

// Assign numeric values to statuses for sorting
// 'Need Proof' = 1, 'Proof Not Verified' = 2, 'ZK proof Verified' = 3
function statusValue(status: 'Need Proof' | 'Proof Not Verified' | 'ZK proof Verified'): number {
  if (status === 'Need Proof') return 1;
  if (status === 'Proof Not Verified') return 2;
  return 3; // 'ZK proof Verified'
}

export function LatestIncidents({ incidents = [], companyName, title: customTitle, sx }: LatestIncidentsProps): React.JSX.Element {
  const router = useRouter();
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  
  const title = customTitle || (companyName 
    ? `Incidents - ${companyName}` 
    : 'Latest incidents');

  const handleReviewIncident = (incidentId: string) => {
    router.push(paths.incident(incidentId));
  };

  const handleSort = () => {
   if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortDirection('asc');
    }
  };

  // Sort incidents by status
  // Default: Need Proof on top (desc), then Proof Not Verified, then ZK proof Verified
  const sortedIncidents = React.useMemo(() => {
    const sorted = [...incidents].sort((a, b) => {
      const aValue = statusValue(a.status);
      const bValue = statusValue(b.status);

      const direction = sortDirection || 'desc';
      
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [incidents, sortDirection]);

  return (
    <Card sx={sx}>
      <CardHeader title={title} />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Incident ID</TableCell>
              <TableCell sortDirection="desc">Date</TableCell>
              <TableCell>
                <TableSortLabel
                  active={!!sortDirection}
                  direction={ sortDirection}
                  onClick={handleSort}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedIncidents.map((incident) => {
              const { label, color } = statusMap[incident.status] ?? { label: 'Unknown', color: 'default' };

              return (
                <TableRow hover key={incident.id}>
                  <TableCell>{incident.incident_id}</TableCell>
                  <TableCell>{dayjs(incident.createdAt).format('MMM D, YYYY')}</TableCell>
                  <TableCell>
                    <Chip color={color} label={label} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      color='primary'
                      size="small"
                      variant="contained"
                      onClick={() => handleReviewIncident(incident.incident_id)}
                    >
                      Review Incident
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
