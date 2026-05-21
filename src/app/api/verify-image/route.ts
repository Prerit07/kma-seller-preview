import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from "cloudinary";

// 1. Cloudinary Client Configuration Initialize
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

// 2. Google Gemini AI SDK Initialize
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

// Next.js Config: Body parser limit kardo 50mb taaki base64 block na ho
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
    const { propertyId, stepId, stepLabel, imageBase64 } = body;

    if (!imageBase64 || !stepId) {
      return NextResponse.json({ success: false, message: "Missing payload attributes." }, { status: 400 });
    }

    // Base64 patterns clean parsing strings
    const base64Data = imageBase64.split(",")[1] || imageBase64;
    const mimeType = imageBase64.split(",")[0].split(":")[1]?.split(";")[0] || "image/jpeg";

    // ==========================================
    // 🧠 STAGE 1: GEMINI AI INSPECTION SYSTEM
    // ==========================================
    const systemPrompt = `
      You are an expert real estate inspection auditor. Analyze this image captured for: "${stepLabel}" (${stepId}).
      
      Verification Matching:
      - If stepId is "entrance", verify if the picture shows a building front facade, main gate, exterior walls, or porch.
      - If stepId is "living", verify if the picture shows an indoor living hall, seating space, sofa layouts, or TV units.
      - If stepId is "kitchen", verify if the picture shows kitchen platforms, countertops, cooking stoves, or sinks.
      - If stepId is "bedroom", verify if the picture shows a bed, pillows, mattresses, or bedroom layout.
      
      Strict JSON Rule: Return ONLY a raw JSON string object without backticks or markdown wraps like \`\`\`json.
      JSON structure:
      {
        "aiVerified": true or false,
        "message": "A brief explanation sentence why it passed or failed."
      }
    `;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        systemPrompt,
        {
          inlineData: { data: base64Data, mimeType: mimeType }
        }
      ]
    });

    const responseText = aiResponse?.text ? aiResponse.text.trim() : null;
    if (!responseText) {
      return NextResponse.json({ success: false, aiVerified: false, message: "AI did not return valid response data." });
    }

    const parsedAI = JSON.parse(responseText);

    // 🚨 IF AI FAILS: Return rejection alert immediately without uploading to Cloudinary
    if (!parsedAI.aiVerified) {
      return NextResponse.json({
        success: true,
        aiVerified: false,
        message: parsedAI.message || "Image does not match this property section. Please retake."
      });
    }

    // ==========================================
    // ☁️ STAGE 2: CLOUDINARY SECURE UPLOAD
    // ==========================================
    // Cloudinary directly base64 data URI format ko accept karta hai
    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: `kma-properties/${propertyId}`, // Cloudinary pe clean folder structure ban jayega
      public_id: `verified-${stepId}-${Date.now()}`,
      resource_type: "image"
    });

    // Cloudinary se permanent public secure URL mil gaya
    const cloudinaryPublicUrl = uploadResponse.secure_url;

    // ==========================================
    // 🚀 STAGE 3: RETURN SUCCESS + CLOUDINARY URL
    // ==========================================
    return NextResponse.json({
      success: true,
      aiVerified: true,
      s3Url: cloudinaryPublicUrl, // Key name 's3Url' hi rakha hai taaki frontend par kuch change na karna pade
      message: "Image verified by AI and saved to Cloudinary successfully!"
    });

  } catch (error) {
    console.error("Next.js Cloudinary pipeline error:", error);
    return NextResponse.json({ success: false, message: "Internal integration crash." }, { status: 500 });
  }
}