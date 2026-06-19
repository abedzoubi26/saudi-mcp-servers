import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiError } from "@saudi-mcp/shared";
import type { WathqClient } from "../client.js";
import { ID_TYPES } from "../schemas.js";

/**
 * Tool descriptions are written in ENGLISH on purpose: research shows
 * LLM tool-calling in Arabic is brittle, so the schema/description layer
 * stays English for reliable selection, while the DATA returned stays in
 * Arabic (the `language` arg defaults to "ar").
 */

const language = z
  .enum(["ar", "en"])
  .default("ar")
  .describe("Language of returned data. Defaults to Arabic ('ar').");

const crId = z
  .string()
  .describe(
    "Commercial Registration number or Unified National Number (10 digits). " +
      "Use the unified national number (starts with 700/7000) to find active and suspended records.",
  );

/** Wrap a handler so thrown ApiErrors become clean MCP text results. */
function toResult(data: unknown) {
  return {
    content: [
      { type: "text" as const, text: JSON.stringify(data, null, 2) },
    ],
  };
}

function toError(err: unknown) {
  const e =
    err instanceof ApiError
      ? err
      : new ApiError({
          kind: "unknown",
          service: "wathq",
          message: err instanceof Error ? err.message : String(err),
        });
  const hint = e.hint();
  const text =
    `Wathq error [${e.kind}` +
    (e.upstreamCode ? ` ${e.upstreamCode}` : "") +
    `]: ${e.message}` +
    (hint ? `\nHint: ${hint}` : "");
  return { content: [{ type: "text" as const, text }], isError: true };
}

export function registerTools(server: McpServer, client: WathqClient): void {
  server.tool(
    "wathq_get_company_info",
    "Get basic commercial registration data for a Saudi company: name, status, " +
      "entity type, activities, issue date, and headquarters city.",
    { id: crId, language },
    async ({ id, language }) => {
      try {
        return toResult(await client.info(id, language));
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.tool(
    "wathq_get_company_full_info",
    "Get the complete commercial registration record: everything in basic info " +
      "plus capital, company duration, contact information, and confirmation dates.",
    { id: crId, language },
    async ({ id, language }) => {
      try {
        return toResult(await client.fullInfo(id, language));
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.tool(
    "wathq_get_company_status",
    "Get only the current status of a commercial registration (e.g. active, suspended).",
    { id: crId, language },
    async ({ id, language }) => {
      try {
        return toResult(await client.status(id, language));
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.tool(
    "wathq_get_company_capital",
    "Get capital details for a commercial registration: currency, total capital, " +
      "and cash/in-kind contribution breakdown when available.",
    { id: crId, language },
    async ({ id, language }) => {
      try {
        return toResult(await client.capital(id, language));
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.tool(
    "wathq_get_company_managers",
    "Get the list of managers and board of directors for a commercial registration, " +
      "including names, identities, and positions.",
    { id: crId, language },
    async ({ id, language }) => {
      try {
        return toResult(await client.managers(id, language));
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.tool(
    "wathq_get_company_owners",
    "Get the owner of an establishment, or the list of partners and their ownership " +
      "shares for a company.",
    { id: crId, language },
    async ({ id, language }) => {
      try {
        return toResult(await client.owners(id, language));
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.tool(
    "wathq_get_company_branches",
    "Get the list of branches registered under a commercial registration.",
    { id: crId, language },
    async ({ id, language }) => {
      try {
        return toResult(await client.branches(id, language));
      } catch (err) {
        return toError(err);
      }
    },
  );

  const idType = z
    .enum(ID_TYPES)
    .describe("Type of the identifier being looked up.");

  const personId = z
    .string()
    .describe("Identification number of the person or entity (e.g. National ID).");

  server.tool(
    "wathq_get_related_registrations",
    "Find commercial registrations related to a given person or entity ID " +
      "(e.g. companies where someone is a partner or owner), with their relationship.",
    { id: personId, idType, language },
    async ({ id, idType, language }) => {
      try {
        return toResult(await client.related(id, idType, language));
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.tool(
    "wathq_check_ownership",
    "Check whether a given person or entity ID is an owner or partner in any " +
      "commercial registration. Returns true/false.",
    { id: personId, idType, language },
    async ({ id, idType, language }) => {
      try {
        return toResult(await client.owns(id, idType, language));
      } catch (err) {
        return toError(err);
      }
    },
  );
}
