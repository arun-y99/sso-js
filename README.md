# Single Sign-On (SSO) API

This is a simple implementation of a Single Sign-On (SSO) API for educational and demonstration purposes. The API provides three endpoints for user registration, login, and session token verification.

> **⚠️ Warning:**\
> This implementation is **not guaranteed secure** and should **not** be used in production environments. It is intended for learning purposes only.

---

## Table of Contents

- [Features](#features)
- [Endpoints](#endpoints)
  - [1. Register User](#1-register-user)
  - [2. Login User](#2-login-user)
  - [3. Verify Session Token](#3-verify-session-token)
- [How to Run](#how-to-run)
- [Disclaimer](#disclaimer)

---

## Features

- Register users with a unique username and password.
- Authenticate users via login and receive a session token.
- Verify session tokens to authenticate active user sessions.

---

## Endpoints

### 1. Register User

**Endpoint:**\
`POST /register`

**Description:**\
Registers a new user with a unique username and password.

**Request Body (JSON):**

```json
{
  "username": "example_user",
  "password": "example_password"
}
```

**Response (JSON):**

- **201 Created**
  ```json
  {
    "message": "User registered successfully"
  }
  ```
- **400 Bad Request**
  ```json
  {
    "error": "Username already exists"
  }
  ```

---

### 2. Login User

**Endpoint:**\
`POST /login`

**Description:**\
Authenticates a user and provides a session token if the username and password are correct.

**Request Body (JSON):**

```json
{
  "username": "example_user",
  "password": "example_password"
}
```

**Response (JSON):**

- **200 OK**
  ```json
  {
    "message": "Authentication successful",
    "token": "unique_session_token"
  }
  ```
- **401 Unauthorized**
  ```json
  {
    "error": "Invalid username or password"
  }
  ```

---

### 3. Verify Session Token

**Endpoint:**\
`GET /verify`

**Description:**\
Validates an active session token to ensure the user is authenticated.

**Request Header:**

```plaintext
Authorization: Bearer <session_token>
```

**Response (JSON):**

- **200 OK**
  ```json
  {
    "message": "Valid Token"
  }
  ```
- **401 Unauthorized**
  ```json
  {
    "error": "Invalid token"
  }
  ```

---

## How to Run

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```
2. Install [Node.js](https://nodejs.org/en/download). 

3. Install [MongoDB](https://www.mongodb.com/docs/manual/installation/).

4. Install the dependencies.
   ```bash
   npm install
   ```
5. Create a .env file in the root directory and add a [JWT token](https://dev.to/tkirwa/generate-a-random-jwt-secret-key-39j4).
   
   
6. Run the application:
   ```bash
   node server.js
   ```
7. Use an API client (e.g., Postman, curl) to test the endpoints.

---

## Disclaimer

This API is for demonstration purposes only and is not designed for secure authentication. Avoid using it in production environments or for any critical applications.

---

