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

    const { blobUrl } = await req.json();
    
    if (!blobUrl) {
      throw new Error("blobUrl is required");
    }

    // Extract blob name from URL
    // URL format: https://{account}.blob.core.windows.net/{container}/{blobName}
    const urlParts = new URL(blobUrl);
    const pathParts = urlParts.pathname.split('/').filter(Boolean);
    
    if (pathParts.length < 2) {
      throw new Error("Invalid blob URL format");
    }
    
    const container = pathParts[0];
    const blobName = pathParts.slice(1).join('/');

    // Generate SAS token with 1 hour expiry
    const now = new Date();
    const expiryTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    const startTime = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const expiry = expiryTime.toISOString().replace(/\.\d{3}Z$/, 'Z');
    
    // Permissions: read only
    const permissions = "r";
    
    // String to sign for SAS
    const stringToSign = [
      permissions,           // sp (permissions)
      startTime,             // st (start time)
      expiry,                // se (expiry time)
      `/blob/${accountName}/${container}/${blobName}`, // canonicalized resource
      "",                    // si (identifier)
      "",                    // sip (IP)
      "https",               // spr (protocol)
      "2020-10-02",          // sv (version)
      "",                    // sr (resource - deprecated for blob)
      "",                    // rscc
      "",                    // rscd
      "",                    // rsce
      "",                    // rscl
      "",                    // rsct
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

    // Build SAS query string
    const sasParams = new URLSearchParams({
      sv: "2020-10-02",
      st: startTime,
      se: expiry,
      sr: "b",
      sp: permissions,
      spr: "https",
      sig: signatureBase64,
    });

    const signedUrl = `${blobUrl}?${sasParams.toString()}`;

    return new Response(
      JSON.stringify({
        success: true,
        signedUrl,
        expiresAt: expiry,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("SAS generation error:", error);
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
