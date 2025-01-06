import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: Request) {
  try {
    const userId = new URL(request.url).searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
      });
    }

    const bucketName = process.env.S3_BUCKET_NAME!;
    const prefix = `users/${userId}/`;

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const data = await s3Client.send(command);

    const files = (data.Contents || []).map((file) => ({
      name: file.Key?.split("/").pop(),
      size: file.Size,
      lastModified: file.LastModified,
      url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`,
      status: "Available",
    }));

    return new Response(JSON.stringify(files), { status: 200 });
  } catch (error) {
    console.error("Error fetching files:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch files" }), {
      status: 500,
    });
  }
}
