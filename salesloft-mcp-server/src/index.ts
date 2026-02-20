#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SalesloftClient } from "./salesloft-client.js";

// ── Load API key ──
const apiKey = process.env.SALESLOFT_API_KEY;
if (!apiKey) {
  console.error(
    "Error: SALESLOFT_API_KEY environment variable is required.\n" +
      "Set it via: export SALESLOFT_API_KEY=your_key_here"
  );
  process.exit(1);
}

const client = new SalesloftClient({ apiKey });

// ── Create MCP Server ──
const server = new McpServer({
  name: "salesloft",
  version: "1.0.0",
});

// ── Helper to format responses ──
function jsonResult(data: any) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

async function handleError(fn: () => Promise<any>) {
  try {
    const result = await fn();
    return jsonResult(result);
  } catch (err: any) {
    return {
      content: [{ type: "text" as const, text: `Error: ${err.message}` }],
      isError: true,
    };
  }
}

// ════════════════════════════════════════════
//  TOOLS
// ════════════════════════════════════════════

// ── Get Current User ──
server.tool("get_me", "Get the currently authenticated Salesloft user", {}, async () => {
  return handleError(() => client.getMe());
});

// ════════════════════════════════════════════
//  PEOPLE
// ════════════════════════════════════════════

server.tool(
  "list_people",
  "List people in Salesloft with optional filters",
  {
    page: z.number().optional().describe("Page number"),
    per_page: z.number().optional().describe("Results per page (max 100)"),
    email_addresses: z
      .string()
      .optional()
      .describe("Filter by email address"),
    sort_by: z
      .string()
      .optional()
      .describe("Sort field (e.g. 'created_at', 'updated_at')"),
    sort_direction: z
      .enum(["asc", "desc"])
      .optional()
      .describe("Sort direction"),
  },
  async (params) => {
    const query: Record<string, string> = {};
    if (params.page) query.page = String(params.page);
    if (params.per_page) query.per_page = String(params.per_page);
    if (params.email_addresses)
      query["email_addresses[]"] = params.email_addresses;
    if (params.sort_by) query.sort_by = params.sort_by;
    if (params.sort_direction) query.sort_direction = params.sort_direction;
    return handleError(() => client.listPeople(query));
  }
);

server.tool(
  "get_person",
  "Get a specific person by ID",
  {
    id: z.number().describe("The person's Salesloft ID"),
  },
  async ({ id }) => {
    return handleError(() => client.getPerson(id));
  }
);

server.tool(
  "create_person",
  "Create a new person in Salesloft",
  {
    email_address: z.string().describe("Email address (required)"),
    first_name: z.string().optional().describe("First name"),
    last_name: z.string().optional().describe("Last name"),
    phone: z.string().optional().describe("Phone number"),
    title: z.string().optional().describe("Job title"),
    city: z.string().optional().describe("City"),
    state: z.string().optional().describe("State"),
    country: z.string().optional().describe("Country"),
    company_name: z.string().optional().describe("Company name"),
    linkedin_url: z.string().optional().describe("LinkedIn URL"),
    account_id: z.number().optional().describe("Associated account ID"),
  },
  async (params) => {
    return handleError(() => client.createPerson(params));
  }
);

server.tool(
  "update_person",
  "Update an existing person in Salesloft",
  {
    id: z.number().describe("The person's Salesloft ID"),
    email_address: z.string().optional().describe("Email address"),
    first_name: z.string().optional().describe("First name"),
    last_name: z.string().optional().describe("Last name"),
    phone: z.string().optional().describe("Phone number"),
    title: z.string().optional().describe("Job title"),
    city: z.string().optional().describe("City"),
    state: z.string().optional().describe("State"),
    country: z.string().optional().describe("Country"),
    company_name: z.string().optional().describe("Company name"),
    linkedin_url: z.string().optional().describe("LinkedIn URL"),
    account_id: z.number().optional().describe("Associated account ID"),
  },
  async ({ id, ...data }) => {
    return handleError(() => client.updatePerson(id, data));
  }
);

