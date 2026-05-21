import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, verifiedImages } = body;

    if (!propertyId || !verifiedImages || !verifiedImages.length) {
      return NextResponse.json(
        { success: false, message: "Debug Error: Frontend se data missing hai." },
        { status: 400 }
      );
    }

    // ⚡ FIX 2 & 3: Views ko strict valid values me map kiya aur 'approvalStatus' ko hataya
    const formattedPhotos = verifiedImages.map((url: string, index: number) => {
      // Nest.js ke criteria ke hisab se mapping rules:
      let mappedView = 'Other';
      if (index === 0) mappedView = 'Living Room';    // 'entrance' -> 'Exterior'
      else if (index === 1) mappedView = 'Kitchen'; // 'living' -> 'Living Room'
      else if (index === 2) mappedView = 'Bedroom';     // 'kitchen' -> 'Kitchen'

      return {
        fileKey: url, 
        view: mappedView, // Strict DTO compliance check value matching
        isCoverImage: index === 0, 
        // approvalStatus hata diya kyunki Nest.js isko accept nahi karta frontend input me
      };
    });

    const NEST_BACKEND_URL = process.env.NEST_BACKEND_URL || "https://kmaglobalproperty.com/api/backend";
    const targetUrl = `${NEST_BACKEND_URL}/property/step-4`;

    // ⚡ FIX 1: Send ONLY what 'CreatePropertyStep4Dto' allows (No status, No isVerified)
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.get("Authorization") || "", 
      },
      body: JSON.stringify({
        propertyId: propertyId,
        photos: formattedPhotos,
        // status aur isVerified ko delete kar diya taaki DTO chill rahe
      }),
    });

    if (!response.ok) {
      let nestErrorDetails = "Unknown Server Error";
      try {
        const errJson = await response.json();
        nestErrorDetails = JSON.stringify(errJson);
      } catch (e) {
        const rawText = await response.text().catch(() => "Empty text response");
        nestErrorDetails = `Raw Server Text: ${rawText.slice(0, 150)}`;
      }

      return NextResponse.json(
        { 
          success: false, 
          message: `Nest.js Rejected [Status ${response.status}]. Reason: ${nestErrorDetails}` 
        },
        { status: response.status }
      );
    }

    const nestResult = await response.json();

    return NextResponse.json({
      success: true,
      message: "Synced smoothly using existing Nest.js pipeline!",
      data: nestResult
    });

  } catch (error: any) {
    console.error("Next.js bridge system crash:", error);
    return NextResponse.json(
      { success: false, message: `Next.js Internal Crash Log: ${error?.message || "Unknown Code Level Error"}` },
      { status: 500 }
    );
  }
}