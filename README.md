# Image Compressor

A simple and elegant image compression tool built with Next.js and Sharp.

## Features

- 🖼️ **Drag & Drop Interface**: Easy-to-use interface for uploading images
- ⚡ **Fast Compression**: Server-side compression using Sharp for optimal performance
- 📊 **Compression Stats**: See original size, compressed size, and reduction percentage
- 💾 **Download**: Download your compressed images instantly
- 🎨 **Beautiful UI**: Modern, responsive design with a split-screen layout
- 🔄 **Format Support**: Supports JPG, PNG, and WEBP formats
- 🌐 **Transparency Preservation**: Maintains transparency for PNG images

## How to Use

1. Upload an image (drag & drop or click to select)
2. Click "Compress Image" to process
3. View compression statistics
4. Download your compressed image

## Tech Stack

- **Next.js 15** - React framework
- **Sharp** - High-performance image processing
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **React Dropzone** - File upload handling

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

You can adjust compression settings in the `ImageUploadClient` component:

- `quality`: Image quality (default: 70)
- `maxWidth`: Maximum width for resizing (default: 1920px)
