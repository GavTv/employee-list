# Project guidance

## Project overview

Employee directory built with React and TypeScript, Express and TypeScript, and SQLite. Start the client and API together from the repository root with `npm run dev`. Create `server/.env` from `server/.env.example` first.

## Architecture

- Keep the frontend organized by Feature-Sliced Design layers: `app`, `pages`, `widgets`, `features`, `entities`, and `shared`.
- Keep route handlers and domain code inside `server/src/features`; put cross-cutting middleware, configuration, database setup, and shared HTTP types in their existing folders.
- The Express API is the only application layer that reads or writes SQLite. Frontend features call it through `client/src/shared/api/client.ts`.
- Protect employee and profile endpoints with the existing JWT middleware. Never return password hashes or commit `.env` files.
- Keep the interface in Russian. Use ordinary CSS for the app's existing layout and Tailwind CSS classes inside Kokonut UI components; avoid rewriting the whole app's styling system.
- Keep the Kokonut UI registry components in `client/src/components/kokonutui/` and reuse them instead of rebuilding the account menu, avatar picker, or file upload flow.
- Use Anime.js for interface motion where it improves feedback. In React, scope animations with `createScope()` and clean them up on unmount; respect `prefers-reduced-motion`.

## Suggested agent roles

- **Frontend agent:** implement React interactions and responsive styling while following the FSD layer boundaries.
- **Backend agent:** implement Express routes, request validation, authentication, and SQLite persistence.
- **Security reviewer:** inspect authentication, authorization, input validation, and handling of uploaded images; report findings before changing scope.
- **Integration reviewer:** check that UI requests match API routes and that the README matches the actual run commands.

For parallel work, assign agents separate files or layers and ask one reviewer to check integration after the changes are combined. Keep the final explanation understandable to a junior developer who may need to discuss the code in an interview.
