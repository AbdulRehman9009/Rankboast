# Environment Setup Guide for RankBoast

This guide explains how to obtain the necessary credentials for the RankBoast project.

## 1. Database (PostgreSQL)
We recommend using **Neon.tech** for a serverless PostgreSQL experience.
- Sign up at [Neon.tech](https://neon.tech).
- Create a new project.
- Copy the **Connection String** and set it as `DATABASE_URL` in your `.env`.

## 2. NextAuth Configuration
- `NEXTAUTH_URL`: In development, set this to `http://localhost:3000`. In production, use your actual domain.
- `NEXTAUTH_SECRET`: Generate a secure random string. You can use this command in your terminal:
  ```bash
  openssl rand -base64 32
  ```

## 3. OpenRouter API Key (AI Engine)
RankBoast uses OpenRouter to access various AI models (like Gemini and DeepSeek).
- Go to [OpenRouter.ai](https://openrouter.ai).
- Create an account and generate an **API Key**.
- Ensure you have some credits if using paid models, though the project is configured to use free models where possible.

## 4. Google OAuth (Google Login)
To enable "Sign in with Google":
- Go to the [Google Cloud Console](https://console.cloud.google.com).
- Create a new project.
- Search for **APIs & Services** > **Credentials**.
- Create an **OAuth 2.0 Client ID**.
- Set **Authorized redirect URIs** to `http://localhost:3000/api/auth/callback/google`.
- Copy the `Client ID` and `Client Secret`.

## 5. Email (Nodemailer / SMTP)
For sending password reset emails, we recommend using Gmail with an **App Password**.
- `SMTP_HOST`: `smtp.gmail.com`
- `SMTP_PORT`: `587`
- `SMTP_SECURE`: `false` (for TLS)
- `SMTP_USER`: Your Gmail address.
- `SMTP_PASS`: Your 16-character **App Password** (obtained from your Google Account settings under Security > 2-Step Verification).

---

### Final Check
After filling out your `.env` file, the application will automatically validate these variables on startup. If any are missing or invalid, the server will throw an error with details.
