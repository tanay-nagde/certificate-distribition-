import { uploadimg } from './../../parser/src/controller/uploads.controller';
import { Hono } from 'hono';
import type { MyEnv } from '@packages/types'; // Assuming types are in a central file
import certificateRoutes from './routes/certificateRoutes';
import { errorHandler } from '@packages/middlewares/error'; // Assuming a central error handler


const app = new Hono<MyEnv>();

// Register the certificate generation routes
app.route('/generate', certificateRoutes);

import { ImageResponse } from 'workers-og'
import { uploadFileToCloudinary } from '@packages/cloudinary/cloudinary';


app.get('/', async (c) => {
 const html = `
<div style="
  display: flex;
  width: 100%;
  height: 100%;
  background-image: url('https://res.cloudinary.com/dtcbbzlix/image/upload/v1756302320/naoty9rmqa4benfpo6kn.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-family: sans-serif;
  overflow: hidden;
">
  <div style="position: relative; display:flex; width: 100%; height: 100%;">
    <p style="
      position: absolute;
      top: 402px;
      left: 412px;
      margin: 0;
      font-family: Arial, sans-serif;
      padding: 10;
      font-size: 16px;
      font-weight: bold;
      color: red;
      line-height: 1;
    ">enter your name</p>
   
  </div>
</div>
    `;

  const img =  new ImageResponse(html, {
    width: 1200,
    height: 800,
    
  })

  const arrayBuffer = await img.arrayBuffer();
  return new Response(arrayBuffer, {
    headers: {
      'Content-Type': 'image/png'
    }
  });

})



// Optional: Add a health check endpoint
app.get('/health', (c) => c.json({ status: 'ok' }));
app.route('/certificates', certificateRoutes);

// Register a global error handler
app.onError(errorHandler);

export default app;
