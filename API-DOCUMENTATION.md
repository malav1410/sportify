# SPORTYFY.LIVE API Documentation

## Overview
This document provides a comprehensive reference for the SPORTYFY.LIVE API, detailing the endpoints, request/response formats, and authentication methods used across both the frontend and backend projects.

## Base URL
- Development: http://localhost:3000/api/v1
- Production: https://api.sportyfy.live/api/v1

## Authentication

### Firebase Authentication
SPORTYFY.LIVE uses Firebase Authentication for user management, with a custom JWT token system for API requests.

#### Authentication Flow:
1. User authenticates via Firebase (phone auth)
2. Frontend receives Firebase ID token
3. Frontend sends ID token to backend endpoint (`/firebase_auth`)
4. Backend verifies the token using Firebase Admin SDK
5. Backend generates a custom JWT token for API requests
6. Frontend stores JWT token and uses it for API requests

### JWT Tokens
- Format: Header.Payload.Signature
- Expiration: 30 days
- Required in Authorization header: `Bearer {token}`

## API Endpoints

### Authentication

#### Firebase Authentication
- **POST /api/v1/firebase_auth**
  - Description: Verify Firebase token and sign in or create user
  - Request headers: Authorization: `Bearer {firebase_id_token}`
  - Response:
    ```json
    {
      "token": "JWT_TOKEN",
      "user": {
        "id": 123,
        "phone": "1234567890",
        "name": "User Name",
        "email": "user@example.com",
        "sport": "Basketball"
      },
      "is_new": false
    }
    ```
  - Frontend components: 
    - `js/auth/auth-service.js` (verifyOTP function)
    - `js/auth/firebase-auth.js`

#### Complete User Profile
- **PATCH /api/v1/firebase_auth/complete_profile**
  - Description: Complete user profile after phone auth
  - Request headers: Authorization: `Bearer {jwt_token}`
  - Request body:
    ```json
    {
      "user": {
        "name": "User Name",
        "email": "user@example.com",
        "sport": "Basketball",
        "location": "New York"
      }
    }
    ```
  - Response:
    ```json
    {
      "user": {
        "id": 123,
        "phone": "1234567890",
        "name": "User Name",
        "email": "user@example.com",
        "sport": "Basketball"
      }
    }
    ```
  - Frontend components: 
    - `js/auth/auth-service.js` (completeProfile function)

#### Email/Password Authentication
- **POST /api/v1/auth/login**
  - Description: Authenticate user with email/password
  - Request body:
    ```json
    {
      "user": {
        "email": "user@example.com",
        "password": "password"
      }
    }
    ```
  - Response:
    ```json
    {
      "token": "JWT_TOKEN",
      "user": {
        "id": 123,
        "email": "user@example.com",
        "name": "User Name"
      }
    }
    ```

- **POST /api/v1/auth/register**
  - Description: Register new user with email/password
  - Request body:
    ```json
    {
      "user": {
        "name": "User Name",
        "email": "user@example.com",
        "password": "password",
        "password_confirmation": "password",
        "phone": "1234567890",
        "sport": "Basketball",
        "location": "New York"
      }
    }
    ```
  - Response:
    ```json
    {
      "token": "JWT_TOKEN",
      "user": {
        "id": 123,
        "email": "user@example.com",
        "name": "User Name"
      }
    }
    ```

### OTP Verification

- **POST /api/v1/otp/request_otp**
  - Description: Request OTP for phone verification
  - Request body:
    ```json
    {
      "phone": "1234567890"
    }
    ```
  - Response:
    ```json
    {
      "message": "OTP sent successfully"
    }
    ```

- **POST /api/v1/otp/verify_otp**
  - Description: Verify OTP for phone number
  - Request body:
    ```json
    {
      "phone": "1234567890",
      "otp": "123456"
    }
    ```
  - Response:
    ```json
    {
      "token": "JWT_TOKEN",
      "user": {
        "id": 123,
        "phone": "1234567890",
        "name": "User Name",
        "email": "user@example.com"
      },
      "new_user": true
    }
    ```

- **PATCH /api/v1/otp/complete_profile**
  - Description: Complete profile after OTP verification
  - Request body:
    ```json
    {
      "id": 123,
      "user": {
        "name": "User Name",
        "email": "user@example.com",
        "sport": "Basketball",
        "location": "New York"
      }
    }
    ```
  - Response:
    ```json
    {
      "user": {
        "id": 123,
        "phone": "1234567890",
        "name": "User Name",
        "email": "user@example.com"
      }
    }
    ```

