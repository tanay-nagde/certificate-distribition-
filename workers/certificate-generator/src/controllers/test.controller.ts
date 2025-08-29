import { Context } from 'hono'
import { ImageResponse } from 'workers-og'

interface TextOverlay {
  text: string
  x: number
  y: number
  fontSize: number
  color?: string
  fontFamily?: string
  fontWeight?:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900'
  textAlign?: 'left' | 'center' | 'right'
  maxWidth?: number
}

interface ImageConfig {
  imageUrl: string
  width: number
  height: number
  texts: TextOverlay[]
}

/** Generate HTML template for workers-og */
function generateHTMLTemplate(config: ImageConfig): string {
  const textElements = config.texts
    .filter(t => typeof t.text === 'string' && t.text.trim().length > 0)
    .map((t, idx) => {
      const fontFamily = t.fontFamily || 'Arial, sans-serif'
      
      const styles = [
        'position: absolute',
        `left: ${t.x}px`,
        `top: ${t.y}px`,
        `font-size: ${t.fontSize}px`,
        `color: ${t.color || '#000'}`,
        `font-weight: ${t.fontWeight || 'normal'}`,
        `text-align: ${t.textAlign || 'left'}`,
        t.maxWidth ? `max-width: ${t.maxWidth}px` : '',
        t.maxWidth ? 'white-space: normal' : 'white-space: nowrap',
        'line-height: 1.2',
        `font-family: ${fontFamily}`
      ].filter(Boolean).join('; ')

      return `<div style="${styles}">${t.text}</div>`
    })
    .join('')

  return `
    <div style="
      width: ${config.width}px;
      height: ${config.height}px;
      position: relative;
      background-image: url('${config.imageUrl}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      overflow: hidden;
    ">
      ${textElements}
    </div>
  `
}

/** Generate image using workers-og ImageResponse */
async function generateImage(config: ImageConfig): Promise<Response> {
  const html = generateHTMLTemplate(config)
  
  return new ImageResponse(html, {
    width: config.width,
    height: config.height,
    fonts: [
      {
        name: 'KGSimplytheBest',
        data: await fetch('https://res.cloudinary.com/dtcbbzlix/raw/upload/v1756121446/ddu12kud5dkvpo0eeevo.ttf').then(res => res.arrayBuffer()),
        weight: 400,
        style: 'normal',
      },
      // You can add more fonts here if needed
      // {
      //   name: 'Inter',
      //   data: await fetch('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2').then(res => res.arrayBuffer()),
      //   weight: 400,
      //   style: 'normal',
      // }
    ],
  })
}

/** Hono handler using workers-og */
export async function exampleWithFont(c: Context) {
  try {
    const config: ImageConfig = {
      imageUrl: 'https://cdn.slidemodel.com/wp-content/uploads/FF0417-01-free-certificate-template-16x9-1.jpg',
      width: 1280,
      height: 720,
      texts: [
        { 
          text: 'Hello World', 
          x: 100, 
          y: 50, 
          fontSize: 32, 
          color: '#fff', 
          fontWeight: 'bold',
          fontFamily: 'KGSimplytheBest'
        },
        { 
          text: 'Secondary Text', 
          x: 100, 
          y: 100, 
          fontSize: 18, 
          color: '#ffcc00', 
          maxWidth: 200,
          fontFamily: 'sans-serif'
        },
        { 
          text: 'Bottom Right', 
          x: 600, 
          y: 500, 
          fontSize: 24, 
          color: '#00ff00', 
          textAlign: 'right',
          fontFamily: 'sans-serif'
        },
      ],
    }

    const response = await generateImage(config)
    return response
  } catch (err) {
    console.error('Error generating image:', err)
    return c.json({ 
      error: 'Failed to generate image', 
      message: (err as Error).message 
    }, 500)
  }
}

// Alternative simpler approach using direct HTML
export async function exampleSimple(c: Context) {
  try {
    // Get parameters from query string or use defaults
    const url = new URL(c.req.url)
    const title = url.searchParams.get('title') || 'Hello World'
    const subtitle = url.searchParams.get('subtitle') || 'Secondary Text'
    const footer = url.searchParams.get('footer') || 'Bottom Right'

    const html = `
      <div style="
        width: 1280px;
        height: 720px;
        position: relative;
        background-image: url('https://cdn.slidemodel.com/wp-content/uploads/FF0417-01-free-certificate-template-16x9-1.jpg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        overflow: hidden;
      ">
        <div style="
          position: absolute;
          left: 100px;
          top: 50px;
          font-size: 32px;
          color: #fff;
          font-weight: bold;
          font-family: 'KGSimplytheBest', sans-serif;
        ">${title}</div>
        
        <div style="
          position: absolute;
          left: 100px;
          top: 100px;
          font-size: 18px;
          color: #ffcc00;
          max-width: 200px;
          font-family: sans-serif;
        ">${subtitle}</div>
        
        <div style="
          position: absolute;
          left: 600px;
          top: 500px;
          font-size: 24px;
          color: #00ff00;
          text-align: right;
          font-family: sans-serif;
        ">${footer}</div>
      </div>
    `

    return new ImageResponse(html, {
      width: 1280,
      height: 720,
      fonts: [
        {
          name: 'KGSimplytheBest',
          data: await fetch('https://res.cloudinary.com/dtcbbzlix/raw/upload/v1756121446/ddu12kud5dkvpo0eeevo.ttf').then(res => res.arrayBuffer()),
          weight: 400,
          style: 'normal',
        },
      ],
    })
  } catch (err) {
    console.error('Error generating image:', err)
    return c.json({ 
      error: 'Failed to generate image', 
      message: (err as Error).message 
    }, 500)
  }
}