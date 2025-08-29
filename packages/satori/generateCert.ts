import satori from 'satori'

// TypeScript interfaces
interface TextOverlay {
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily?: string
  color?: string
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

interface SatoriElement {
  type: string
  props: {
    key?: string
    style: Record<string, any>
    children: any
  }
}

/**
 * Loads font data from URL
 */
async function loadFont(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load font: ${response.statusText}`)
  }
  return await response.arrayBuffer()
}

/**
 * Generates an image with text overlays using Satori
 */
async function generateImageWithTextOverlay(config: ImageConfig): Promise<Uint8Array> {
  const { imageUrl, width, height, texts } = config

  // Create text elements positioned absolutely
  const textElements: SatoriElement[] = texts.map(
    (textConfig: TextOverlay, index: number): SatoriElement => ({
      type: 'div',
      props: {
        key: `text-${index}`,
        style: {
          position: 'absolute',
          left: `${textConfig.x}px`,
          top: `${textConfig.y}px`,
          fontSize: `${textConfig.fontSize}px`,
          fontFamily: textConfig.fontFamily || 'Inter',
          color: textConfig.color || '#000000',
          fontWeight: textConfig.fontWeight || 'normal',
          textAlign: textConfig.textAlign || 'left',
          maxWidth: textConfig.maxWidth ? `${textConfig.maxWidth}px` : undefined,
          whiteSpace: textConfig.maxWidth ? 'normal' : 'nowrap',
          lineHeight: 1.2,
        },
        children: textConfig.text,
      },
    })
  )

  // Main container with background + texts
  const element: SatoriElement = {
    type: 'div',
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      },
      children: textElements,
    },
  }

  try {
    // Load font data (using Inter font from Google Fonts)
    const fontData = await loadFont(
      'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
    )

    // Generate the image using Satori
    const svg = await satori(element as any, {
      width,
      height,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    })

    // Return SVG as Uint8Array
    return new TextEncoder().encode(svg)
  } catch (error) {
    throw new Error(`Failed to generate image: ${error}`)
  }
}

/**
 * Alternative version that works without external font loading
 * Uses system fonts that Satori can handle better
 */
async function generateImageWithTextOverlaySimple(config: ImageConfig): Promise<Uint8Array> {
  const { imageUrl, width, height, texts } = config

  // Create text elements positioned absolutely
  const textElements: SatoriElement[] = texts.map(
    (textConfig: TextOverlay, index: number): SatoriElement => ({
      type: 'div',
      props: {
        key: `text-${index}`,
        style: {
          position: 'absolute',
          left: `${textConfig.x}px`,
          top: `${textConfig.y}px`,
          fontSize: `${textConfig.fontSize}px`,
          color: textConfig.color || '#000000',
          fontWeight: textConfig.fontWeight || 'normal',
          textAlign: textConfig.textAlign || 'left',
          maxWidth: textConfig.maxWidth ? `${textConfig.maxWidth}px` : undefined,
          whiteSpace: textConfig.maxWidth ? 'normal' : 'nowrap',
          lineHeight: 1.2,
        },
        children: textConfig.text,
      },
    })
  )

  // Main container with background + texts
  const element: SatoriElement = {
    type: 'div',
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      },
      children: textElements,
    },
  }

  try {
    // Generate the image using Satori without custom fonts
    const svg = await satori(element as any, {
      width,
      height,
      // Omit fonts array to use default font handling
    })

    // Return SVG as Uint8Array
    return new TextEncoder().encode(svg)
  } catch (error) {
    throw new Error(`Failed to generate image: ${error}`)
  }
}

// Example usage with font loading
async function exampleWithFont(): Promise<Uint8Array | undefined> {
  const config: ImageConfig = {
    imageUrl:
      'https://cdn.slidemodel.com/wp-content/uploads/FF0417-01-free-certificate-template-16x9-1.jpg',
    width: 1280,
    height: 720,
    texts: [
      {
        text: 'Hello World',
        x: 100,
        y: 50,
        fontSize: 32,
        fontFamily: 'Inter',
        color: '#ffffff',
        fontWeight: 'bold',
      },
      {
        text: 'Secondary Text',
        x: 100,
        y: 100,
        fontSize: 18,
        fontFamily: 'Inter',
        color: '#ffcc00',
        maxWidth: 200,
      },
      {
        text: 'Bottom Right',
        x: 600,
        y: 500,
        fontSize: 24,
        fontFamily: 'Inter',
        color: '#00ff00',
        textAlign: 'right',
      },
    ],
  }

  try {
    const imageBuffer: Uint8Array = await generateImageWithTextOverlay(config)
    console.log('Image generated successfully')
    return imageBuffer
  } catch (error) {
    console.error('Error generating image:', error)
    return undefined
  }
}

// Example usage without font loading (simpler approach)
async function exampleSimple(): Promise<Uint8Array | undefined> {
  const config: ImageConfig = {
    imageUrl:
      'https://cdn.slidemodel.com/wp-content/uploads/FF0417-01-free-certificate-template-16x9-1.jpg',
    width: 1280,
    height: 720,
    texts: [
      {
        text: 'Hello World',
        x: 100,
        y: 50,
        fontSize: 32,
        color: '#ffffff',
        fontWeight: 'bold',
      },
      {
        text: 'Secondary Text',
        x: 100,
        y: 100,
        fontSize: 18,
        color: '#ffcc00',
        maxWidth: 200,
      },
      {
        text: 'Bottom Right',
        x: 600,
        y: 500,
        fontSize: 24,
        color: '#00ff00',
        textAlign: 'right',
      },
    ],
  }

  try {
    const imageBuffer: Uint8Array = await generateImageWithTextOverlaySimple(config)
    console.log('Image generated successfully')
    const imageURL = URL.createObjectURL(new Blob([imageBuffer]))
    return c.json({ imageURL }, 200)
  } catch (error) {
    console.error('Error generating image:', error)
    return undefined
  }
}

export { 
  generateImageWithTextOverlay, 
  generateImageWithTextOverlaySimple,
  loadFont 
}