### Waitlist

- **POST /api/v1/waitlist/create**
  - Description: Register a new user for the waitlist
  - Request body:
    ```json
    {
      "user": {
        "name": "User Name",
        "email": "user@example.com",
        "phone": "1234567890",
        "sport": "Basketball",
        "goal": "community",
        "location": "New York"
      }
    }
    ```
  - Response:
    ```json
    {
      "success": true
    }
    ```
  - Frontend components: 
    - `index.html` waitlist form 
    - `js/app.js` (waitlist form submission)

### Streams

- **GET /api/v1/streams**
  - Description: List all live streams
  - Response:
    ```json
    [
      {
        "id": 123,
        "title": "Basketball Game",
        "sport": "Basketball",
        "status": "live",
        "created_at": "2023-01-01T12:00:00Z"
      }
    ]
    ```

- **GET /api/v1/streams/:id**
  - Description: Get a specific stream
  - Response:
    ```json
    {
      "id": 123,
      "title": "Basketball Game",
      "description": "Championship Game",
      "sport": "Basketball",
      "location": "New York",
      "status": "live",
      "cloudflare_uid": "abc123",
      "created_at": "2023-01-01T12:00:00Z"
    }
    ```

- **POST /api/v1/streams**
  - Description: Create a new stream
  - Request headers: Authorization: `Bearer {jwt_token}`
  - Request body:
    ```json
    {
      "stream": {
        "title": "Basketball Game",
        "description": "Championship Game",
        "sport": "Basketball",
        "location": "New York"
      }
    }
    ```
  - Response:
    ```json
    {
      "stream": {
        "id": 123,
        "title": "Basketball Game",
        "status": "pending"
      },
      "stream_key": "abc123",
      "rtmps_url": "rtmps://live.cloudflare.com/live"
    }
    ```

- **POST /api/v1/streams/:id/chunk**
  - Description: Upload a stream chunk
  - Request headers: Authorization: `Bearer {jwt_token}`
  - Request body: Multipart form data with chunk file
  - Response:
    ```json
    {
      "success": true
    }
    ```

### Cloudflare Integration

- **GET /api/v1/cloudflare/signed_upload_url**
  - Description: Get a signed URL for direct upload to Cloudflare
  - Request headers: Authorization: `Bearer {jwt_token}`
  - Response:
    ```json
    {
      "uploadUrl": "https://upload.cloudflarestream.com/..."
    }
    ```
  - Frontend components:
    - `js/game/cloudflare-upload.js` (uploadVideo function)

- **POST /api/v1/cloudflare/upload**
  - Description: Upload video to Cloudflare Stream
  - Request headers: Authorization: `Bearer {jwt_token}`
  - Request body: Multipart form data with video file
  - Response:
    ```json
    {
      "videoId": "abc123",
      "streamId": 456
    }
    ```

- **POST /api/v1/cloudflare/upload_complete**
  - Description: Notify backend of successful Cloudflare upload
  - Request headers: Authorization: `Bearer {jwt_token}`
  - Request body:
    ```json
    {
      "videoId": "abc123",
      "filename": "game.mp4"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "streamId": 456,
      "videoId": "abc123"
    }
    ```
  - Frontend components:
    - `js/game/cloudflare-upload.js`

- **POST /api/v1/cloudflare/process_video**
  - Description: Process video for highlights
  - Request headers: Authorization: `Bearer {jwt_token}`
  - Request body:
    ```json
    {
      "id": "abc123"
    }
    ```
  - Response:
    ```json
    {
      "status": "processing",
      "message": "Video processing started"
    }
    ```

### Challenges

- **GET /api/v1/challenges**
  - Description: List all challenges with optional filtering
  - Query parameters:
    - `sport_type`: Filter by sport (e.g., basketball, football)
    - `difficulty`: Filter by difficulty (e.g., easy, medium, hard)
    - `search`: Search by title or description
    - `page`: Page number for pagination (default: 1)
    - `paid`: Filter by paid status (true/false)
  - Response:
    ```json
    {
      "challenges": [
        {
          "id": 123,
          "title": "Free Throw Challenge",
          "description": "Complete 10 free throws in a row",
          "sport_type": "basketball",
          "difficulty": "easy",
          "points_reward": 10, 
          "badge_reward": "Free Throw Master",
          "is_paid": false,
          "image_url": "https://example.com/images/free-throw.jpg"
        }
      ],
      "meta": {
        "current_page": 1,
        "total_pages": 3,
        "total_count": 25
      }
    }
    ```
  - Frontend components:
    - `js/game/challenges.js` (fetchChallenges function)
    - `game/challenges.html`

