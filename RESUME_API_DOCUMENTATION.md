# Resume Management API Documentation

## Overview

The Resume Management API allows job seekers to upload, manage, and set primary resumes for job applications.

## Base URL

```
http://localhost:5002/api/resumes
```

## Authentication

All endpoints require authentication. Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Upload Resume

**POST** `/upload`

Upload a new resume file (PDF or Word document).

**Request:**

- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body Parameters**:
  - `title` (string, required): Resume title (e.g., "Senior Developer 2024")
  - `resume` (file, required): PDF or Word document (.pdf, .doc, .docx)

**Constraints**:

- Maximum file size: 5MB
- Allowed formats: PDF, Word (.doc, .docx)
- Maximum 5 resumes per user

**Example cURL**:

```bash
curl -X POST http://localhost:5002/api/resumes/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Senior Developer Resume" \
  -F "resume=@resume.pdf"
```

**Success Response** (201 Created):

```json
{
  "status": "success",
  "message": "Resume uploaded successfully",
  "data": {
    "resume": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439010",
      "title": "Senior Developer Resume",
      "fileName": "resume.pdf",
      "filePath": "/uploads/resumes/resume-1234567890.pdf",
      "fileSize": 245000,
      "mimeType": "application/pdf",
      "isPrimary": true,
      "uploadedAt": "2024-04-16T10:30:00.000Z",
      "createdAt": "2024-04-16T10:30:00.000Z",
      "updatedAt": "2024-04-16T10:30:00.000Z"
    }
  }
}
```

**Error Response** (400/500):

```json
{
  "status": "fail",
  "message": "Maximum 5 resumes allowed per user"
}
```

---

### 2. Get All Resumes

**GET** `/`

Retrieve all resumes for the current user.

**Request:**

- **Method**: GET

**Example cURL**:

```bash
curl http://localhost:5002/api/resumes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response** (200 OK):

```json
{
  "status": "success",
  "data": {
    "count": 2,
    "resumes": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439010",
        "title": "Senior Developer Resume",
        "fileName": "resume.pdf",
        "fileSize": 245000,
        "mimeType": "application/pdf",
        "isPrimary": true,
        "uploadedAt": "2024-04-16T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439010",
        "title": "Full Stack Developer",
        "fileName": "resume2.pdf",
        "fileSize": 210000,
        "mimeType": "application/pdf",
        "isPrimary": false,
        "uploadedAt": "2024-04-15T14:20:00.000Z"
      }
    ]
  }
}
```

---

### 3. Get Primary Resume

**GET** `/primary/get`

Retrieve the user's primary resume.

**Request:**

- **Method**: GET

**Example cURL**:

```bash
curl http://localhost:5002/api/resumes/primary/get \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response** (200 OK):

```json
{
  "status": "success",
  "data": {
    "resume": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439010",
      "title": "Senior Developer Resume",
      "fileName": "resume.pdf",
      "fileSize": 245000,
      "mimeType": "application/pdf",
      "isPrimary": true,
      "uploadedAt": "2024-04-16T10:30:00.000Z"
    }
  }
}
```

**Error Response** (404 Not Found):

```json
{
  "status": "fail",
  "message": "No primary resume set"
}
```

---

### 4. Get Single Resume

**GET** `/:id`

Retrieve details of a specific resume.

**Request:**

- **Method**: GET
- **URL Parameters**:
  - `id` (string, required): Resume ID

**Example cURL**:

```bash
curl http://localhost:5002/api/resumes/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response** (200 OK):

```json
{
  "status": "success",
  "data": {
    "resume": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439010",
      "title": "Senior Developer Resume",
      "fileName": "resume.pdf",
      "fileSize": 245000,
      "mimeType": "application/pdf",
      "isPrimary": true,
      "uploadedAt": "2024-04-16T10:30:00.000Z"
    }
  }
}
```

---

### 5. Download Resume

**GET** `/:id/download`

Download the resume file.

**Request:**

- **Method**: GET
- **URL Parameters**:
  - `id` (string, required): Resume ID

**Example cURL**:

```bash
curl http://localhost:5002/api/resumes/507f1f77bcf86cd799439011/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded_resume.pdf
```

**Response**: Binary file data (file download)

---

### 6. Update Resume

**PATCH** `/:id`

Update resume title.

**Request:**

- **Method**: PATCH
- **URL Parameters**:
  - `id` (string, required): Resume ID
- **Body Parameters**:
  - `title` (string, required): New resume title

**Example cURL**:

```bash
curl -X PATCH http://localhost:5002/api/resumes/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Senior Developer Resume"}'
```

**Success Response** (200 OK):

```json
{
  "status": "success",
  "message": "Resume updated successfully",
  "data": {
    "resume": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439010",
      "title": "Updated Senior Developer Resume",
      "fileName": "resume.pdf",
      "fileSize": 245000,
      "mimeType": "application/pdf",
      "isPrimary": true,
      "uploadedAt": "2024-04-16T10:30:00.000Z"
    }
  }
}
```

---

### 7. Set Primary Resume

**PATCH** `/:id/set-primary`

Set a resume as the primary resume for job applications.

**Request:**

- **Method**: PATCH
- **URL Parameters**:
  - `id` (string, required): Resume ID
- **Body**: Empty JSON object `{}`

**Example cURL**:

```bash
curl -X PATCH http://localhost:5002/api/resumes/507f1f77bcf86cd799439012/set-primary \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Success Response** (200 OK):

