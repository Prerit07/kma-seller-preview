export type ReferralStatus = "Pending" | "In Process" | "Deal Closed";

export type PropertyTypeOption = "Buy" | "Sell" | "Rent";

export type StoredReferral = {
  referralId: string;
  referrerName: string;
  referrerPhone: string;
  clientName: string;
  clientMobile: string;
  propertyType: PropertyTypeOption;
  location: string;
  channelPartnerId: string;
  channelPartnerName?: string;
  status: ReferralStatus;
  coinsEarned: number;
  submittedAt: string;
  /** When true, appears under Channel Partner Referrals tab */
  viaPartner: boolean;
};

export type ReferrerProfile = {
  name: string;
  phone: string;
};
