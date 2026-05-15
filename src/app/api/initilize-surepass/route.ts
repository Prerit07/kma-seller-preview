export async function GET() {
  try {
    const tokenFromEnv = process.env.SUREPASS_BEARER_TOKEN;
    const baseUrl = process.env.SUREPASS_BASE_URL;

    if (!tokenFromEnv || !baseUrl) {
      return Response.json(
        { error: "Missing Surepass environment variables" },
        { status: 500 }
      );
    }

    const res = await fetch(`${baseUrl}/api/v1/digilocker/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenFromEnv}`,
      },
      body: JSON.stringify({
        data: {
          signup_flow: true,
          logo_url: process.env.NEXT_PUBLIC_APP_LOGO || "https://kmaglobalproperty.com/favicon.ico",
          skip_main_screen: false,
        },
      }),
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
