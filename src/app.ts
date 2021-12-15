import express from 'express';
import { MessageContent } from './models/MessageContent';
import bodyParser from 'body-parser';
import fileUploader from 'express-fileupload';
import { MessageService } from './services/message.service';
import { ResourceService } from './services/resource.service';

require('dotenv').config();
const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(fileUploader());
const port = 3001;

app.get('/', (req, res)=>{
  const {asset, folder, maxsize} = req.query;
  const content: MessageContent = <MessageContent>{asset, folder};
  const ms = maxsize? parseInt(maxsize as string) : null;
  const resourceService = new ResourceService();
  resourceService.streamThumbnailToResponse(res, content, ms);
})

app.post('/', (req, res) => {
    const content: MessageContent = req.body;
    const messageService = new MessageService();
    console.log(req.files);
    messageService.addMessageContent(content, req.files.file);
    res.send(content);
});

app.listen(port, () => {
  console.log(`Thumbnails service is running on port ${port}.`);
});