# Netlify Deployment for ReMap Express API

This document explains how the Express API has been configured for deployment to Netlify.

## Structure

The API has been restructured to work with Netlify Functions:

- **`netlify/functions/api.ts`**: Main Netlify function that combines all Express routes
- **`netlify.toml`**: Netlify configuration with function settings and redirects
- **`src/routes/`**: Original Express routes (unchanged)
- **`src/controllers/`**: Original controllers (unchanged)
- **`src/middleware/`**: Original middleware (unchanged)

## API Endpoints

All API endpoints are now accessible under the `/api` prefix:

- **Authentication**: `/api/auth/*`
  - `GET /api/auth/users` - List all users
  - `GET /api/auth/users/:id` - Get user by ID
  - `POST /api/auth/signUp` - Sign up
  - `POST /api/auth/signIn` - Sign in
  - `POST /api/auth/signOut` - Sign out
  - `PUT /api/auth/email` - Update email
  - `PUT /api/auth/password` - Update password
  - `DELETE /api/auth/users/:id` - Delete user

- **Profiles**: `/api/profiles/*`
  - `GET /api/profiles` - List all profiles
  - `GET /api/profiles/:id` - Get profile by ID
  - `PUT /api/profiles/:id` - Update profile

- **Pins**: `/api/pins/*`
  - `POST /api/pins/user` - Create pin (private)
  - `GET /api/pins/user` - List user pins (private)
  - `GET /api/pins/user/:pinId` - Get user pin (private)
  - `PUT /api/pins/user/:pinId` - Update pin (private)
  - `DELETE /api/pins/user/:pinId` - Delete pin (private)
  - `GET /api/pins` - List all pins (public)
  - `GET /api/pins/:pinId` - Get pin by ID (public)

- **Circles**: `/api/circles/*`
  - `POST /api/circles` - Create circle
  - `GET /api/circles` - List circles
  - `GET /api/circles/:circleId` - Get circle by ID
  - `PUT /api/circles/:circleId` - Update circle
  - `DELETE /api/circles/:circleId` - Delete circle
  - `POST /api/circles/members` - Add member to circle
  - `GET /api/circles/members/:circleId` - List circle members
  - `DELETE /api/circles/members/:circleId` - Remove member from circle

## Configuration

### netlify.toml
- Functions directory: `netlify/functions`
- External node modules: `express` (for esbuild bundling)
- Node bundler: `esbuild`
- Redirects: All `/api/*` requests are redirected to the Netlify function

### Dependencies
The following dependencies are required for Netlify deployment:
- `express`: Web framework
- `serverless-http`: Converts Express app to serverless function
- `@netlify/functions`: Netlify Functions support
- `@types/express`: TypeScript types for Express

## Deployment

1. Install Netlify CLI:
   ```bash
   npm install netlify-cli -g
   ```

2. Initialize Netlify project:
   ```bash
   netlify init
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

## Environment Variables

Make sure to set the following environment variables in your Netlify dashboard:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- Any other environment variables used by your controllers

## Local Development

For local development, you can still use the original Express server:

```bash
npm run dev
```

This will run the server on port 3000 (or the port specified in `BackPORT` environment variable).