server.tool(
  "delete_person",
  "Delete a person from Salesloft",
  {
    id: z.number().describe("The person's Salesloft ID"),
  },
  async ({ id }) => {
    return handleError(() => client.deletePerson(id));
  }
);

// ════════════════════════════════════════════
//  ACCOUNTS
// ════════════════════════════════════════════

server.tool(
  "list_accounts",
  "List accounts in Salesloft",
  {
    page: z.number().optional().describe("Page number"),
    per_page: z.number().optional().describe("Results per page (max 100)"),
    domain: z.string().optional().describe("Filter by domain"),
    sort_by: z
      .string()
      .optional()
      .describe("Sort field (e.g. 'created_at', 'updated_at')"),
    sort_direction: z
      .enum(["asc", "desc"])
      .optional()
      .describe("Sort direction"),
  },
  async (params) => {
    const query: Record<string, string> = {};
    if (params.page) query.page = String(params.page);
    if (params.per_page) query.per_page = String(params.per_page);
    if (params.domain) query.domain = params.domain;
    if (params.sort_by) query.sort_by = params.sort_by;
    if (params.sort_direction) query.sort_direction = params.sort_direction;
    return handleError(() => client.listAccounts(query));
  }
);

server.tool(
  "get_account",
  "Get a specific account by ID",
  {
    id: z.number().describe("The account's Salesloft ID"),
  },
  async ({ id }) => {
    return handleError(() => client.getAccount(id));
  }
);

server.tool(
  "create_account",
  "Create a new account in Salesloft",
  {
    name: z.string().describe("Account name (required)"),
    domain: z.string().optional().describe("Company domain"),
    company_type: z.string().optional().describe("Company type"),
    industry: z.string().optional().describe("Industry"),
    city: z.string().optional().describe("City"),
    state: z.string().optional().describe("State"),
    country: z.string().optional().describe("Country"),
    description: z.string().optional().describe("Description"),
    website: z.string().optional().describe("Website URL"),
    linkedin_url: z.string().optional().describe("LinkedIn URL"),
    phone: z.string().optional().describe("Phone number"),
    size: z.string().optional().describe("Company size"),
  },
  async (params) => {
    return handleError(() => client.createAccount(params));
  }
);

server.tool(
  "update_account",
  "Update an existing account in Salesloft",
  {
    id: z.number().describe("The account's Salesloft ID"),
    name: z.string().optional().describe("Account name"),
    domain: z.string().optional().describe("Company domain"),
    company_type: z.string().optional().describe("Company type"),
    industry: z.string().optional().describe("Industry"),
    city: z.string().optional().describe("City"),
    state: z.string().optional().describe("State"),
    country: z.string().optional().describe("Country"),
    description: z.string().optional().describe("Description"),
    website: z.string().optional().describe("Website URL"),
    linkedin_url: z.string().optional().describe("LinkedIn URL"),
    phone: z.string().optional().describe("Phone number"),
    size: z.string().optional().describe("Company size"),
  },
  async ({ id, ...data }) => {
    return handleError(() => client.updateAccount(id, data));
  }
);

// ════════════════════════════════════════════
//  CADENCES
// ════════════════════════════════════════════

server.tool(
  "list_cadences",
  "List cadences in Salesloft",
  {
    page: z.number().optional().describe("Page number"),
    per_page: z.number().optional().describe("Results per page (max 100)"),
    sort_by: z
      .string()
      .optional()
      .describe("Sort field (e.g. 'created_at', 'updated_at')"),
    sort_direction: z
      .enum(["asc", "desc"])
      .optional()
      .describe("Sort direction"),
  },
  async (params) => {
    const query: Record<string, string> = {};
    if (params.page) query.page = String(params.page);
    if (params.per_page) query.per_page = String(params.per_page);
    if (params.sort_by) query.sort_by = params.sort_by;
    if (params.sort_direction) query.sort_direction = params.sort_direction;
    return handleError(() => client.listCadences(query));
  }
);

