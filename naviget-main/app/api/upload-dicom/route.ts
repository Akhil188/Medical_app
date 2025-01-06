import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { fileName, fileType, userId } = await request.json();

    const bucketName = process.env.S3_BUCKET_NAME!;
    const fileKey = `users/${userId}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 10 });

    return new Response(JSON.stringify({ url, fileKey }), { status: 200 });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate pre-signed URL" }),
      { status: 500 }
    );
  }
}
