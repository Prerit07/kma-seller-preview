import { NextRequest } from "next/server";

// Surepass occasionally returns ifsc_details: {} even when the account itself
// verifies. Razorpay's open IFSC API (no auth, public) reliably returns
// bank/branch info, so we use it as a fallback.
async function fetchIfscFallback(ifsc: string) {
  try {
    const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      bank: data.BANK ?? "",
      branch: data.BRANCH ?? "",
      city: data.CITY ?? "",
      address: data.ADDRESS ?? "",
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const tokenFromEnv = process.env.SUREPASS_BEARER_TOKEN;
    const baseUrl = process.env.SUREPASS_BASE_URL;

    if (!tokenFromEnv || !baseUrl) {
      return Response.json(
        { error: "Missing Surepass environment variables" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { account_number, ifsc, beneficiary_name } = body;

    if (!account_number || !ifsc) {
      return Response.json(
        { error: "account_number and ifsc are required" },
        { status: 400 }
      );
    }

    const ifscUpper = String(ifsc).toUpperCase();

    const res = await fetch(`${baseUrl}/api/v1/bank-verification/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenFromEnv}`,
      },
      body: JSON.stringify({
        id_number: account_number,
        ifsc: ifscUpper,
        beneficiary_name: beneficiary_name || "",
      }),
      cache: "no-store",
    });

    const json = await res.json();

    // Surepass sometimes returns ifsc_details: {} for valid accounts. Fill in
    // bank/branch from Razorpay's open IFSC API so downstream save doesn't
    // fail on the backend's bank_name required validation.
    if (json?.success && json?.data?.account_exists) {
      const details = json.data.ifsc_details ?? {};
      if (!details.bank || !details.branch) {
        const fallback = await fetchIfscFallback(ifscUpper);
        if (fallback) {
          json.data.ifsc_details = {
            ...fallback,
            ...details,
            bank: details.bank || fallback.bank,
            branch: details.branch || fallback.branch,
            city: details.city || fallback.city,
          };
        }
      }
    }

    return Response.json(json, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
