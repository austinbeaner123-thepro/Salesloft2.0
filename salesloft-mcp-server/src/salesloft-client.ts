import https from "node:https";

const BASE_URL = "https://api.salesloft.com";

export interface SalesloftConfig {
  apiKey: string;
}

export interface ApiResponse {
  data?: any;
  metadata?: {
    paging?: {
      per_page: number;
      current_page: number;
      next_page: number | null;
      prev_page: number | null;
      total_pages: number;
      total_count: number;
    };
  };
  errors?: any[];
}

export class SalesloftClient {
  private apiKey: string;

  constructor(config: SalesloftConfig) {
    this.apiKey = config.apiKey;
  }

  private request(
    method: string,
    path: string,
    body?: Record<string, any>,
    queryParams?: Record<string, string>
  ): Promise<ApiResponse> {
    return new Promise((resolve, reject) => {
      let url = `${BASE_URL}/v2/${path}.json`;
      if (queryParams) {
        const params = new URLSearchParams(queryParams);
        const qs = params.toString();
        if (qs) url += `?${qs}`;
      }

      const parsed = new URL(url);
      const options: https.RequestOptions = {
        hostname: parsed.hostname,
        port: 443,
        path: parsed.pathname + parsed.search,
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(data ? JSON.parse(data) : {});
            } else {
              const parsed = data ? JSON.parse(data) : {};
              reject(
                new Error(
                  `Salesloft API error ${res.statusCode}: ${JSON.stringify(parsed)}`
                )
              );
            }
          } catch {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on("error", reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error("Request timed out"));
      });

      if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  // ── Current User ──
  async getMe(): Promise<ApiResponse> {
    return this.request("GET", "me");
  }

  // ── People ──
  async listPeople(params?: Record<string, string>): Promise<ApiResponse> {
    return this.request("GET", "people", undefined, params);
  }

  async getPerson(id: number): Promise<ApiResponse> {
    return this.request("GET", `people/${id}`);
  }

  async createPerson(data: Record<string, any>): Promise<ApiResponse> {
    return this.request("POST", "people", data);
  }

  async updatePerson(
    id: number,
    data: Record<string, any>
  ): Promise<ApiResponse> {
    return this.request("PUT", `people/${id}`, data);
  }

  async deletePerson(id: number): Promise<ApiResponse> {
    return this.request("DELETE", `people/${id}`);
  }

  // ── Accounts ──
  async listAccounts(params?: Record<string, string>): Promise<ApiResponse> {
    return this.request("GET", "accounts", undefined, params);
  }

  async getAccount(id: number): Promise<ApiResponse> {
    return this.request("GET", `accounts/${id}`);
  }

  async createAccount(data: Record<string, any>): Promise<ApiResponse> {
    return this.request("POST", "accounts", data);
  }

  async updateAccount(
    id: number,
    data: Record<string, any>
  ): Promise<ApiResponse> {
    return this.request("PUT", `accounts/${id}`, data);
  }

  // ── Cadences ──
  async listCadences(params?: Record<string, string>): Promise<ApiResponse> {
    return this.request("GET", "cadences", undefined, params);
  }

  async getCadence(id: number): Promise<ApiResponse> {
    return this.request("GET", `cadences/${id}`);
  }

  // ── Cadence Memberships ──
  async addPersonToCadence(
    personId: number,
    cadenceId: number
  ): Promise<ApiResponse> {
    return this.request("POST", "cadence_memberships", {
      person_id: personId,
      cadence_id: cadenceId,
    });
  }

  async listCadenceMemberships(
    params?: Record<string, string>
  ): Promise<ApiResponse> {
    return this.request("GET", "cadence_memberships", undefined, params);
  }

  // ── Activities ──
  async listCalls(params?: Record<string, string>): Promise<ApiResponse> {
    return this.request("GET", "activities/calls", undefined, params);
  }

  async listEmails(params?: Record<string, string>): Promise<ApiResponse> {
    return this.request("GET", "activities/emails", undefined, params);
  }

  // ── Users ──
  async listUsers(params?: Record<string, string>): Promise<ApiResponse> {
    return this.request("GET", "users", undefined, params);
  }

  async getUser(id: number): Promise<ApiResponse> {
    return this.request("GET", `users/${id}`);
  }
}
