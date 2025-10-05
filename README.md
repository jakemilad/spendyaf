# Spendy AF

> **Broke AF? There's a Reason.**

A modern, AI-powered financial expense analyzer that transforms your credit card statements into actionable insights. Upload your CSV statements and let AI automatically categorize transactions, generate insights, and visualize your spending patterns.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### AI-Powered Analysis

- **Automatic Categorization**: AI intelligently categorizes transactions into Shopping, Groceries, Travel, Entertainment, and more
- **Smart Insights**: Get personalized spending insights including daily/weekly averages, biggest transactions, and frequent merchants
- **AI Summaries**: Generate natural language summaries of your spending patterns with Claude AI

### Interactive Visualizations

- **Category Breakdown**: Interactive donut charts showing spending distribution by category
- **Time Series Analysis**: Track daily spending trends with clickable bar charts
- **Transaction Details**: Drill down into individual transactions by date
- **Comparative Analysis**: Compare spending across multiple statement periods

## Tech Stack

### Frontend

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend

- **Database**: [Neon PostgreSQL](https://neon.tech/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **AI Integration**:
  - [Anthropic Claude](https://www.anthropic.com/) (categorization & summaries)
  - [OpenAI](https://openai.com/) (alternative AI provider)

### UI Components

- [Radix UI](https://www.radix-ui.com/) primitives
- Custom components built with shadcn/ui
- Toast notifications with [Sonner](https://sonner.emilkowal.ski/)

## Key Features Walkthrough

### 1. Upload Your Statement

Upload CSV files from your credit card provider. The app automatically parses transactions.

### 2. AI Categorization

Watch as AI intelligently categorizes each transaction into meaningful categories like:

- Shopping
- Food & Drink
- Travel
- Entertainment
- Fitness
- Pets
- And more...

### 3. Visualize Your Spending

Explore interactive charts:

- **Donut Chart**: See category distribution at a glance
- **Time Series**: Track spending over time
- **Insights Cards**: Key metrics like daily average and biggest transaction

### 4. AI Summaries

Generate personalized AI summaries that highlight:

- Spending trends
- Areas of concern
- Money-saving opportunities
- Behavioral patterns

### 5. Compare Periods

Upload multiple statements to compare spending across months and identify trends.

### Components

All UI components are built with shadcn/ui and can be customized in `src/components/ui/`.

## Contributing

Contributions are welcome.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Jake Milad**

- GitHub: [@jakemilad](https://github.com/jakemilad)
- LinkedIn: [Jake Milad](https://linkedin.com/in/jakemilad)