server.tool(
  "get_cadence",
  "Get a specific cadence by ID",
  {
    id: z.number().describe("The cadence's Salesloft ID"),
  },
  async ({ id }) => {
    return handleError(() => client.getCadence(id));
  }
);

// ════════════════════════════════════════════
//  CADENCE MEMBERSHIPS
// ════════════════════════════════════════════

server.tool(
  "add_person_to_cadence",
  "Add a person to a cadence",
  {
    person_id: z.number().describe("The person's Salesloft ID"),
    cadence_id: z.number().describe("The cadence's Salesloft ID"),
  },
  async ({ person_id, cadence_id }) => {
    return handleError(() =>
      client.addPersonToCadence(person_id, cadence_id)
    );
  }
);

server.tool(
  "list_cadence_memberships",
  "List cadence memberships with optional filters",
  {
    page: z.number().optional().describe("Page number"),
    per_page: z.number().optional().describe("Results per page (max 100)"),
    person_id: z
      .number()
      .optional()
      .describe("Filter by person ID"),
    cadence_id: z
      .number()
      .optional()
      .describe("Filter by cadence ID"),
  },
  async (params) => {
    const query: Record<string, string> = {};
    if (params.page) query.page = String(params.page);
    if (params.per_page) query.per_page = String(params.per_page);
    if (params.person_id) query.person_id = String(params.person_id);
    if (params.cadence_id) query.cadence_id = String(params.cadence_id);
    return handleError(() => client.listCadenceMemberships(query));
  }
);

// ════════════════════════════════════════════
//  ACTIVITIES
// ════════════════════════════════════════════

server.tool(
  "list_calls",
  "List call activities in Salesloft",
  {
    page: z.number().optional().describe("Page number"),
    per_page: z.number().optional().describe("Results per page (max 100)"),
    sort_by: z
      .string()
      .optional()
      .describe("Sort field (e.g. 'created_at')"),
    sort_direction: z
      .enum(["asc", "desc"])
      .optional()
      .describe("Sort direction"),
  },
  async (params) => {
    const query: Record<string, string> = {};
    if (params.page) query.page = String(params.page);
    if (params.per_page) query.per_page = String(params.per_page);
    if (params.sort_by) query.sort_by = params.sort_by;
    if (params.sort_direction) query.sort_direction = params.sort_direction;
    return handleError(() => client.listCalls(query));
  }
);

server.tool(
  "list_emails",
  "List email activities in Salesloft",
  {
    page: z.number().optional().describe("Page number"),
    per_page: z.number().optional().describe("Results per page (max 100)"),
    sort_by: z
      .string()
      .optional()
      .describe("Sort field (e.g. 'created_at')"),
    sort_direction: z
      .enum(["asc", "desc"])
      .optional()
      .describe("Sort direction"),
  },
  async (params) => {
    const query: Record<string, string> = {};
    if (params.page) query.page = String(params.page);
    if (params.per_page) query.per_page = String(params.per_page);
    if (params.sort_by) query.sort_by = params.sort_by;
    if (params.sort_direction) query.sort_direction = params.sort_direction;
    return handleError(() => client.listEmails(query));
  }
);

// ════════════════════════════════════════════
//  USERS
// ════════════════════════════════════════════

server.tool(
  "list_users",
  "List users in your Salesloft team",
  {
    page: z.number().optional().describe("Page number"),
    per_page: z.number().optional().describe("Results per page (max 100)"),
  },
  async (params) => {
    const query: Record<string, string> = {};
    if (params.page) query.page = String(params.page);
    if (params.per_page) query.per_page = String(params.per_page);
    return handleError(() => client.listUsers(query));
  }
);

server.tool(
  "get_user",
  "Get a specific Salesloft team user by ID",
  {
    id: z.number().describe("The user's Salesloft ID"),
  },
  async ({ id }) => {
    return handleError(() => client.getUser(id));
  }
);

// ── Start server ──
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
