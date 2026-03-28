export type DashboardSignerStatus =
  | "Active"
  | "Low Balance"
  | "Sequence Error"
  | "Inactive";

export interface DashboardTransaction {
  id: string;
  hash: string;
  amount: string;
  asset: string;
  status: "pending" | "submitted" | "success" | "failed";
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSigner {
  id: string;
  publicKey: string;
  status: DashboardSignerStatus;
  balance: string;
  inFlight: number;
  totalUses: number;
  sequenceNumber: string;
}

export type TransactionStatus = "pending" | "submitted" | "success" | "failed";

export interface TransactionHistoryRow {
  id: string;
  timestamp: string;
  innerHash: string;
  status: TransactionStatus;
  costStroops: number;
  tenant: string;
}

export interface TenantUsageRow {
  tenant: string;
  txCount: number;
  totalCostStroops: number;
  successCount: number;
  failedCount: number;
}

export interface ApiKey {
  id: string;
  key: string;
  prefix: string;
  tenantId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type WebhookEventType = "tx.success" | "tx.failed" | "balance.low";

export interface WebhookTenantSettings {
  tenantId: string;
  tenantName: string | null;
  webhookUrl: string | null;
  eventTypes: WebhookEventType[];
  updatedAt: string | null;
}

export type TransactionHistorySort =
  | "time_desc"
  | "time_asc"
  | "cost_desc"
  | "cost_asc";

export interface TransactionHistoryQuery {
  page: number;
  pageSize: number;
  search: string;
  sort: TransactionHistorySort;
}

export interface TransactionHistoryPageData {
  rows: TransactionHistoryRow[];
  page: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
  sort: TransactionHistorySort;
  search: string;
  source: "live" | "sample";
}

export type WebhookDeliveryStatus = "success" | "failed" | "pending" | "retrying";

export interface WebhookDeliveryLog {
  id: string;
  tenantId: string;
  tenantName: string | null;
  eventType: WebhookEventType;
  webhookUrl: string;
  status: WebhookDeliveryStatus;
  attempts: number;
  maxAttempts: number;
  responseCode: number | null;
  responseMessage: string | null;
  payload: any;
  createdAt: string;
  updatedAt: string;
  nextRetryAt: string | null;
}

export type WebhookDeliverySort =
  | "time_desc"
  | "time_asc"
  | "status_asc"
  | "status_desc"
  | "attempts_desc"
  | "attempts_asc";

export interface WebhookDeliveryQuery {
  page: number;
  pageSize: number;
  search: string;
  sort: WebhookDeliverySort;
  statusFilter: WebhookDeliveryStatus[];
  eventTypeFilter: WebhookEventType[];
  tenantFilter: string[];
}

export interface WebhookDeliveryPageData {
  rows: WebhookDeliveryLog[];
  page: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
  sort: WebhookDeliverySort;
  search: string;
  statusFilter: WebhookDeliveryStatus[];
  eventTypeFilter: WebhookEventType[];
  tenantFilter: string[];
  source: "live" | "sample";
}
