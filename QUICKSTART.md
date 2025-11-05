# Quick Start Guide

## First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - Navigate to `http://localhost:3000`

## Using Docker

### Option 1: Docker Compose (Recommended)
```bash
docker-compose up
```

### Option 2: Docker Build & Run
```bash
docker build -t carousel-app .
docker run -p 3000:3000 -v "$(pwd):/app" carousel-app
```

## How to Use the App

1. **Upload Photo**: Click or drag-and-drop a photo (max 10MB)
2. **Enter Story**: Type your story in the text area
3. **Customize**: Adjust font, color, position, and overlay settings
4. **Preview**: View your generated carousel (8-20 slides)
5. **Export**: Download individual images or a ZIP file

## Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Troubleshooting

### Port 3000 already in use?
- Change the port in `vite.config.ts` or use a different port:
  ```bash
  npm run dev -- --port 3001
  ```

### Docker issues?
- Make sure Docker Desktop is running
- Check that port 3000 is available
- Try rebuilding: `docker-compose build --no-cache`

### TypeScript errors?
- Run `npm install` to ensure all dependencies are installed
- Check that Node.js version is 18+

