use dep::aztec::macros::aztec;

#[aztec]
pub contract PRTC_verifier {
    use aztec::{
        macros::{functions::{initializer, private, utility}, storage::storage},
        protocol_types::{address::AztecAddress},
        state_vars::Map,
    };
    use easy_private_state::EasyPrivateUint;

    global LOGS_COUNT: u32 = 10;

    #[storage]
    struct Storage<Context> {
        verification_status: Map<AztecAddress, EasyPrivateUint<Context>, Context>,
    }

    #[initializer]
    #[private]
    fn constructor() {
        // Empty constructor
    }

    #[private]
    fn verify_incident(
        // Incident identifier
        incident_id: pub AztecAddress,
        // Policy parameters
        max_ticket_lifetime_hours: pub u32,
        domain_admin_group_sid: pub u32,
        // Logs parameters
        event_ids: [u32; LOGS_COUNT],
        user_rids: [u32; LOGS_COUNT],
        group_membership: [u32; LOGS_COUNT],
        ticket_lifetimes: [u32; LOGS_COUNT],
        _timestamps: [u32; LOGS_COUNT],
    ) {
        let mut detection_flag = false;

        for i in 0..LOGS_COUNT {
            // Check TGT request events (Event ID 4769)
            if event_ids[i] == 4769 {

                // 1. Check for anomalously long ticket lifetime
                let has_anomalous_lifetime = ticket_lifetimes[i] > max_ticket_lifetime_hours;

                // 2. Check if user is a "ghost" (non-existent in the domain)
                // Under normal conditions, user SID should be linked to the domain
                // Logic to check that SID does not exist in the domain
                // For example, by reserved RIDs or SID format
                // This is a simplified implementation
                let well_known_rids = [500, 501, 502, 512, 513, 518, 519, 520]; // Well-known RIDs
                let mut is_ghost_user = false;
                for j in 0..well_known_rids.len() {
                    if well_known_rids[j] == user_rids[i] {
                        is_ghost_user = true;
                    }
                }

                // 3. Check for fake privileges
                // For example, membership in domain administrators group for a non-existent user
                let admin_privileges = group_membership[i] == domain_admin_group_sid;
                let has_fake_privileges = admin_privileges & is_ghost_user;

                if has_anomalous_lifetime | has_fake_privileges {
                    detection_flag = true;
                }
            }
        }

        if detection_flag {
            // Incident detected
            // Set verification status for incident
            let verification_status = storage.verification_status;
            verification_status.at(incident_id).add(1, incident_id);
        } else {
            // Incident not detected
        }
    }

    #[utility]
    unconstrained fn get_verification_status(incident_id: AztecAddress) -> Field {
        storage.verification_status.at(incident_id).get_value()
    }
}
