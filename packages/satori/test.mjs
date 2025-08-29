// test.mjs
import fs from "fs";
import satori from "satori";
import { NotoSans } from "satori/fonts"; // 🎉 built-in font

async function generateImageWithTextOverlay(config) {
  const { imageUrl, width, height, texts } = config;

  const textElements = texts.map((t, i) => ({
    type: "div",
    props: {
      key: `text-${i}`,
      style: {
        position: "absolute",
        left: `${t.x}px`,
        top: `${t.y}px`,
        fontSize: `${t.fontSize}px`,
        fontFamily: "Noto Sans",
        color: t.color || "#000",
      },
      children: t.text,
    },
  }));

  const element = {
    type: "div",
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        position: "relative",
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
      },
      children: textElements,
    },
  };

  const svg = await satori(element, {
    width,
    height,
    fonts: [
      {
        name: "Noto Sans",
        data: NotoSans, // 👈 comes from satori/fonts
        weight: 400,
        style: "normal",
      },
    ],
  });

  return Buffer.from(svg);
}

async function example() {
  const config = {
    imageUrl:
      "https://cdn.slidemodel.com/wp-content/uploads/FF0417-01-free-certificate-template-16x9-1.jpg",
    width: 1280,
    height: 720,
    texts: [
      { text: "Hello World", x: 100, y: 50, fontSize: 32, color: "#fff" },
      { text: "Bottom Text", x: 600, y: 500, fontSize: 24, color: "#0f0" },
    ],
  };

  const imageBuffer = await generateImageWithTextOverlay(config);
  fs.writeFileSync("output.svg", imageBuffer);
  console.log("Saved output.svg");
}

example();
