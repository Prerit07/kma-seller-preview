export async function GET(request: Request,{ params }: { params: { client_id: string } }) {
  try {
    const tokenFromEnv = process.env.SUREPASS_BEARER_TOKEN;
    const baseUrl = process.env.SUREPASS_BASE_URL;
    

    if (!tokenFromEnv || !baseUrl) {
      return Response.json(
        { error: "Missing Surepass environment variables" },
        { status: 500 }
      );
    }
    const res = await fetch(`${baseUrl}/api/v1/digilocker/download-aadhaar/${params.client_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenFromEnv}`,
      },
      cache: "no-store",
    });

    const json = await res.json();

    return Response.json(json, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
