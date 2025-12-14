import {
  BlobSASPermissions,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import { NextResponse } from "next/server";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "audios";

function parseConnectionString(cs) {
  const obj = {};
  cs.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx > -1) {
      const key = part.substring(0, idx);
      const value = part.substring(idx + 1);
      obj[key] = value;
    }
  });
  return obj;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName") || `audio-${Date.now()}.webm`;

    const parts = parseConnectionString(connectionString);
    const accountName = parts.AccountName;
    const accountKey = parts.AccountKey;

    if (!accountName || !accountKey) {
      throw new Error("Invalid connection string");
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey
    );

    const timestamp = Date.now();
    const rand = Math.random().toString(36).substring(7);
    const blobName = `${timestamp}${rand}-${fileName}`;

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("rwc"),
        protocol: "https", // important
        startsOn: new Date(Date.now() - 60 * 1000), // 1 min back (clock drift protection)
        expiresOn: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
      sharedKeyCredential
    ).toString();

    const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
    const sasUrl = `${blobUrl}?${sasToken}`;

    return NextResponse.json({ sasUrl, blobUrl, blobName });
  } catch (error) {
    console.error("SAS ERROR →", error);
    return NextResponse.json(
      { error: "Failed to generate SAS token", message: error.message },
      { status: 500 }
    );
  }
}
