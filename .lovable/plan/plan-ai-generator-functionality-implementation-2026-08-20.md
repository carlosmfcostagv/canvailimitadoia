# Plan: AI Generator Functionality Implementation

Implement missing business logic, state management, and API integration for the AI Generator module as requested in the initial requirements.

## Proposed Changes

### 1. Centralized AI Service (`src/lib/ai.server.ts` & `src/lib/ai.functions.ts`)
- Create `AIProviderService` on the server to handle AI requests securely.
- Implement server functions for `generateImage`, `generateVideo`, `generateImageToVideo`, `enhancePrompt`, and `getGenerationStatus`.
- These functions will currently return mock data/success for demonstration, ready for real API integration (OpenAI, Replicate, etc.).

### 2. Global State & Context (`src/components/ai/AIGeneratorContext.tsx`)
- Implement a context to share state between tools:
  - Selected model/settings.
  - Active generation queue and history.
  - Functions to transfer content between tabs (e.g., "Animate Image", "Use for Video").

### 3. Feature Implementations
- **Image to Video**:
  - Implement image upload logic (simulated).
  - Connect "Enhance" button to the AI service.
  - Connect "Generate" to the background process.
- **Image Generator**:
  - Implement prompt enhancement.
  - Handle image generation result display (preview, download, variations).
  - Add "Animate Image" button to transfer result to the Image to Video tab.
- **Video Generator**:
  - Connect generation settings and prompt.
- **Prompt Generator**:
  - Implement the "Generate Prompt" logic that breaks ideas into structured fields (Style, Mood, etc.).
  - Implement "Use for..." buttons that navigate to the respective tab and pre-fill the prompt.

### 4. Integration & UI Persistence
- Implement the "Settings" modal for default configurations (aspect ratio, quality).
- Persist settings to LocalStorage (or prepared for DB integration).
- Update `GeneratedResults` to reflect real-time processing status (Queued -> Processing -> Completed).

## Technical Details
- Using `createServerFn` from TanStack Start for backend calls.
- `sonner` for toast notifications during processing.
- `lucide-react` for icons.
- Ensure type safety for generation payloads and results.
