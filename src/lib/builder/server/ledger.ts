// src/lib/builder/server/ledger.ts

export type LedgerEvent =
  | {
      type: "agent_shadow_run";
      payload: any;
      createdAt: string;
    }
  | {
      type: "agent_promoted";
      payload: any;
      createdAt: string;
    }
  | {
      type: "agent_rollback";
      payload: any;
      createdAt: string;
    }
  | {
      type: "agent_promotion_blocked";
      payload: any;
      createdAt: string;
    }
  | {
      type: "agent_regression_alert";
      payload: any;
      createdAt: string;
    }
  | {
      type: "agent_auto_demoted";
      payload: any;
      createdAt: string;
    }
  | {
      type: "action_blocked_frozen";
      payload: any;
      createdAt: string;
    }
  | {
      type: "agent_promotion_approved";
      payload: any;
      createdAt: string;
    }
  | {
      type: "agent_promotion_denied";
      payload: any;
      createdAt: string;
    }
  | {
      type: "agent_run_replay";
      payload: any;
      createdAt: string;
    }
  | {
      type: "agent_promotion_requested";
      payload: any;
      createdAt: string;
    };

export function appendLedgerEvent(project: any, event: LedgerEvent) {
  project.ledger = project.ledger || [];
  project.ledger.push(event);
  project.updated_at = new Date().toISOString();
}
