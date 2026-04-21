# Helper / Seeker Profile Module

## 1) Architecture overview

This module extends the existing MERN stack with a focused profile experience for helpers and seekers. It is designed as a lean profile management layer while keeping the current app structure intact.

- Frontend: React + JSX + axios
- Backend: Express + TypeScript-style validation patterns using Mongoose schemas
- Database: MongoDB via Mongoose
- Auth: JWT protected routes using the existing `protect` middleware
- File storage: avatar/cover upload stubbed through base64 and profile metadata
- Public profile: preview endpoint for authenticated users

### Key components

- `frontend/src/components/ProfilePage.jsx` — profile dashboard experience
- `frontend/src/components/HomeTownHelper.jsx` — route state and profile entry point
- `backend/controllers/profileController.js` — profile API business logic
- `backend/routes/profileRoutes.js` — profile API endpoints
- `backend/models/User.js` — extended user schema fields for profile, company, and public profile metadata

## 2) UI component map

- `Navbar` — adds profile button when a seeker/helper is logged in
- `ProfilePage` — full page with:
  - left vertical section for hero and quick stats
  - top header with search, notifications, avatar menu
  - hero cover panel with `Change Cover`
  - left profile card with avatar, name, role/company, quick stats, public profile link
  - right content area with tabs for all requested sections
  - Account & Company forms wired to backend save flows

## 3) DB schema

The backend extends the existing `User` model for seeker/helper profile data.

### `backend/models/User.js`

- `name`, `email`, `password`, `role`
- `firstName`, `lastName`
- `phoneNumber`, `timezone`, `locale`
- `address` object: `line1`, `line2`, `city`, `region`, `postcode`, `country`
- `companyName`, `roleTitle`, `website`, `industry`, `teamSize`, `logo`, `about`
- `socialLinks`: `linkedIn`, `twitter`, `website`
- `avatar`, `coverKey`
- `publicProfileVisible`, `publicProfileSlug`
- `pendingEmail`, `emailVerificationToken`, `emailVerificationExpires`
- `bio`, `rating`, `totalJobs`

> This module targets helper/seeker roles only and leaves admin concerns unchanged.

## 4) OpenAPI-style API spec

### Profile APIs

- `GET /api/profile`
  - returns current authenticated profile
- `PUT /api/profile`
  - updates profile fields, company settings, locale, and contact data
- `POST /api/profile/avatar`
  - accepts `{ avatarUrl }` or `{ avatarKey }`
  - stores avatar metadata and returns updated avatar URL
- `POST /api/profile/cover`
  - accepts `{ coverUrl }` or `{ coverKey }`
  - stores cover metadata and returns updated cover reference
- `POST /api/profile/change-email`
  - accepts `{ newEmail }`
  - generates email verification token and stores pending email
- `POST /api/profile/verify-email`
  - accepts `{ token }`
  - verifies email and commits pending email
- `GET /api/profile/preview`
  - returns public profile preview fields for the current user

### Example request/response

#### GET /api/profile

Request headers:
- `Authorization: Bearer <token>`

Response body:

```json
{
  "status": "success",
  "data": {
    "profile": {
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@example.com",
      "companyName": "Talent Loop",
      "roleTitle": "Talent Buyer",
      "socialLinks": {
        "linkedIn": "https://www.linkedin.com/in/janedoe"
      }
    }
  }
}
```

## 5) Key code files

- `backend/models/User.js`
- `backend/controllers/profileController.js`
- `backend/routes/profileRoutes.js`
- `backend/server.js`
- `frontend/src/components/ProfilePage.jsx`
- `frontend/src/components/HomeTownHelper.jsx`
- `frontend/src/components/Navbar.jsx`

## 6) Testing plan

1. Unit test backend `profileController` responses for:
   - valid profile fetch
   - profile update shape
   - avatar upload response
   - email change request and verify flows
2. Integration test routes with JWT auth to ensure protected behavior and 401/403 handling
3. Frontend smoke test:
   - authenticated profile page loads
   - account tab fields populate
   - save button activates and sends PUT request
   - avatar upload preview appears
4. Manual E2E demo path:
   - register user as seeker/helper
   - login
   - open profile page
   - update account fields
   - upload avatar and cover preview
   - save changes and verify API state

## 7) Setup instructions

1. Install backend and frontend dependencies:
   - `npm install`
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
2. Create `.env` in the root or backend directory with:
   - `JWT_SECRET=your_jwt_secret`
   - `JWT_EXPIRES_IN=7d`
   - `MONGODB_URI=mongodb://localhost:27017/fyp`
   - `FRONTEND_URL=http://localhost:3000`
3. Start development:
   - `npm run start`
4. Open `http://localhost:3000`
5. Authenticate and use the new profile dashboard via the `Profile` button in the navbar.

---

### Notes

This profile module is scoped for helper and seeker roles; admin handling remains in the existing admin dashboard. The current repo remains a MERN implementation, with this module adding a clean profile UX and secure profile APIs within that stack.
