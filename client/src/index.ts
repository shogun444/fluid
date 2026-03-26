import StellarSdk from "@stellar/stellar-sdk";

interface FluidClientConfig {
  serverUrl: string;
  networkPassphrase: string;
  horizonUrl?: string;
}

interface FeeBumpResponse {
  xdr: string;
  status: string;
  hash?: string;
}

export type WaitForConfirmationProgress = {
  hash: string;
  attempt: number;
  elapsedMs: number;
};

export type WaitForConfirmationOptions = {
  pollIntervalMs?: number;
  onProgress?: (progress: WaitForConfirmationProgress) => void;
};

export class FluidClient {
  private serverUrl: string;
  private networkPassphrase: string;
  private horizonServer?: any;
  private horizonUrl?: string;

  constructor(config: FluidClientConfig) {
    this.serverUrl = config.serverUrl;
    this.networkPassphrase = config.networkPassphrase;
    if (config.horizonUrl) {
      this.horizonUrl = config.horizonUrl;
      this.horizonServer = new StellarSdk.Horizon.Server(config.horizonUrl);
    }
  }

  
  async requestFeeBump(
    signedTransactionXdr: string,
    submit: boolean = false
  ): Promise<FeeBumpResponse> {
    const response = await fetch(`${this.serverUrl}/fee-bump`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        xdr: signedTransactionXdr,
        submit: submit,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Fluid server error: ${JSON.stringify(error)}`);
    }

    const result = (await response.json()) as FeeBumpResponse;
    return {
      xdr: result.xdr,
      status: result.status,
      hash: result.hash,
    };
  }

  
  async submitFeeBumpTransaction(feeBumpXdr: string): Promise<any> {
    if (!this.horizonServer) {
      throw new Error("Horizon URL not configured");
    }

    const feeBumpTx = StellarSdk.TransactionBuilder.fromXDR(
      feeBumpXdr,
      this.networkPassphrase
    );

    return await this.horizonServer.submitTransaction(feeBumpTx);
  }

  async waitForConfirmation(
    hash: string,
    timeoutMs: number = 60_000,
    options: WaitForConfirmationOptions = {}
  ): Promise<any> {
    if (!this.horizonUrl) {
      throw new Error("Horizon URL not configured");
    }

    const pollIntervalMs = options.pollIntervalMs ?? 1_500;
    const startedAt = Date.now();
    let attempt = 0;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    // Horizon returns 404 until the transaction is ingested.
    // Once found, the response includes a `ledger` number when confirmed.
    // Ref: GET /transactions/{hash}
    while (Date.now() - startedAt < timeoutMs) {
      attempt += 1;
      options.onProgress?.({
        hash,
        attempt,
        elapsedMs: Date.now() - startedAt,
      });

      const res = await fetch(`${this.horizonUrl}/transactions/${hash}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (res.status === 404) {
        await sleep(pollIntervalMs);
        continue;
      }

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
          `Horizon error while confirming tx (${res.status}): ${body}`
        );
      }

      const tx = await res.json();
      // If Horizon found it, it's confirmed on-ledger (Horizon only serves
      // transactions that have been included).
      return tx;
    }

    throw new Error(
      `Timed out waiting for transaction confirmation after ${timeoutMs}ms: ${hash}`
    );
  }

  async awaitTransactionConfirmation(
    hash: string,
    timeoutMs: number = 60_000,
    options: WaitForConfirmationOptions = {}
  ): Promise<any> {
    return this.waitForConfirmation(hash, timeoutMs, options);
  }

  
  async buildAndRequestFeeBump(
    transaction: any,
    submit: boolean = false
  ): Promise<FeeBumpResponse> {
    const signedXdr = transaction.toXDR();
    return await this.requestFeeBump(signedXdr, submit);
  }
}
