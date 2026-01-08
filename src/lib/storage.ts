/**
 * Storage Service Abstraction Layer
 * 
 * Provides a unified interface for file storage operations that works with:
 * - Supabase Storage (current development)
 * - Azure Blob Storage (future production)
 * 
 * This abstraction allows seamless migration between storage providers.
 */

import { supabase } from "@/integrations/supabase/client";

export interface UploadResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
}

export interface StorageService {
  uploadFile(bucket: string, path: string, file: File): Promise<UploadResult>;
  uploadBase64(bucket: string, path: string, base64Data: string, contentType: string): Promise<UploadResult>;
  getPublicUrl(bucket: string, path: string): string;
  getSignedUrl(bucket: string, path: string, expiresIn?: number): Promise<string | null>;
  deleteFile(bucket: string, path: string): Promise<{ success: boolean; error?: string }>;
  listFiles(bucket: string, path?: string): Promise<{ data: string[]; error?: string }>;
}

/**
 * Supabase Storage implementation
 */
class SupabaseStorageService implements StorageService {
  async uploadFile(bucket: string, path: string, file: File): Promise<UploadResult> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      const url = this.getPublicUrl(bucket, data.path);
      return { success: true, path: data.path, url };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  async uploadBase64(
    bucket: string,
    path: string,
    base64Data: string,
    contentType: string
  ): Promise<UploadResult> {
    try {
      // Convert base64 to Uint8Array
      const base64WithoutPrefix = base64Data.replace(/^data:[^;]+;base64,/, "");
      const binaryString = atob(base64WithoutPrefix);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, bytes.buffer, {
          contentType,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      const url = this.getPublicUrl(bucket, data.path);
      return { success: true, path: data.path, url };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error("Error creating signed URL:", error);
        return null;
      }

      return data.signedUrl;
    } catch (err) {
      console.error("Error creating signed URL:", err);
      return null;
    }
  }

  async deleteFile(bucket: string, path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  async listFiles(bucket: string, path = ""): Promise<{ data: string[]; error?: string }> {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(path);

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data.map((file) => file.name) };
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }
}

/**
 * Azure Blob Storage implementation (future)
 * Uncomment and configure when migrating to Azure
 */
// class AzureStorageService implements StorageService {
//   private connectionString: string;
//   private containerBaseUrl: string;
//   
//   constructor(connectionString: string, containerBaseUrl: string) {
//     this.connectionString = connectionString;
//     this.containerBaseUrl = containerBaseUrl;
//   }
//   
//   async uploadFile(bucket: string, path: string, file: File): Promise<UploadResult> {
//     // Use @azure/storage-blob SDK
//     // const blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
//     // const containerClient = blobServiceClient.getContainerClient(bucket);
//     // const blockBlobClient = containerClient.getBlockBlobClient(path);
//     // await blockBlobClient.uploadData(await file.arrayBuffer());
//     throw new Error("Not implemented");
//   }
//   
//   getPublicUrl(bucket: string, path: string): string {
//     return `${this.containerBaseUrl}/${bucket}/${path}`;
//   }
//   
//   // ... implement other methods
// }

// Factory function
export function getStorageService(): StorageService {
  // Future: Check environment to determine which service to use
  // const provider = import.meta.env.VITE_STORAGE_PROVIDER;
  // if (provider === 'azure') {
  //   return new AzureStorageService(
  //     import.meta.env.VITE_AZURE_STORAGE_CONNECTION_STRING,
  //     import.meta.env.VITE_AZURE_STORAGE_BASE_URL
  //   );
  // }
  
  return new SupabaseStorageService();
}

// Export singleton instance
export const storageService = getStorageService();
