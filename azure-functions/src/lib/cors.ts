import { HttpResponseInit } from "@azure/functions";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

export function corsResponse(status: number, body?: any): HttpResponseInit {
  return {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  };
}

export function corsOptionsResponse(): HttpResponseInit {
  return {
    status: 204,
    headers: corsHeaders,
  };
}

export function errorResponse(status: number, message: string): HttpResponseInit {
  return corsResponse(status, { error: message });
}

export function successResponse(data: any, status: number = 200): HttpResponseInit {
  return corsResponse(status, data);
}
