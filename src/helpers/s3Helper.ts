import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Result, random } from "helpers";

interface S3SetupResult {
  bucketName: string;
  s3Client: S3Client;
}

const SetUpS3 = (): S3SetupResult => {
  const bucketName = process.env.BUCKET_NAME;
  const bucketRegion = process.env.BUCKET_REGION;
  const accessKey = process.env.ACCESS_KEY;
  const secretAccessKey = process.env.SECRET_ACCESS_KEY;


  const s3Client = new S3Client({
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretAccessKey,
    },
    region: bucketRegion
  });

  return {
    bucketName: bucketName,
    s3Client: s3Client
  };

}

export const UploadMedia = async (file: Express.Multer.File): Promise<string> => {
  if (!file) {
    return null;
  }

  const { bucketName, s3Client } = SetUpS3();

  const params = {
    Bucket: bucketName,
    Key: random(),
    Body: file.buffer,
    ContentType: file.mimetype
  };


  const command = new PutObjectCommand(params);

  const [error, putObjectCommand] = await Result(s3Client.send(command));
  if (error) {
    throw new Error(error.message);
  }

  return params.Key;
};

export const getSignedUrlForMedia = async (key: string): Promise<string> => {
  if (!key) {
    return null;
  }

  const { bucketName, s3Client } = SetUpS3();

  const params = {
    Bucket: bucketName,
    Key: key,
  };


  const command = new GetObjectCommand(params);

  const [error, url] = await Result(getSignedUrl(s3Client, command, { expiresIn: 3600 }));
  if (error) {
    throw new Error(error.message);
  }

  return url;
};