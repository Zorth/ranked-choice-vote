# Ranked Choice Vote

A robust, real-time web application for creating and participating in ranked-choice polls. Built with **Next.js**, **Convex**, and **Tailwind CSS**.

## Overview
Ranked Choice Voting (RCV) allows voters to rank candidates in order of preference. If a candidate wins a majority of first-preference votes, they are declared the winner. If no candidate wins a majority, the candidate with the fewest votes is eliminated, and their votes are redistributed to the next choice on those ballots. This process continues until a winner is found.

This application provides a seamless interface to create these polls, share them with a unique link, and visualize the elimination rounds in real-time.

## Key Features
- 🗳️ **Intuitive Ranking UI**: Easy drag-and-drop style ranking for voters.
- 📊 **Dynamic Results**: Automatic calculation of Instant-Runoff rounds with visual progress.
- 🔄 **Editable Votes**: Secure voter identification via local storage allows users to refine their choices.
- 📅 **Deadline Management**: Polls automatically expire and are cleaned up after a grace period.
- 📱 **Responsive Design**: Fully functional on desktop and mobile devices.

## Tech Stack
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database**: [Convex](https://convex.dev/) (Real-time backend)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)

## Getting Started

### Prerequisites
- Node.js installed
- A Convex account for the backend

### Local Development
1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Initialize Convex**:
   ```bash
   npx convex dev
   ```
   *Follow the prompts to create a new project.*
4. **Run the development server**:
   ```bash
   pnpm dev
   ```

## Deployment

This project is optimized for [Vercel](https://vercel.com/).

1. Connect your GitHub repository to Vercel.
2. Add the following Environment Variables in the Vercel dashboard:
   - `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL.
   - `CONVEX_DEPLOYMENT`: Your Convex deployment name.
3. Vercel will automatically build and deploy your application.

## License
This project is licensed under the **Polyform Noncommercial License 1.0.0**. See the [LICENSE](LICENSE) file for details.
