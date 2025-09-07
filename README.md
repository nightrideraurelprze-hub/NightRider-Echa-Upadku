# NightRider: Echoes of the Fall

This is an immersive, AI-powered visual and audio experience for the post-apocalyptic story of NightRider. The application uses the Gemini API to generate the story panels and the ElevenLabs API for professional-quality audio narration.

## Features

- **Dual Mode**: Works in both an API-driven "live" mode and a "preview" mode that uses local mock data, saving API quota.
- **AI-Powered Story Generation**: Splits the story into comic book panels using the Gemini Flash model.
- **User-Provided Imagery**: Uses a predefined set of images provided by the user, ensuring artistic consistency.
- **Professional Narration**: Uses the ElevenLabs API to generate high-quality, gender-specific voices for characters and narration.
- **Atmospheric Audio**: Dynamically selects background music based on the panel's atmosphere.
- **Advanced Caching**: Caches all generated content (story text, images, and audio narration) in the browser, providing instant load times and full offline capability on subsequent visits.
- **Multi-language Support**: Features a language switcher for English and Polish, with on-the-fly translation via the Gemini API.
- **Error Boundary**: Gracefully handles unexpected application errors, preventing crashes and showing a user-friendly message.

## Configuration

This application uses [Vite](https://vitejs.dev/) to handle environment variables. For both local development and deployment, you need to configure the following variables.

### Environment Variables for Deployment (e.g., Vercel)

Set these in your hosting provider's dashboard:

-   `VITE_GEMINI_API_KEY`: Your Google Gemini API key. Get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
-   `VITE_ELEVENLABS_API_KEY`: Your ElevenLabs API key. Find it in your [ElevenLabs profile](https://elevenlabs.io/app/settings/api-keys).
-   `VITE_USE_API`: (Optional) Set to `"false"` to force the deployed application into "preview" mode. Defaults to `"true"` (live mode).

### For Local Development

1.  Copy the `.env.example` file to a new file named `.env` in the project root.
2.  Open the `.env` file and fill in your actual API keys.

The Vite development server will automatically load these variables.

## Running the Application

This project is now set up to run with Vite, which provides a fast development server and an optimized build process.

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```
    This will start a local server, typically at `http://localhost:5173`. The server features hot-reloading, so changes to your code will be reflected instantly in the browser.

3.  **Build for production**:
    ```bash
    npm run build
    ```
    This command bundles the application into a `dist` directory, optimized for deployment.
