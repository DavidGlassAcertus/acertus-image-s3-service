import { Injectable } from "@nestjs/common";
const sharp = require('sharp');
@Injectable()
export class ThumbnailService {
    public async createThumbnail(maxSize: number, buffer: any){
        try{
            return await sharp(buffer).resize({
                width: maxSize, 
                height: maxSize, 
                fit: "inside"
            }).toBuffer();
        }
        catch(e){
            console.log(e);
        }
    }
}