```json
{
  "status": "success",
  "message": "Resume set as primary successfully",
  "data": {
    "resume": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439010",
      "title": "Full Stack Developer",
      "fileName": "resume2.pdf",
      "fileSize": 210000,
      "mimeType": "application/pdf",
      "isPrimary": true,
      "uploadedAt": "2024-04-15T14:20:00.000Z"
    }
  }
}
```

---

### 8. Delete Resume

**DELETE** `/:id`

Delete a resume.

**Request:**

- **Method**: DELETE
- **URL Parameters**:
  - `id` (string, required): Resume ID

**Example cURL**:

```bash
curl -X DELETE http://localhost:5002/api/resumes/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response** (200 OK):

```json
{
  "status": "success",
  "message": "Resume deleted successfully"
}
```

**Notes**:

- If the deleted resume was primary, the next most recent resume becomes primary
- The resume file is deleted from the server

---

## Error Handling

### Common Error Responses

**401 Unauthorized** (Missing or Invalid Token):

```json
{
  "status": "fail",
  "message": "Not authenticated"
}
```

**403 Forbidden** (Insufficient Permissions):

```json
{
  "status": "fail",
  "message": "Not authorized to access this resume"
}
```

**404 Not Found** (Resource Not Found):

```json
{
  "status": "fail",
  "message": "Resume not found"
}
```

**400 Bad Request** (Invalid Input):

```json
{
  "status": "fail",
  "message": "Please provide a resume title"
}
```

**413 Payload Too Large** (File Size Exceeded):

```json
{
  "status": "fail",
  "message": "File size must be less than 5MB"
}
```

---

## Constraints & Limits

| Constraint           | Limit                   |
| -------------------- | ----------------------- |
| Max file size        | 5 MB                    |
| Max resumes per user | 5                       |
| Allowed formats      | PDF, Word (.doc, .docx) |
| Title max length     | None (trimmed)          |

---

## Usage Examples

### Example 1: Complete Upload & Set Primary Flow

```bash
# 1. Upload resume
curl -X POST http://localhost:5002/api/resumes/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=My First Resume" \
  -F "resume=@resume.pdf"

# Response includes resume ID: "507f1f77bcf86cd799439011"

# 2. Get all resumes
curl http://localhost:5002/api/resumes \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Upload second resume
curl -X POST http://localhost:5002/api/resumes/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Alternative Resume" \
  -F "resume=@resume2.pdf"

# Response includes resume ID: "507f1f77bcf86cd799439012"

# 4. Set second resume as primary
curl -X PATCH http://localhost:5002/api/resumes/507f1f77bcf86cd799439012/set-primary \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# 5. Verify primary resume
curl http://localhost:5002/api/resumes/primary/get \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Implementation Notes

1. **First Resume**: The first resume uploaded is automatically set as primary
2. **Primary Resume**: Used in job applications by default
3. **File Storage**: Resume files are stored in `backend/uploads/resumes/`
4. **File Management**: Deleting a resume also removes the file from the server
5. **Authorization**: Users can only access their own resumes

---

## Testing with Postman

1. Create a Postman collection with these endpoints
2. Set `{{base_url}}` = `http://localhost:5002/api`
3. Set `{{token}}` = Your JWT token in the Authorization header
4. Use the examples above for each endpoint

---

## Integration with Job Applications

When a user applies for a job, the backend will:

1. Fetch the user's primary resume using `GET /primary/get`
2. Include resume information in the application
3. Store the resume ID with the application
