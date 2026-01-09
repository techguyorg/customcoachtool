import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";

const connectionString = process.env.STORAGE_CONNECTION_STRING!;
const containerName = process.env.STORAGE_CONTAINER || "progress-photos";

function getBlobServiceClient(): BlobServiceClient {
  return BlobServiceClient.fromConnectionString(connectionString);
}

export async function uploadFile(
  blobName: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Ensure container exists
  await containerClient.createIfNotExists({ access: "blob" });

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.upload(data, data.length, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return blockBlobClient.url;
}

export async function deleteFile(blobName: string): Promise<void> {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.deleteIfExists();
}

export async function generateSasUrl(
  blobName: string,
  expiresInMinutes: number = 60
): Promise<string> {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);

  // Check if blob exists
  const exists = await blobClient.exists();
  if (!exists) {
    throw new Error("File not found");
  }

  // Generate SAS URL using user delegation or connection string approach
  const startsOn = new Date();
  const expiresOn = new Date(startsOn.getTime() + expiresInMinutes * 60 * 1000);

  // For connection string auth, we use a simpler approach
  const sasUrl = await blobClient.generateSasUrl({
    permissions: BlobSASPermissions.parse("r"),
    startsOn,
    expiresOn,
  });

  return sasUrl;
}

export function generateBlobName(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${userId}/${timestamp}-${sanitizedFileName}`;
}
