'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Check } from '@phosphor-icons/react/dist/ssr/Check';
import { Copy } from '@phosphor-icons/react/dist/ssr/Copy';
import dayjs from 'dayjs';
import { useRole } from '@/contexts/role-context';

export interface IncidentDetailsData {
  id: string;
  incident_id: string;
  companyId?: string;
  commitment: string;
  txHash?: string;
  status: 'Need Proof' | 'Proof Not Verified' | 'ZK proof Verified';
  proof?: {
    hash: string;
    size: number;
    jsonUrl: string;
    publicInputs?: string[];
    txHash?: string;
    blockchainStatus?: 'Pending' | 'Confirmed' | 'Failed';
  };
  createdAt: Date;
}

interface IncidentDetailsProps {
  incident: IncidentDetailsData;
  companyName?: string;
}

const statusMap = {
  'Need Proof': { label: 'Need Proof', color: 'error' },
  'Proof Not Verified': { label: 'Proof Not Verified', color: 'warning' },
  'ZK proof Verified': { label: 'ZK proof Verified', color: 'success' },
} as const;

// Network can be configured later
function getEtherscanUrl(txHash: string): string {
  return `https://devnet.aztecscan.xyz/tx-effects/${txHash}`;
}

export function IncidentDetails({ incident, companyName }: IncidentDetailsProps): React.JSX.Element {
  const { role } = useRole();
  const [copiedCommitment, setCopiedCommitment] = React.useState(false);
  const [copiedTxHash, setCopiedTxHash] = React.useState(false);
  const [copiedProofHash, setCopiedProofHash] = React.useState(false);
  const [copiedPublicInput, setCopiedPublicInput] = React.useState<Record<number, boolean>>({});

  const handleCopy = async (text: string, type: 'commitment' | 'txHash' | 'proofHash' | 'publicInput', index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      switch (type) {
        case 'commitment': {
          setCopiedCommitment(true);
          setTimeout(() => setCopiedCommitment(false), 2000);
          break;
        }
        case 'txHash': {
          setCopiedTxHash(true);
          setTimeout(() => setCopiedTxHash(false), 2000);
          break;
        }
        case 'proofHash': {
          setCopiedProofHash(true);
          setTimeout(() => setCopiedProofHash(false), 2000);
          break;
        }
        case 'publicInput': {
          if (index !== undefined) {
            setCopiedPublicInput(prev => ({ ...prev, [index]: true }));
            setTimeout(() => setCopiedPublicInput(prev => ({ ...prev, [index]: false })), 2000);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const blockchainStatusMap = {
    'Pending': { label: 'Pending', color: 'warning' },
    'Confirmed': { label: 'Confirmed', color: 'success' },
    'Failed': { label: 'Failed', color: 'error' },
  } as const;

  const commitmentPreview = `${incident.commitment.slice(0, 10)}...`;
  const { label, color } = statusMap[incident.status] ?? { label: 'Unknown', color: 'default' };
  const hasProof = !!incident.proof;
  const needsProof = incident.status === 'Need Proof';

  // For Policyholder, don't show company name in title
  const title = role === 'Policyholder' || !companyName
    ? `Incident #${incident.incident_id}`
    : `Incident #${incident.incident_id} - ${companyName}`;

  return (
    <Card>
        <CardHeader 
          title={title}
          action={
            <Chip color={color} label={label} size="small" />
          }
        />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            {/* Incident ID */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Incident ID
              </Typography>
              <Typography variant="body1">{incident.incident_id}</Typography>
            </Box>

            <Divider />

            {/* Commitment */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Commitment
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {commitmentPreview}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleCopy(incident.commitment, 'commitment')}
                  sx={{ ml: 1 }}
                >
                  {copiedCommitment ? (
                    <Check fontSize="var(--icon-fontSize-md)" />
                  ) : (
                    <Copy fontSize="var(--icon-fontSize-md)" />
                  )}
                </IconButton>
              </Stack>
            </Box>

            <Divider />

            {/* Transaction Hash */}
            {incident.txHash && (
              <>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Transaction Hash
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {incident.txHash}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(incident.txHash!, 'txHash')}
                      sx={{ ml: 1 }}
                    >
                      {copiedTxHash ? (
                        <Check fontSize="var(--icon-fontSize-md)" />
                      ) : (
                        <Copy fontSize="var(--icon-fontSize-md)" />
                      )}
                    </IconButton>
                  </Stack>
                </Box>
                <Divider />
              </>
            )}

            {/* Proof Section - визуально отделена */}
            <Card 
              variant="outlined" 
              sx={{ 
                backgroundColor: 'action.hover',
                borderColor: 'divider',
              }}
            >
              <CardContent>
                {needsProof ? (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      ZK Proof
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => {
                        // Handle generate proof action
                        console.log('Generate proof for incident:', incident.incident_id);
                      }}
                      sx={{ mt: 2 }}
                    >
                      Generate proof
                    </Button>
                  </Box>
                ) : (hasProof ? (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      ZK Proof Summary
                    </Typography>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                      {/* Proof Hash */}
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Proof Hash
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                            {incident.proof!.hash}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(incident.proof!.hash, 'proofHash')}
                          >
                            {copiedProofHash ? (
                              <Check fontSize="var(--icon-fontSize-md)" />
                            ) : (
                              <Copy fontSize="var(--icon-fontSize-md)" />
                            )}
                          </IconButton>
                        </Stack>
                      </Box>

                      <Divider />

                      {/* Public Inputs */}
                      {incident.proof!.publicInputs && incident.proof!.publicInputs.length > 0 && (
                        <>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Public Inputs
                            </Typography>
                            <Stack spacing={1}>
                              {incident.proof!.publicInputs.map((input, index) => (
                                <Stack key={index} direction="row" spacing={1} alignItems="center">
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', flex: 1, wordBreak: 'break-all' }}>
                                    {input}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCopy(input, 'publicInput', index)}
                                  >
                                    {copiedPublicInput[index] ? (
                                      <Check fontSize="var(--icon-fontSize-md)" />
                                    ) : (
                                      <Copy fontSize="var(--icon-fontSize-md)" />
                                    )}
                                  </IconButton>
                                </Stack>
                              ))}
                            </Stack>
                          </Box>
                          <Divider />
                        </>
                      )}

                      {/* Commitment */}
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Commitment
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                            {incident.commitment}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(incident.commitment, 'commitment')}
                          >
                            {copiedCommitment ? (
                              <Check fontSize="var(--icon-fontSize-md)" />
                            ) : (
                              <Copy fontSize="var(--icon-fontSize-md)" />
                            )}
                          </IconButton>
                        </Stack>
                      </Box>

                      <Divider />

                      {/* Transaction Hash (Blockchain) */}
                      {incident.proof!.txHash && (
                        <>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Transaction Hash
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Link 
                                href={getEtherscanUrl(incident.proof!.txHash)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}
                              >
                                {incident.proof!.txHash}
                              </Link>
                              <IconButton
                                size="small"
                                onClick={() => handleCopy(incident.proof!.txHash!, 'txHash')}
                              >
                                {copiedTxHash ? (
                                  <Check fontSize="var(--icon-fontSize-md)" />
                                ) : (
                                  <Copy fontSize="var(--icon-fontSize-md)" />
                                )}
                              </IconButton>
                            </Stack>
                          </Box>
                          <Divider />
                        </>
                      )}

                      {/* Blockchain Status */}
                      {incident.proof!.blockchainStatus && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Blockchain Status
                          </Typography>
                          <Chip 
                            color={blockchainStatusMap[incident.proof!.blockchainStatus].color as 'warning' | 'success' | 'error'} 
                            label={blockchainStatusMap[incident.proof!.blockchainStatus].label} 
                            size="small" 
                          />
                        </Box>
                      )}
                    </Stack>
                  </Box>
                ) : null)}
              </CardContent>
            </Card>

            <Divider />

            {/* Created At */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Created At
              </Typography>
              <Typography variant="body2">
                {dayjs(incident.createdAt).format('MMM D, YYYY [at] h:mm A')}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
  );
}

