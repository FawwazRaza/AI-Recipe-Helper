# AI Recipe Assistant

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Vercel Deployment Instructions

This repository is ready for deployment on Vercel.

1. Go to [Vercel](https://vercel.com/) and sign in with your GitHub account.
2. Click **New Project** and import your repository: [AI-Recipe-Helper](https://github.com/FawwazRaza/AI-Recipe-Helper)
3. Vercel will auto-detect the Next.js framework and suggest the correct settings.
4. Click **Deploy**.
5. Your app will be live on a Vercel-provided URL!

### Notes
- All necessary files for Vercel deployment are included.
- The `.gitignore` is configured for Node.js and Next.js best practices.
- If you use environment variables, add them in the Vercel dashboard under Project Settings > Environment Variables.

### 9.2 Vercel Deployment

To deploy your application on Vercel:

1. **Connect GitHub Repository to Vercel**
   - Go to [Vercel](https://vercel.com/).
   - Click **New Project** and select your GitHub account.
   - Find and import your repository: `AI-Recipe-Helper`.

2. **Configure Build Settings**
   - Vercel will auto-detect Next.js and set the correct build command (`next build`) and output directory (`.next`).
   - No changes are needed unless you have custom requirements.

3. **Set Up Environment Variables (if needed)**
   - In the Vercel dashboard, go to your project > Settings > Environment Variables.
   - Add any variables your app needs (e.g., API keys). These will be available at build and runtime.

4. **Deploy the Application**
   - Click **Deploy**.
   - Vercel will build and deploy your app. You'll get a live URL when it's done.

5. **Verify the Deployed Site**
   - Visit the provided Vercel URL to ensure your app works as expected.
   - If you push new commits to GitHub, Vercel will automatically redeploy.

#### Troubleshooting
- If you see build errors, check your environment variables and logs in the Vercel dashboard.
- For custom domains, add them in the Vercel dashboard under Domains.
- For advanced configuration, edit the `vercel.json` file in your repo.
