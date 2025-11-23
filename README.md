# PRTCTeam

## Demo video

`TODO: Insert demo video`

## Introduction

This repository was developed during ETHGlobal Buenos Aires 2025 and contains the MVP source code for **PRTCT** - a Blockchain infrastructure platform that allows policyholders to prove cyber risk realization without revealing sensitive corporate data.

## Problem

The cyber insurance market has tripled since 2020 but remains inefficient due to a lack of trust. Insurers delay payouts because they do not recognize the occurrence of a Cyber-Incident without manually verifying confidential IT infrastructure. Affected companies even refuse to receive payouts just to prevent data leaks from insurers and additional legal expenses.

We are building a cyber insurance infrastructure platform that allows policyholders to prove the occurrence of a Cyber-Incident without disclosing corporate secrets, reducing the approval payout time from several months to a few hours. We replace trust with ZKP: a Cyber-Incident can be proven only with strong evidence in the form of signed audit logs, which are verified within the ZK circuit to ensure compliance with the terms of the cyber insurance policy.

## Solution

The PRTCT platform acts as an intermediary between the Insurer and the Policyholder. For Policyholder to generate a ZKP of Incident, a reliable source of trustworthy and authentic Cyber-Incident data that is extremely difficult to tamper with is required. Such a source can be SOAR-class cybersecurity systems, which emit Cyber-Incident artifacts that cannot be tampered with or altered without being detected. SOAR-class systems are the best choice due to their orchestration function: they collect raw security data and alerts from all other company cybersecurity modules, such as SIEM, EDR, DLP, WAF, NGFW, etc.

To ensure a stable and secure data transfer channel from Policyholder to PRTCT, we assume to integrate the lightweight Watch Guardian module into Policyholder's IT infrastructure during the cyber risk underwriting phase, ensuring the delivery of Cyber-Incident artifacts over secure communication channels in real time. We have several working hypotheses regarding practical implementation (TLS in backend is major), but we plan to experiment with zkTLS separately.

To ensure legal validity and as an additional measure to prevent fraud by Policyholder, each sent Cyber-Incident data packet is additionally digitally signed within Watch Guardian, which is legally binding in court proceedings.

After receiving and processing all Cyber-Incident data, the PRTCT platform allows the Policyholder to initiate the generation of a ZK Proof and send it to the Insurer for verification. Within the arithmetic circuit, a check is made to determine whether the Cyber-Incident actually meets the policy terms. A ZK Proof cannot be generated if the Cyber-Incident does not meet the policy terms. Successful Proof of Incident generation, in turn, confirms the Policyholder's right to promptly receive insurance compensation: timely assistance from the Insurer can minimize the impact of existing Cyber-Incidents and prevent them from escalating into more serious events.

**The platform's operating algorithm consists of 5 main phases:**

1. Cyber-Incident Occurence
2. Cyber-Incident Processing
3. ZKP of Incident: Initiation
4. ZKP of Incident: Generation
5. ZKP of Incident: Broadcast

![Sequence](/assets/Sequence.png)

## Proving Logic

As part of the hackathon, we were able to build a simplified prototype system and write the logic for proving the onset of a rather critical Golden Ticket Attack — a cyberattack targeting Active Directory infrastructure that allows attackers to gain persistent domain-level access by forging Kerberos authentication tickets.

### How It Works

1. Compromise: Attacker obtains the KRBTGT account password hash (domain controller's master key)
2. Forgery: Creates fake Ticket-Granting Tickets (TGT) with arbitrary parameters
3. Persistence: Gains unlimited access to any domain resource while remaining undetectable

### Audit Logs Description

The circuit processes Windows Security Event logs, specifically focusing on Kerberos authentication events. Below are the detailed log fields used in our Golden Ticket attack detection circuit:

| Field Name | Type | Description | Example Value | Attack Indicator |
|------------|------|-------------|---------------|------------------|
| **Event ID** | u32 | Windows Event ID for Kerberos TGT requests | 4769 | Always 4769 for Kerberos ticket requests |
| **User RID** | u32 | Relative Identifier - unique user ID within domain | 500, 1001 | Well-known RIDs (500=Administrator) or non-existent users |
| **Group Membership** | u32 | Group RID indicating security group membership | 512 | Domain Admins (512) assigned to non-existent users |
| **Ticket Lifetime** | u32 | Requested ticket lifetime in hours | 87600 | Excessive duration (10+ years vs normal 10 hours) |
| **Timestamp** | u32 | Event occurrence time (Unix timestamp) | 1672531200 | For temporal correlation and sequence analysis |

### Public Policy Parameters

| Parameter | Type | Description | Normal Value | Attack Threshold |
|-----------|------|-------------|--------------|------------------|
| **max_ticket_lifetime_hours** | u32 | Maximum allowed ticket lifetime per policy | 720 (30 days) | > 720 hours |
| **domain_admin_group_sid** | u32 | Domain Admins group RID identifier | 512 | Used to detect privilege escalation |

### Circuit Input Structure

```noir
// Public Parameters (Policy Definitions):
max_ticket_lifetime_hours: pub u32        // Policy threshold (e.g., 720 hours = 30 days)
domain_admin_group_sid: pub u32           // Domain Admins group RID (typically 512)

// Private Log Inputs (Authentication Events):
event_ids: [u32; LOGS_COUNT]              // Windows Event IDs (4769 = TGT requests)
user_rids: [u32; LOGS_COUNT]              // User Relative Identifiers (RID)
group_membership: [u32; LOGS_COUNT]       // Group membership RIDs
ticket_lifetimes: [u32; LOGS_COUNT]       // Ticket lifetime in hours
_timestamps: [u32; LOGS_COUNT]            // Event timestamps (for future correlation)
```

### Attack Detection Logic

- Anomalous Ticket Lifetime Detection

    - What we prove: TGT ticket exceeds policy maximum (normal: 10 hours, attack: years)

- Ghost User Detection

    - What we prove: Ticket requested for non-existent/forged user account

- Privilege Escalation Detection

    - What we prove: Non-existent user has Domain Admin privileges

## Architecture

The current version of the architecture implements only the basic logic of Policyholder and Insurer authorization via Azguard Wallet (Aztec), acceptance and processing of incidents in the form of mock data, generation of ZK Proof of Incident (Golden Ticket Attack) via Noir circuit, as well as ZK Proof broadcast and display on the Frontend UI.

![MVP Architecture](/assets/Arch_MVP.png)

## Stack

- **Backend**: Python, PostgreSQL, FastAPI, Uvicorn
- **Frontend**: Typesript, NextJS, Aztec.js, Azguard Wallet SDK
- **ZKP**: Noir
- **Contracts**: Noir, Aztec.nr, Aztec Devnet

## Installation

TODO

## Deployments

TODO

## Future Track

![Target Architecture](/assets/Arch_Target.png)