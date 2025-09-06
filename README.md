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

## Configuration

All configuration is managed in a single file for simplicity.

1.  **Rename the example config file**:
    Rename `config.example.ts` to `config.ts`.

2.  **Add your API keys**:
    Open `config.ts` and paste your API keys into the respective fields.

    ```typescript
    // config.ts
    
    // Switch between API generation and local mock data
    export const USE_API = true; // Set to false for preview mode
    
    // --- API KEYS ---
    export const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
    export const ELEVENLABS_API_KEY = 'YOUR_ELEVENLABS_API_KEY_HERE';
    ```

3.  **Toggle Preview Mode**:
    To work on the UI without consuming API credits, you can set `USE_API` to `false` in `config.ts`.

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
