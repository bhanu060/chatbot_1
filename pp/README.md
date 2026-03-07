# Architect Companion

An AI-powered developer toolkit featuring a Screen Analyst, Interactive Chat Assistant, and Location Discovery.

## Features

- **Screen Analyst**: Capture your screen and get instant AI analysis, debugging tips, and code reviews.
- **Architect Assistant**: A deep-thinking AI chat for technical discussions and product architecture.
- **Photo Analysis**: Upload images to get feedback on designs or diagrams.
- **Location Discovery**: Find special places nearby using Google Maps grounding.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (Build Tool)
- **Tailwind CSS 4** (Styling)
- **Gemini AI SDK** (@google/genai)
- **Lucide React** (Icons)
- **Framer Motion** (Animations)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd architect-companion
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Vercel / Netlify (Recommended)

This project is a Single Page Application (SPA) and can be easily hosted on Vercel or Netlify.

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel or Netlify.
3. Set the following **Environment Variable** in your hosting dashboard:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
4. The build command should be `npm run build` and the output directory should be `dist`.

### GitHub Pages

If deploying to GitHub Pages, you may need to use a tool like `gh-pages` or configure a custom action to handle SPA routing (redirecting 404s to `index.html`).

## License

MIT
