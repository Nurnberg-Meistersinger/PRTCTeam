'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import dayjs from 'dayjs';

const statusMap = {
  'ZK proof Verified': { label: 'ZK proof Verified', color: 'success' },
  'Not Verified': { label: 'Not Verified', color: 'error' },
} as const;

export interface Incident {
  id: string;
  incident_id: string;
  status: 'ZK proof Verified' | 'Not Verified';
  createdAt: Date;
}

export interface LatestIncidentsProps {
  incidents?: Incident[];
  sx?: SxProps;
}

export function LatestIncidents({ incidents = [], sx }: LatestIncidentsProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardHeader title="Latest incidents" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Incident ID</TableCell>
              <TableCell sortDirection="desc">Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.map((incident) => {
              const { label, color } = statusMap[incident.status] ?? { label: 'Unknown', color: 'default' };

              return (
                <TableRow hover key={incident.id}>
                  <TableCell>{incident.incident_id}</TableCell>
                  <TableCell>{dayjs(incident.createdAt).format('MMM D, YYYY')}</TableCell>
                  <TableCell>
                    <Chip color={color} label={label} size="small" />
                  </TableCell>
                  <TableCell>
                    <Button
                    color='primary'
                      size="small"
                      variant="contained"
                      onClick={() => {
                        // Handle review incident action
                        console.log('Review incident:', incident.incident_id);
                      }}
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
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
        >
          View all
        </Button>
      </CardActions>
    </Card>
  );
}
