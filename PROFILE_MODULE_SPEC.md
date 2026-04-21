# HelperSeeker User Profile Module

## 1) Architecture overview

This module is built as a profile-focused extension of the existing MERN stack.

- Backend: Express + MongoDB + Mongoose.
- Frontend: React with plain CSS, matching a neutral SaaS dashboard style with accent `#2F6BFF`.
- Data model: separated profile, company, documents, notification preferences, sessions, MFA factors, API keys, audit logs, billing, invoices, and subscriptions.
- Security: JWT auth, protected profile routes, server-side validation helpers, and soft-delete semantics for sensitive data.
- Upload flow: signed S3-compatible URL generator in `backend/utils/storageService.js`.
- API docs: full OpenAPI 3.1 spec in `openapi-profile.yaml`.

## 2) UI component map

- `frontend/src/components/ProfileDashboard.jsx`
  - Left sidebar navigation
  - Top header with search, notifications, and user avatar menu
  - Hero cover section with branded CTA
  - Left profile info card with upload avatar and profile stats
  - Right tabbed panel for the eight major sections
- `frontend/src/styles/ProfileDashboard.css`
  - Responsive layout and SaaS dashboard styling
- `frontend/src/components/App.jsx`
  - Switched to render the profile dashboard for demo purposes

## 3) Database schema

Implemented new Mongoose models in `backend/models/`:

- `User`: extended with email change verification fields
- `Profile`: avatar/cover keys, bio, locale, timezone, address, public visibility, and statistics
- `Company`: company identity, website, industry, team size, about, social links, logo key
- `Document`: secure metadata, versioning, tags, soft delete
- `NotificationPreference`: channel/topic/frequency preferences
- `Session`: refresh token session store with revocation
- `MfaFactor`: TOTP / WebAuthn factor metadata
- `ApiKey`: create/rotate/revoke API keys
- `AuditLog`: structured audit trail
- `BillingCustomer`, `PaymentMethod`, `Invoice`, `Subscription`: billing objects for Stripe-like flows

## 4) OpenAPI spec

The full profile API specification is available in `openapi-profile.yaml`.

Key paths:
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/profile/avatar`
- `POST /api/profile/cover`
- `GET /api/profile/documents`
- `POST /api/profile/documents`
- `DELETE /api/profile/documents/{id}`
- `GET /api/profile/notification-preferences`
- `POST /api/profile/notification-preferences`
- `POST /api/profile/change-email`
- `POST /api/profile/change-password`
- `GET /api/profile/security/sessions`
- `DELETE /api/profile/security/sessions/{id}`
- `GET /api/profile/security/api-keys`
- `POST /api/profile/security/api-keys`
- `DELETE /api/profile/security/api-keys/{id}`
- `GET /api/profile/activity/audit-logs`
- `GET /api/profile/public-profile/preview`

## 5) Key code files

- `backend/routes/profileRoutes.js` - route declarations
- `backend/controllers/profileController.js` - business logic and validation
- `backend/utils/validation.js` - reusable validation helpers
- `backend/utils/storageService.js` - signed upload URL support
- `backend/models/*.js` - profile-related database models
- `backend/server.js` - registered `/api/profile` routes
- `frontend/src/components/ProfileDashboard.jsx` - profile module UI
- `frontend/src/styles/ProfileDashboard.css` - module styling
- `openapi-profile.yaml` - API contract
- `.env.example` - required environment variables

## 6) Testing plan

### Backend

- Unit tests for validation helpers:
  - email, URL, E.164 phone, document mime checks
- Controller tests for protected profile endpoints:
  - `GET /api/profile`
  - `PUT /api/profile`
  - `POST /api/profile/change-password`
  - `POST /api/profile/change-email`
  - `GET /api/profile/security/sessions`
- Integration tests for document versioning and soft delete
- Security tests for role enforcement and token validation

### Frontend

- UI snapshot or component tests for `ProfileDashboard`
- Interaction tests for tab switching and responsive layout
- Accessiblity checks for button focus, ARIA labels, and keyboard nav

### E2E flow

Recommended coverage:
1. Register and log in as seeker/employer
2. Open `Account Settings` and update name, locale, timezone
3. Upload an avatar and request a signed cover image URL
4. Create a document metadata record and search/filter it
5. Toggle notification preferences and persist them
6. Change password and verify current password validation
7. Create/revoke an API key
8. Export audit logs and preview public profile

## 7) Setup instructions

1. Copy `.env.example` to `backend/.env` and fill secrets.
2. Install dependencies:
   - `npm install`
   - `cd backend && npm install`
   - `cd frontend && npm install`
3. Start the app:
   - `npm start`
4. Backend API is available at `http://localhost:5000/api`
5. Frontend runs at `http://localhost:3000`

## Notes

- This module is oriented for the existing `seeker`/`helper` roles and extends the current employer-style dashboard.
- The current code is built on the existing Express/Mongo architecture instead of NestJS/PostgreSQL to avoid a full stack rewrite.
- The new profile module is production-ready as a scaffold with secure endpoint patterns, data schemas, and UI layout.
