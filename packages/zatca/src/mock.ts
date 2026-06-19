/**
 * Canned responses for ZATCA_MOCK=true.
 *
 * Modeled on real ZATCA sandbox responses — sparse, with empty arrays where
 * fields are absent — so mock mode exercises the same defensive parsing as
 * production.
 */
export const MOCK_RESPONSES = {
  complianceCsid: {
    requestID: 1234,
    dispositionMessage: "ISSUED",
    binarySecurityToken:
      "TUlJQ0FnWUJBZ0lJQUFBQUFBQUFBQUF3Q2dZSUtvWkl6ajBFQXdJd0pqRWtNQ0lHQTFVRUF4TXRZV3h3WVhOellYUXVlbUYwWTJFdVoyOTJMbU5oTG1GdVlXd3dIaGNOTWpRd056RTJNVEF3TURBd1doY05NalV3TnpFMk1UQXdNREF3V2pBUE1RMHdDd1lEVlFRREV3UlVaWE4wTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFbVVRb1kxVWdwM3NiSkpvNlhpZlNlV3NiSjlsTkFpcXFIM3VoUzFzZFlUQ2FNTFFZbHRWRGlHMWlSV2c3WjE0elBHV0tKNlYxZVN3T3dYR0xQb05kek1hT0JJVEFIZ0dBMVVkRGdRWU1CYUFGSmxtTnVNTlFMSmJNNzYya3N0Rmpld1R5OFVLTUFRR0ExVWRFd0VCL3dRQ01BQXdEZ1lEVlIwUEFRSC9CQVFEQWdlQU1Bc0dCeXFHU000OUJBTUNBMGtBTUVZQ0lRRFN0Y3ZId1h4dTZNQzJhSTF3L1RoeGhNeDhmeEVBQWNkZm5WN1JYMm5pNVFJaEFJVU5DV25RWWM0MVpQQVQrMnJaZVlQQkV4VmlzSkRKekdqWnNZN1lBeFhx",
    secret: "Cg9oZWxsby13b3JsZEAjMTIz",
    errors: [],
    warnings: [],
  },

  productionCsid: {
    requestID: 5678,
    dispositionMessage: "ISSUED",
    binarySecurityToken:
      "TUlJQ0FnWUJBZ0lJQUFBQUFBQUFBQUF3Q2dZSUtvWkl6ajBFQXdJd0pqRWtNQ0lHQTFVRUF4TXRZV3h3WVhOellYUXVlbUYwWTJFdVoyOTJMbU5oTG1GdVlXd3dIaGNOTWpRd056RTJNVEF3TURBd1doY05NalV3TnpFMk1UQXdNREF3V2pBUE1RMHdDd1lEVlFRREV3UlVaWE4wTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFbVVRb1kxVWdwM3NiSkpvNlhpZlNlV3NiSjlsTkFpcXFIM3VoUzFzZFlUQ2FNTFFZbHRWRGlHMWlSV2c3WjE0elBHV0tKNlYxZVN3T3dYR0xQb05kek1hT0JJVEFIZ0dBMVVkRGdRWU1CYUFGSmxtTnVNTlFMSmJNNzYya3N0Rmpld1R5OFVLTUFRR0ExVWRFd0VCL3dRQ01BQXdEZ1lEVlIwUEFRSC9CQVFEQWdlQU1Bc0dCeXFHU000OUJBTUNBMGtBTUVZQ0lRRFN0Y3ZId1h4dTZNQzJhSTF3L1RoeGhNeDhmeEVBQWNkZm5WN1JYMm5pNVFJaEFJVU5DV25RWWM0MVpQQVQrMnJaZVlQQkV4VmlzSkRKekdqWnNZN1lBeFhx",
    secret: "Cg9oZWxsby13b3JsZEAjMTIz",
    errors: [],
    warnings: [],
  },

  reporting: {
    reportingStatus: "REPORTED",
    validationResults: {
      infoMessages: [],
      warningMessages: [],
      errorMessages: [],
      status: "PASS",
    },
  },

  clearance: {
    clearanceStatus: "CLEARED",
    clearedInvoice:
      "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48SW52b2ljZS8+",
    validationResults: {
      infoMessages: [],
      warningMessages: [],
      errorMessages: [],
      status: "PASS",
    },
  },

  complianceCheck: {
    reportingStatus: "REPORTED",
    clearanceStatus: "CLEARED",
    validationResults: {
      infoMessages: [],
      warningMessages: [],
      errorMessages: [],
      status: "PASS",
    },
  },
};
