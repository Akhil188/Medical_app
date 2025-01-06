import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const createUserS3Folder = async (
  userId: string
): Promise<string | undefined | void> => {
  if (!userId) throw new Error("User ID is required.");

  const bucketName = process.env.S3_BUCKET_NAME!;
  const folderKey = `users/${userId}/`;

  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: folderKey,
        Body: "",
      },
    });

    await upload.done();
  } catch (error: any) {
    if (!error.message) return;
    return error.message;
  }
};
