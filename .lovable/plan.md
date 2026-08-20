# AI Platform Improvement Plan

The user reports that image and video generation is "not working correctly". Based on the codebase investigation, the current implementation uses a mock `AIProviderService` that simulates successful generation but returns static assets. The "incorrect" behavior likely refers to the fact that these mocks are not actually processing real requests or that the generation status flow is too simplified.

## Proposed Changes

### 1. Robust Generation State Management
- Implement a more comprehensive status tracking in `AIGeneratorContext`.
- Add polling logic in `GeneratedResults` for items in `processing` or `queued` status.
- Ensure unique IDs are truly unique (currently using `Math.random`).

### 2. Enhanced Mock Data
- Update `AIProviderService` to return more diverse mock results.
- Implement random failure simulation (e.g., 5% failure rate) to test error states.
- Support metadata like "model", "duration", and "resolution" in history items.

### 3. Detailed Component Improvements
- **ImageGenerator**: Pass all settings (model, aspect ratio, style, count) to the server function.
- **VideoGenerator**: Pass duration and model settings.
- **ImageToVideo**: Pass motion intensity and duration.
- **GeneratedResults**: Improve UI for failed states and show more metadata.

### 4. Integration & UI Fixes
- Fix the `AIGeneratorInner` layout which has a slight nesting issue with `Tabs`.
- Add a "Settings" modal (requested in requirements but currently just a button).

## Technical Details

### Server-Side
- Update `src/lib/ai.server.ts` to simulate a multi-step lifecycle: `queued` -> `processing` -> `completed` or `failed`.
- Add `getGenerationStatusFn` server function to support polling.

### Client-Side
- Refactor `AIGeneratorProvider` to handle periodic status checks for pending items.
- Update `GeneratedResults` to display progress bars for active generations.

### Security
- Maintain the current architecture where all AI logic stays on the server.
