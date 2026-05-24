import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // ⚡ INJECTING DYNAMIC PROMPT RECEIVED FROM FRONTEND
    const { propertyId, stepId, imageBase64, prompt } = body;

    if (!imageBase64 || !stepId) {
      return NextResponse.json({ success: false, message: "Missing payload attributes." }, { status: 400 });
    }

    const base64Data = imageBase64.split(",")[1] || imageBase64;

    // ==========================================
    // 🤖 STAGE 1: DYNAMIC GEMINI VISION API CALL
    // ==========================================
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        prompt, // Using the dynamic configured prompt structure
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Data
          }
        }
      ]
    });

    const aiTextResponse = response.text || "{}";
    
    // Cleaning codeblock markdown wrappers if returned by AI
    const cleanJsonString = aiTextResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedAI;
    try {
      parsedAI = JSON.parse(cleanJsonString);
    } catch (e) {
      console.error("JSON parsing error from Gemini raw content:", aiTextResponse);
      parsedAI = { isValid: false, reason: "AI response processing structural failure. Please recapturing clear angle." };
    }

    // 🚨 IF VERIFICATION FAILS: Return exact validation failure reason to frontend
    if (!parsedAI.isValid) {
      return NextResponse.json({
        success: true,
        aiVerified: false,
        message: parsedAI.reason || "Image does not match this property section. Please retake."
      });
    }

    // ==========================================
    // ☁️ STAGE 2: CLOUDINARY SECURE UPLOAD
    // ==========================================
    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: `kma-properties/${propertyId}`, 
      public_id: `verified-${stepId}-${Date.now()}`,
      resource_type: "image"
    });

    const cloudinaryPublicUrl = uploadResponse.secure_url;

    // ==========================================
    // 🚀 STAGE 3: RETURN SUCCESS + SECURE LINK
    // ==========================================
    return NextResponse.json({
      success: true,
      aiVerified: true,
      s3Url: cloudinaryPublicUrl, 
      message: "Image verified by AI and saved successfully!"
    });

  } catch (error) {
    console.error("Next.js Cloudinary pipeline error:", error);
    return NextResponse.json({ success: false, message: "Internal server execution failure." }, { status: 500 });
  }
}