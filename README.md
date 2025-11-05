# Carousel Generator App

A web application for generating Instagram-style carousel posts with text overlays. Create beautiful multi-slide carousel posts from your story and photos.

## Features

- **Photo Upload**: Upload your own photos to use as backgrounds
- **Smart Story Splitting**: Automatically splits your story into 8-20 slides
- **Text Customization**: 
  - Font styles (Modern, Classic, Bold)
  - Text colors (with custom color picker)
  - Text positioning (Top, Center, Bottom)
  - Optional background overlay
- **Real-time Preview**: See your carousel as you make changes
- **Export Options**: Download individual images or as a ZIP file
- **Responsive Design**: Works on desktop and tablet devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Canvas API** for client-side image processing
- **JSZip** for ZIP file generation
- **Docker** support for containerized development

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker Desktop (optional, for containerized development)

### Local Development

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

### Docker Development

1. **Build Docker image:**
   ```bash
   docker build -t carousel-app .
   ```

2. **Run container:**
   ```bash
   docker run -p 3000:3000 -v "$(pwd):/app" carousel-app
   ```

   Or use docker-compose:
   ```bash
   docker-compose up
   ```

3. **Access at:**
   - `http://localhost:3000`

## Project Structure

```
carousel-app/
├── public/              # Static assets
├── src/
│   ├── components/     # React components
│   │   ├── PhotoUpload.tsx
│   │   ├── TextInput.tsx
│   │   ├── TextCustomization.tsx
│   │   ├── CarouselPreview.tsx
│   │   └── ExportOptions.tsx
│   ├── utils/          # Utility functions
│   │   ├── textSplitter.ts
│   │   ├── imageProcessor.ts
│   │   └── exportUtils.ts
│   ├── types/          # TypeScript types
│   │   └── index.ts
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to Netlify or any static hosting service.

## Deployment

### Quick Deployment to Netlify

This app is configured for automatic deployment to Netlify with GitHub integration, enabling rapid iteration and testing.

#### Prerequisites

- GitHub account
- Netlify account (free tier is sufficient)
- Code pushed to a GitHub repository

#### Initial Setup

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select "GitHub" and authorize Netlify
   - Choose your repository
   - Netlify will auto-detect settings from `netlify.toml`:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Node version: 18

3. **First Deployment:**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your app
   - You'll get a URL like `your-app-name.netlify.app`

#### Quick Iteration Workflow

For rapid feature testing and multiple deployments per day:

1. **Make your changes** locally
2. **Test locally:**
   ```bash
   npm run dev
   ```
3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
4. **Automatic deployment:**
   - Netlify automatically detects the push
   - Builds and deploys in ~2-3 minutes
   - Your site is live at your Netlify URL

#### Custom Subdomain

1. Go to Site settings → Domain management
2. Click "Add custom domain" or "Options" → "Edit site name"
3. Change to your preferred subdomain (e.g., `carousel-app.netlify.app`)

#### Monitoring Deployments

- View deployment status in Netlify dashboard
- Each deployment shows build logs
- Preview deployments for pull requests (automatic)
- Rollback to previous deployments if needed

#### Troubleshooting

**Build fails:**
- Check build logs in Netlify dashboard
- Verify Node version is 18 (configured in `netlify.toml`)
- Ensure all dependencies are in `package.json`

**Site not updating:**
- Check that you pushed to the correct branch (usually `main`)
- Verify Netlify is connected to the right repository
- Check deployment logs for errors

**Local build works but Netlify fails:**
- Clear Netlify build cache: Site settings → Build & deploy → Clear cache
- Verify `netlify.toml` is in the repository root

## How It Works

1. **Upload Photo**: Users upload a photo (or multiple photos) to use as the carousel background
2. **Enter Story**: Users type their story text
3. **Customize**: Users customize text appearance (font, color, position, overlay)
4. **Auto-Generate**: The app automatically:
   - Splits the story into 8-20 slides using intelligent text splitting
   - Generates each slide with the photo and text overlay
   - Creates numbered images (carousel_01.jpg, carousel_02.jpg, etc.)
5. **Preview**: Users can preview all slides in a grid or full-screen modal
6. **Export**: Users can download individual images or a ZIP file

## Text Splitting Algorithm

The app uses a smart algorithm to split stories:
- **Primary**: Splits on sentence boundaries (periods, exclamation marks, question marks)
- **Secondary**: For long sentences (>125 chars), splits on punctuation (commas, semicolons)
- **Fallback**: Character-based splitting if needed
- **Adjustment**: Ensures minimum 8 slides and maximum 20 slides

## Image Specifications

- **Aspect Ratio**: 4:5 (1080x1350 pixels)
- **Format**: JPEG
- **Quality**: 92%
- **Naming**: Sequential numbering (carousel_01.jpg through carousel_20.jpg)

## Future Enhancements

- User accounts and saved projects
- Premium features (advanced templates, more fonts, etc.)
- Ad integration for free version
- React Native mobile app conversion
- Video carousel generation
- Multiple photo support per carousel

## License

This project is currently in development.

## Contributing

This is a private project. For questions or suggestions, please contact the development team.

