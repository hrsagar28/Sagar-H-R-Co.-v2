// Government portals listed on the Resources page. Checked with HTTP requests
// on 6 October 2026 (mca.gov.in in a browser, as it refuses scripted requests).

export interface PortalLink {
  name: string;
  /** What it is for, in a few words. */
  use: string;
  url: string;
}

export const PORTAL_GROUPS: { name: string; links: PortalLink[] }[] = [
  {
    name: 'Income tax',
    links: [
      { name: 'Income-tax e-filing', use: 'Returns, refunds, notices', url: 'https://www.incometax.gov.in/' },
      {
        name: 'Income Tax Department',
        use: 'The Act, Rules, forms and circulars',
        url: 'https://www.incometaxindia.gov.in/',
      },
      { name: 'TRACES', use: 'TDS statements and certificates', url: 'https://www.tdscpc.gov.in/' },
      {
        name: 'PAN (Protean)',
        use: 'Apply for or correct a PAN',
        url: 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html',
      },
      { name: 'PAN (UTIITSL)', use: 'Apply for or correct a PAN', url: 'https://www.pan.utiitsl.com/PAN/' },
    ],
  },
  {
    name: 'GST',
    links: [
      { name: 'GST portal', use: 'Returns, payments, registration', url: 'https://www.gst.gov.in/' },
      { name: 'CBIC GST', use: 'Rate notifications and circulars', url: 'https://cbic-gst.gov.in/' },
      { name: 'E-way bill', use: 'Generate e-way bills', url: 'https://ewaybillgst.gov.in/' },
      { name: 'E-invoice', use: 'Register invoices', url: 'https://einvoice1.gst.gov.in/' },
      { name: 'GST Appellate Tribunal', use: 'Appeals', url: 'https://gstat.gov.in/' },
    ],
  },
  {
    name: 'Registrations and payroll',
    links: [
      { name: 'MCA', use: 'Company and LLP filings', url: 'https://www.mca.gov.in/' },
      { name: 'Udyam', use: 'MSME registration', url: 'https://udyamregistration.gov.in/' },
      { name: 'NGO Darpan', use: 'Registration of NGOs', url: 'https://ngodarpan.gov.in/' },
      { name: 'EPFO', use: 'Provident fund for employers', url: 'https://unifiedportal-emp.epfindia.gov.in/' },
      { name: 'ESIC', use: 'Employees’ State Insurance', url: 'https://www.esic.gov.in/' },
      { name: 'ICAI UDIN', use: 'Verify a CA’s document', url: 'https://udin.icai.org/' },
    ],
  },
];
