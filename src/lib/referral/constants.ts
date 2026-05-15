/** 1 coin = ₹10 (matches existing Refer & Earn copy) */
export const RUPEE_PER_COIN = 1000;

/** Shown on confirmation until deal-specific rules exist */
export const EXPECTED_COINS_ON_DEAL_CLOSE = 500;

/** Minimum redeem — placeholder until product decides */
export const MIN_REDEEM_COINS = 500;

export const STORAGE_KEYS = {
  uniqueUserId: "kma_referral_unique_id",
  referrals: "kma_referral_submissions",
  referrerProfile: "kma_referrer_saved_profile",
} as const;