- **GET /api/v1/challenges/:id**
  - Description: Get details for a specific challenge
  - Response:
    ```json
    {
      "id": 123,
      "title": "Free Throw Challenge",
      "description": "Complete 10 free throws in a row. Video must show continuous shots without editing.",
      "sport_type": "basketball",
      "difficulty": "easy",
      "points_reward": 10,
      "badge_reward": "Free Throw Master",
      "is_paid": false,
      "entry_fee": null,
      "image_url": "https://example.com/images/free-throw.jpg",
      "requirements": {
        "equipment": ["Basketball", "Basketball court with free throw line"],
        "duration_seconds": 120,
        "description": "Find a basketball court with a free throw line. Set up your camera to capture both you and the basket. Make 10 consecutive free throws without editing the video."
      },
      "verification_rules": {
        "must_show_full_body": true,
        "must_show_ball_going_in": true,
        "continuous_footage": true
      },
      "has_submitted": false,
      "submission_status": null
    }
    ```
  - Frontend components:
    - `js/game/challenge-detail.js` (fetchChallengeDetails function)
    - `game/challenge-detail.html`

- **POST /api/v1/challenges/:id/submit**
  - Description: Submit a challenge attempt
  - Request headers: Authorization: `Bearer {jwt_token}`
  - Request body: Multipart form data with video file
  - Response:
    ```json
    {
      "id": 456,
      "challenge_id": 123,
      "status": "pending",
      "created_at": "2023-01-01T12:00:00Z",
      "video_url": "https://example.com/videos/submission.mp4"
    }
    ```
  - Frontend components:
    - `js/game/submit-challenge.js` (submitChallenge function)
    - `game/submit-challenge.html`

- **GET /api/v1/submissions**
  - Description: Get user's challenge submissions
  - Request headers: Authorization: `Bearer {jwt_token}`
  - Response:
    ```json
    {
      "submissions": [
        {
          "id": 456,
          "challenge_id": 123,
          "challenge_title": "Free Throw Challenge",
          "status": "verified",
          "points_earned": 10,
          "badge_earned": "Free Throw Master",
          "created_at": "2023-01-01T12:00:00Z",
          "video_url": "https://example.com/videos/submission.mp4" 
        }
      ]
    }
    ```

## Models

### User
- `id`: integer
- `name`: string
- `email`: string
- `phone`: string
- `firebase_uid`: string
- `sport`: string
- `location`: string
- `sign_in_count`: integer
- `referrer`: string
- `signup_platform`: string
- `signup_location`: string
- `created_at`: datetime
- `updated_at`: datetime

### Stream
- `id`: integer
- `user_id`: integer
- `title`: string
- `description`: text
- `sport`: string
- `location`: string
- `status`: enum (pending, live, ended, processing)
- `cloudflare_uid`: string
- `stream_key`: string
- `rtmps_url`: string
- `created_at`: datetime
- `updated_at`: datetime

### StreamChunk
- `id`: integer
- `stream_id`: integer
- `sequence_number`: integer
- `recorded_at`: datetime
- `data`: active_storage_attachment
- `created_at`: datetime
- `updated_at`: datetime

### Prospect (Waitlist)
- `id`: integer
- `name`: string
- `email`: string
- `phone`: string
- `sport`: string
- `goal`: string
- `location`: string
- `created_at`: datetime
- `updated_at`: datetime

### Challenge
- `id`: integer
- `title`: string
- `description`: text
- `sport_type`: string
- `difficulty`: string (easy, medium, hard)
- `points_reward`: integer
- `badge_reward`: string
- `is_paid`: boolean
- `entry_fee`: decimal
- `image_url`: string
- `requirements`: jsonb (equipment, duration_seconds, description)
- `verification_rules`: jsonb (must_show_full_body, must_show_ball_going_in, etc.)
- `created_at`: datetime
- `updated_at`: datetime

### Submission
- `id`: integer
- `user_id`: integer
- `challenge_id`: integer
- `status`: enum (pending, verified, rejected)
- `video_url`: string
- `admin_notes`: text
- `points_earned`: integer
- `badge_earned`: string
- `created_at`: datetime
- `updated_at`: datetime

## Error Codes
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 422: Unprocessable Entity (Validation Error)
- 500: Internal Server Error 