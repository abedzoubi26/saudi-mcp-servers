/**
 * Canned responses for WATHQ_MOCK=true.
 *
 * Modeled on REAL sandbox responses (deliberately sparse — empty arrays,
 * omitted nested blocks) rather than the fat OpenAPI examples, so mock
 * mode exercises the same defensive parsing as production.
 *
 * Keyed by the first path segment (info, fullinfo, status, ...).
 */
export const MOCK_RESPONSES: Record<string, unknown> = {
  info: {
    crNationalNumber: "7000850920",
    crNumber: "4030010781",
    versionNo: 1,
    name: "شركة اختبار للتجارة",
    isMain: true,
    issueDateGregorian: "1976-12-07",
    issueDateHijri: "16-12-1396",
    inLiquidationProcess: false,
    hasEcommerce: false,
    headquarterCityId: 18,
    headquarterCityName: "جدة",
    isLicenseBased: false,
    entityType: {
      id: 1,
      name: "شركة",
      formId: 3,
      formName: "توصية بسيطة",
      characters: [],
    },
    status: { id: 1, name: "نشط" },
    activities: [],
  },
  fullinfo: {
    crNationalNumber: "7000850920",
    crNumber: "4030010781",
    versionNo: 1,
    name: "شركة اختبار للتجارة",
    crCapital: 150000,
    companyDuration: 5,
    isMain: true,
    issueDateGregorian: "1976-12-07",
    issueDateHijri: "16-12-1396",
    inLiquidationProcess: false,
    hasEcommerce: false,
    headquarterCityName: "جدة",
    entityType: {
      id: 1,
      name: "شركة",
      formId: 3,
      formName: "توصية بسيطة",
      characters: [],
    },
    status: { id: 1, name: "نشط" },
    activities: [],
    contactInfo: { phoneNo: null, mobileNo: null, email: null, websiteUrl: null },
    parties: [
      {
        name: "عبدالعزيز احمد الثنيان",
        typeId: 1,
        typeName: "فرد سعودي",
        identity: { id: "1101552388", typeId: 1, typeName: "هوية وطنية" },
        nationality: { id: 113, name: "السعودية" },
        partnership: [{ id: 2, name: "شريك متضامن" }],
        partnerShare: { cashContributionCount: 250, inKindContributionCount: 250, totalContributionCount: 500 },
        crNumber: null,
      },
    ],
    management: {
      structureId: 1,
      structureName: "مدير",
      managers: [
        {
          name: "عبدالعزيز احمد الثنيان",
          typeId: 1,
          typeName: "فرد سعودي",
          isLicensed: true,
          identity: { id: "1101552388", typeId: 1, typeName: "هوية وطنية" },
          nationality: { id: 113, name: "السعودية" },
          positions: [],
        },
      ],
    },
  },
  status: { id: 1, name: "نشط" },
  capital: {
    currencyId: 1,
    currencyName: "ريال سعودي",
    capital: 150000,
  },
  managers: [
    {
      name: "عبدالعزيز احمد الثنيان",
      typeId: 1,
      typeName: "سعودي",
      isLicensed: true,
      identity: { id: "1101552388", typeId: 1, typeName: "هوية وطنية" },
      positions: [{ id: 8, name: "عضو" }],
    },
  ],
  owners: [
    {
      name: "عبدالعزيز احمد الثنيان",
      typeId: 1,
      typeName: "فرد سعودي",
      identity: { id: "1101552388", typeId: 1, typeName: "هوية وطنية" },
      nationality: { id: 113, name: "السعودية" },
      partnership: [{ id: 2, name: "شريك متضامن" }],
      partnerShare: {
        cashContributionCount: 250,
        inKindContributionCount: 250,
        totalContributionCount: 500,
      },
      crNumber: null,
    },
  ],
  branches: [],
  owns: { ownsCr: true },
  related: { result: { count: 0 }, related: [] },
};
