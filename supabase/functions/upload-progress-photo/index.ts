import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accountName = Deno.env.get("AZURE_STORAGE_ACCOUNT_NAME");
    const accountKey = Deno.env.get("AZURE_STORAGE_ACCOUNT_KEY");
    const containerName = Deno.env.get("AZURE_STORAGE_CONTAINER_NAME") || "progress-photos";

    if (!accountName || !accountKey) {
      throw new Error("Azure Storage credentials not configured");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const clientId = formData.get("clientId") as string;
    const poseType = formData.get("poseType") as string;

    if (!file || !clientId) {
      throw new Error("File and clientId are required");
    }

    // Generate unique blob name
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "jpg";
    const blobName = `${clientId}/${timestamp}-${poseType}.${extension}`;

    // Create the blob URL
    const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;

    // Create authorization header using Shared Key
    const dateHeader = new Date().toUTCString();
    const contentLength = file.size.toString();
    const contentType = file.type || "image/jpeg";

    // String to sign for PUT blob
    const stringToSign = [
      "PUT",
      "", // Content-Encoding
      "", // Content-Language
      contentLength, // Content-Length
      "", // Content-MD5
      contentType, // Content-Type
      "", // Date
      "", // If-Modified-Since
      "", // If-Match
      "", // If-None-Match
      "", // If-Unmodified-Since
      "", // Range
      `x-ms-blob-type:BlockBlob`,
      `x-ms-date:${dateHeader}`,
      `x-ms-version:2020-10-02`,
      `/${accountName}/${containerName}/${blobName}`,
    ].join("\n");

    // Create HMAC-SHA256 signature
    const encoder = new TextEncoder();
    const keyData = Uint8Array.from(atob(accountKey), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(stringToSign));
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

    const authorizationHeader = `SharedKey ${accountName}:${signatureBase64}`;

    // Upload to Azure Blob Storage
    const fileBuffer = await file.arrayBuffer();
    const uploadResponse = await fetch(blobUrl, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "x-ms-date": dateHeader,
        "x-ms-version": "2020-10-02",
        "Content-Type": contentType,
        "Content-Length": contentLength,
        "Authorization": authorizationHeader,
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Azure upload error:", errorText);
      throw new Error(`Failed to upload to Azure: ${uploadResponse.status}`);
    }

    // Return the public URL
    return new Response(
      JSON.stringify({
        success: true,
        photoUrl: blobUrl,
        blobName,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
