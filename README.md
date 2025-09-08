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

This application requires API keys to function in "live" mode.

### Required API Keys

-   **Google Gemini API Key**: Your Google Gemini API key. Get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
-   **ElevenLabs API Key**: Your ElevenLabs API key. Find it in your [ElevenLabs profile](https://elevenlabs.io/app/settings/api-keys).

### Environment Variables

How you set these variables depends on your environment.

#### For Deployment (e.g., Vercel, Netlify)

Set these in your hosting provider's environment variable settings:

-   `API_KEY`: Your **Google Gemini API key**. The application is configured to read this key directly from the `process.env.API_KEY` variable, as required by the SDK guidelines.
-   `VITE_ELEVENLABS_API_KEY`: Your **ElevenLabs API key**. This key is prefixed with `VITE_` to be exposed to the frontend client by Vite.
-   `VITE_USE_API`: (Optional) Set to `"false"` to force the deployed application into "preview" mode (using local mock data). Defaults to `"true"` (live mode).

#### For Local Development

1.  Create a file named `.env` in the project root.
2.  Add your **ElevenLabs API key** and other Vite-specific variables to this file:

    ```
    # .env
    VITE_ELEVENLABS_API_KEY="your_elevenlabs_api_key_here"
    VITE_USE_API="true" 
    ```

**Important:** The **Google Gemini API key (`API_KEY`)** is expected to be available in the execution environment (`process.env`). For local development with Vite, this is not automatically handled by `.env` files. The easiest way to run locally is often to use the "preview" mode by setting `VITE_USE_API="false"`. If you need to run in live mode locally, you will need to ensure the `API_KEY` variable is present in the process running the Vite dev server.

The Vite development server will automatically load the variables from your `.env` file that are prefixed with `VITE_`.

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