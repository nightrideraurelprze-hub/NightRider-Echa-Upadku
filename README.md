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

This application requires API keys for Google Gemini and ElevenLabs to function in "live" mode. These keys should be configured as environment variables, which is a secure best practice.

### Environment Variables

You need to configure the following environment variables in your deployment environment (e.g., Vercel, Netlify, or your local shell):

-   `API_KEY`: Your Google Gemini API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
-   `ELEVENLABS_API_KEY`: Your ElevenLabs API key. You can find it in your [ElevenLabs profile](https://elevenlabs.io/app/settings/api-keys).
-   `USE_API`: (Optional) Set this to `false` to run the application in "preview" mode. This uses local mock data instead of making live API calls, which is useful for UI development without consuming your API quota. If not set, it defaults to `true` (live mode).

**IMPORTANT**: Since this is a client-side application, your build/hosting environment must make these variables available to the browser. Most modern frontend frameworks and hosting platforms (like Vercel) handle this automatically.

## Running the Application

This project is a static web application and does not require a complex build process. You can run it with any simple static file server.

1.  **Using VS Code's Live Server**:
    If you use Visual Studio Code, you can install the "Live Server" extension. Once installed, right-click on `index.html` and choose "Open with Live Server".

2.  **Using Python's HTTP Server**:
    If you have Python installed, navigate to the project's root directory in your terminal and run:
    ```bash
    python -m http.server
    ```
    Then, open your browser and go to `http://localhost:8000`.

**Note for Local Development**: To make environment variables work locally with a simple static server, you will need a build tool (like Vite) that can substitute `process.env.*` placeholders. The current setup assumes the deployment environment handles this.
