import { S3 } from 'aws-sdk';
import { contentType } from 'mime-types';
import { MessageContent } from '../models/MessageContent';
import { ThumbnailService } from './thumbnail.service';


export class ResourceService {
  private thumbnailService: ThumbnailService;
  constructor() {
    this.thumbnailService = new ThumbnailService();
  }

  async uploadResource(folderName: string, file: any, thumbnailSize: number) {
    const { name, data } = file;

    const resourceData = await this.uploadFile(data, `${folderName}/${name}`);

    return {
      key: resourceData.Key,
      url: resourceData.Location,
    };
  }

  private getFileExtension(filename: string): string{
    const i: number = filename.lastIndexOf('.');
    return filename.substring(i + 1, filename.length);
  }

  async streamS3AssetToResponse(res: any, content:MessageContent, thumbnailSize?: number){
    const mimeType = contentType(content.asset);
    const s3 = this.getS3Config();
    const params = {
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
      Key: `${content.folder}/${content.asset}`,
    }
    res.set({"Content-Type": mimeType});
    await s3.getObject(params).createReadStream().pipe(res);
  }

  async streamThumbnailToResponse(res: any, content:MessageContent, thumbnailSize?: number){
    const mimeType = contentType(content.asset);
    const s3 = this.getS3Config();
    const params = {
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
      Key: `${content.folder}/${content.asset}`,
    }
    res.set({"Content-Type": mimeType});
    const r = s3.getObject(params).createReadStream();
    let buffer = await this.streamToBuffer(r);
    if (thumbnailSize){
      buffer = await this.thumbnailService.createThumbnail(parseInt(thumbnailSize.toString()),buffer);
    }
    res.write(buffer, 'binary');
    res.end(null, 'binary');
  }

  private streamToBuffer(stream): Promise<any>{
    const _buf = [];
    return new Promise((resolve, reject) => {
      stream.on("data", (chunk) => _buf.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(_buf)));
      stream.on("error", (err) => reject(err));
    });
  }

  async uploadFile(dataBuffer: Buffer, filename: string) {
    const s3 = this.getS3Config();
    try{
        const uploadResult = await s3
          .upload({
            Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
            Body: dataBuffer,
            Key: `${filename}`,
            ACL: 'public-read',
            ContentDisposition: 'inline',
          })
          .promise();
        return uploadResult;
    }
    catch(e){
      console.log(e);
    }
  }

  getS3Config() {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
  }
}
