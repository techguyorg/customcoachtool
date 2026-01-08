/**
 * Environment Configuration
 * 
 * Centralized configuration that abstracts environment-specific settings.
 * This makes it easy to switch between Supabase (dev) and Azure (prod).
 */

export const config = {
  // API Configuration
  api: {
    // Current: Supabase functions URL
    // Future: Azure Functions URL
    baseUrl: import.meta.env.VITE_SUPABASE_URL,
    functionsPath: "/functions/v1",
  },

  // Authentication Provider
  auth: {
    // 'supabase' | 'azure_ad_b2c'
    provider: (import.meta.env.VITE_AUTH_PROVIDER as string) || "supabase",
  },

  // Database Provider
  database: {
    // 'supabase' | 'azure_sql'
    provider: (import.meta.env.VITE_DATABASE_PROVIDER as string) || "supabase",
  },

  // Storage Provider
  storage: {
    // 'supabase' | 'azure_blob'
    provider: (import.meta.env.VITE_STORAGE_PROVIDER as string) || "supabase",
  },

  // Email Configuration
  email: {
    // Gmail SMTP settings (used in edge functions)
    senderEmail: "s.susheel9@gmail.com",
    senderName: "CustomCoachPro",
  },

  // Feature Flags
  features: {
    enableEmailNotifications: true,
    enablePushNotifications: false,
    enableRealtime: true,
  },

  // Azure-specific configuration (for future migration)
  azure: {
    // These will be populated from environment variables when migrating
    functionsUrl: import.meta.env.VITE_AZURE_FUNCTIONS_URL || "",
    storageUrl: import.meta.env.VITE_AZURE_STORAGE_URL || "",
    adB2cTenant: import.meta.env.VITE_AZURE_AD_B2C_TENANT || "",
    adB2cClientId: import.meta.env.VITE_AZURE_AD_B2C_CLIENT_ID || "",
  },
} as const;

// Helper to check current environment
export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;

// Helper to check which provider is active
export const isUsingAzure = {
  auth: config.auth.provider === "azure_ad_b2c",
  database: config.database.provider === "azure_sql",
  storage: config.storage.provider === "azure_blob",
};
