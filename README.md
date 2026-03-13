# RankBoast - AI-Powered SEO Analysis & Content Generation

RankBoast is a state-of-the-art SEO platform designed to help digital marketers and business owners optimize their online presence through advanced competitor analysis, automated site auditing, and AI-driven content generation.

## 🚀 Features

- **SEO Site Audit**: Comprehensive analysis of any URL with actionable insights.
- **Competitor Tracking**: Monitor and compare competitor performance.
- **AI Content Generator**: Create high-quality, SEO-optimized content in seconds.
- **Link Visualizer**: Interactive mapping of site structures and backlink profiles.
- **Secure Authentication**: Robust session management and password recovery.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **Database**: [Prisma](https://prisma.io) with PostgreSQL
- **AI Engine**: [OpenAI](https://openai.com) & [OpenRouter](https://openrouter.ai)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with [shadcn/ui](https://ui.shadcn.com)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Validation**: [Zod](https://zod.dev)

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- API keys for OpenAI/OpenRouter and Gemini

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AbdulRehman9009/Rankboast
   cd rankboast
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add the required variables (see `.env.example`).

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔒 Security & Server Rules

- **Strict CSP & Headers**: Hardened security headers via `next.config.ts`.
- **Rate Limiting**: Integrated API protection to prevent abuse.
- **Client/Server Validation**: End-to-end type safety and validation with Zod.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
