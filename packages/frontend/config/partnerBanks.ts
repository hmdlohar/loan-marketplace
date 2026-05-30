/** Partner lender logos — SVGs from Wikimedia Commons (Category: SVG logos of banks in India). */
export const PARTNER_BANKS_DIR = "/partner-banks";

export type PartnerBank = {
  id: string;
  name: string;
  logo: string;
};

export const partnerBanks: PartnerBank[] = [
  { id: "sbi", name: "State Bank of India", logo: `${PARTNER_BANKS_DIR}/sbi.svg` },
  { id: "hdfc", name: "HDFC Bank", logo: `${PARTNER_BANKS_DIR}/hdfc.svg` },
  { id: "icici", name: "ICICI Bank", logo: `${PARTNER_BANKS_DIR}/icici.svg` },
  { id: "axis", name: "Axis Bank", logo: `${PARTNER_BANKS_DIR}/axis.svg` },
  { id: "pnb", name: "Punjab National Bank", logo: `${PARTNER_BANKS_DIR}/pnb.svg` },
  { id: "canara", name: "Canara Bank", logo: `${PARTNER_BANKS_DIR}/canara.svg` },
  { id: "union-bank", name: "Union Bank of India", logo: `${PARTNER_BANKS_DIR}/union-bank.svg` },
  { id: "indusind", name: "IndusInd Bank", logo: `${PARTNER_BANKS_DIR}/indusind.svg` },
  { id: "yes-bank", name: "Yes Bank", logo: `${PARTNER_BANKS_DIR}/yes-bank.svg` },
  { id: "federal", name: "Federal Bank", logo: `${PARTNER_BANKS_DIR}/federal.svg` },
  { id: "rbl", name: "RBL Bank", logo: `${PARTNER_BANKS_DIR}/rbl.svg` },
  { id: "bandhan", name: "Bandhan Bank", logo: `${PARTNER_BANKS_DIR}/bandhan.svg` },
  { id: "bom", name: "Bank of Maharashtra", logo: `${PARTNER_BANKS_DIR}/bom.svg` },
];
