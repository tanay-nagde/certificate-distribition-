# 🎓 Certificate Distribution System

A **scalable certificate distribution platform** built with **HonoJS (Cloudflare Workers), Next.js, Zustand, Fabric.js, QStash, and Cloudinary**.  
This project enables **organizations, clubs, and institutions** to generate and distribute certificates at scale with a modern drag-and-drop editor and an optimized serverless backend.

---

## 🚀 Features

- **Serverless Certificate Pipeline**  
  - Built on **Cloudflare Workers** with **HonoJS** for ultra-fast request handling.  
  - Handles bulk certificate generation and distribution without server overhead.  

- **Dynamic Template Editor**  
  - Designed using **Fabric.js** for drag-and-drop field placement.  
  - Fully customizable text fields, images, and positioning.  

- **Optimized Asynchronous Workflows**  
  - Integrated **Upstash QStash** to queue heavy tasks like image generation and email sending.  
  - Reduced API latency by **90%** compared to synchronous processing.  

- **Instant Certificate Access**  
  - Certificates are stored in **Cloudinary** with CDN caching for fast global delivery.  
  - Sharable links for instant validation and download.  

- **State Management**  
  - Used **Zustand** for lightweight and predictable state management in the Next.js frontend.  

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, Zustand, Fabric.js  
- **Backend:** HonoJS (Cloudflare Workers)  
- **Queues & Async Jobs:** Upstash QStash  
- **Storage & CDN:** Cloudinary  
- **Other:** TailwindCSS, shadcn, TypeScript  

---

## 📸 Screenshots & 🎥 Demo



https://github.com/user-attachments/assets/e20428fd-0aff-4b67-ba3e-535ffe474d74



https://github.com/user-attachments/assets/f4b9bb89-2536-4a5d-b8b2-b149fbfecce2





---

## 🧩 Architecture

```mermaid
flowchart TD
    User[User] --> Nextjs[Next.js Frontend]
    Nextjs --> Editor[Fabric.js Template Editor]
    Editor --> Worker[Cloudflare Worker + HonoJS]
    Worker --> QStash[Upstash QStash Queue]
    QStash --> Gen[Certificate Generation Service]
    Gen --> Cloudinary[Cloudinary Storage & CDN]
    Cloudinary --> User
