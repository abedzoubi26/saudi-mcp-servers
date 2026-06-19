import { z } from "zod";

/**
 * Schemas for Wathq Commercial Registration responses.
 *
 * IMPORTANT: real sandbox records are sparse. The OpenAPI examples show
 * fat objects, but live responses routinely return empty arrays and omit
 * nested objects entirely (observed: `activities: []`, `characters: []`,
 * no capital block). Therefore almost everything below is `.optional()`
 * or has a default, and unknown extra keys are allowed via `.passthrough()`
 * so upstream additions never break parsing.
 *
 * Arabic values are passed through verbatim — never matched on or rewritten.
 */

const codeName = z
  .object({
    id: z.union([z.number(), z.string()]).optional(),
    name: z.string().optional(),
  })
  .passthrough();

const hijriGregorian = z
  .object({
    gregorian: z.string().nullable().optional(),
    hijri: z.string().nullable().optional(),
  })
  .passthrough();

export const entityTypeSchema = z
  .object({
    id: z.union([z.number(), z.string()]).optional(),
    name: z.string().optional(),
    formId: z.union([z.number(), z.string()]).optional(),
    formName: z.string().optional(),
    characters: z.array(codeName).optional().default([]),
    characterList: z.array(codeName).optional().default([]),
  })
  .passthrough();

const identitySchema = z
  .object({
    id: z.string().optional(),
    typeId: z.union([z.number(), z.string()]).optional(),
    typeName: z.string().optional(),
  })
  .passthrough();

/** /info — basic record. */
export const infoSchema = z
  .object({
    crNationalNumber: z.string().optional(),
    crNumber: z.string().optional(),
    name: z.string().optional(),
    status: codeName.optional(),
    entityType: entityTypeSchema.optional(),
    activities: z.array(codeName).optional().default([]),
    issueDateGregorian: z.string().nullable().optional(),
    issueDateHijri: z.string().nullable().optional(),
    isMain: z.boolean().optional(),
    inLiquidationProcess: z.boolean().optional(),
    hasEcommerce: z.boolean().optional(),
    headquarterCityName: z.string().optional(),
  })
  .passthrough();

const partySchema = z
  .object({
    name: z.string().optional(),
    typeId: z.union([z.number(), z.string()]).optional(),
    typeName: z.string().optional(),
    identity: identitySchema.optional(),
    nationality: codeName.nullable().optional(),
    partnership: z.array(codeName).optional().default([]),
    partnerShare: z.record(z.unknown()).nullable().optional(),
    crNumber: z.string().nullable().optional(),
  })
  .passthrough();

/** /fullinfo — superset of info; we keep it permissive. */
export const fullInfoSchema = infoSchema
  .extend({
    crCapital: z.number().nullable().optional(),
    companyDuration: z.number().nullable().optional(),
    contactInfo: z
      .object({
        phoneNo: z.string().nullable().optional(),
        mobileNo: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        websiteUrl: z.string().nullable().optional(),
      })
      .passthrough()
      .optional(),
    confirmationDate: hijriGregorian.optional(),
    parties: z.array(partySchema).optional().default([]),
    management: z
      .object({
        structureId: z.union([z.number(), z.string()]).optional(),
        structureName: z.string().optional(),
        managers: z
          .array(
            z
              .object({
                name: z.string().optional(),
                typeId: z.union([z.number(), z.string()]).optional(),
                typeName: z.string().optional(),
                isLicensed: z.boolean().optional(),
                identity: identitySchema.optional(),
                nationality: codeName.nullable().optional(),
                positions: z.array(codeName).optional().default([]),
              })
              .passthrough(),
          )
          .optional()
          .default([]),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

/** /status — real response is a flat codeName object, not wrapped in { status: ... }. */
export const statusSchema = codeName;

/** /capital */
export const capitalSchema = z
  .object({
    currencyId: z.union([z.number(), z.string()]).optional(),
    currencyName: z.string().optional(),
    capital: z.number().nullable().optional(),
    contributionCapital: z.record(z.unknown()).optional(),
    stockCapital: z.record(z.unknown()).optional(),
  })
  .passthrough();

/** /managers — array. */
export const managersSchema = z.array(
  z
    .object({
      name: z.string().optional(),
      typeId: z.union([z.number(), z.string()]).optional(),
      typeName: z.string().optional(),
      isLicensed: z.boolean().optional(),
      identity: identitySchema.optional(),
      nationality: codeName.nullable().optional(),
      positions: z.array(codeName).optional().default([]),
    })
    .passthrough(),
);

/** /owners — array of owners/partners (real response, not the spec's single-object example). */
export const ownersSchema = z.array(
  z
    .object({
      name: z.string().optional(),
      typeId: z.union([z.number(), z.string()]).optional(),
      typeName: z.string().optional(),
      identity: identitySchema.optional(),
      nationality: codeName.nullable().optional(),
      partnership: z.array(codeName).optional().default([]),
      partnerShare: z.record(z.unknown()).nullable().optional(),
      crNumber: z.string().nullable().optional(),
    })
    .passthrough(),
);

/** /branches — array of branch records (kept permissive). */
export const branchesSchema = z.array(z.record(z.unknown()));

/** /owns/{id}/{idType} — boolean wrapper. */
export const ownsSchema = z
  .object({ ownsCr: z.boolean().optional() })
  .passthrough();

/** /related/{id}/{idType} — relations block (kept permissive). */
export const relatedSchema = z.record(z.unknown());

export const ID_TYPES = [
  "National_ID",
  "Resident_ID",
  "Passport",
  "GCC_ID",
  "Endowment_Deed_No",
  "license_No",
  "CR_National_ID",
  "Foreign_CR_No",
  "Gov_National_ID",
] as const;

export type IdType = (typeof ID_TYPES)[number];
export type Info = z.infer<typeof infoSchema>;
export type FullInfo = z.infer<typeof fullInfoSchema>;
