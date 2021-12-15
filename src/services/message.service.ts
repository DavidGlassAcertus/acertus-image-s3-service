import { MessageContent } from '../models/MessageContent';
import { ResourceService } from './resource.service';

export class MessageService {
  resourceService: ResourceService;
  constructor() {
    this.resourceService = new ResourceService();
  }

  async addMessageContent(
    content: MessageContent, 
    file: any
  ): Promise<any>{
    try {
        // if content.asset is specified, override the file name with it 
        // (remember to keep extension in content.asset when sending)
        file.name = content.asset || file.name;

        await this.resourceService.uploadResource(`${content.folder}`,file, 50);
        return content;
    }
    catch(e){
      // TODO: error handling
      console.log(e);
    }
    return null;    
  }
}
