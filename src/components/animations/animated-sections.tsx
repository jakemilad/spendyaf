'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { SummaryTable } from "../features/insights/summary-table"
import { PieChartComponent } from "../charts/pie-chart"
import TransactionsChart from "../charts/timeseries"
import { InsightsComponent } from "../features/insights/insights"
import { DbStatement } from "@/app/types/types"
import { Sparkles, TrendingUp, Shield, Zap } from "lucide-react"

const statement: DbStatement =
  {
    "id": "17",
    "user_id": "yacoub.milad@gmail.com",
    "data": {
      "summary": [
        {
          "Total": 1951.61,
          "Category": "Shopping",
          "Transactions": {
            "Book Store (2)": 56.28,
            "Amazon Purchase": 177.82,
            "Electronics (4)": 1195.31,
            "Clothing Store (2)": 210.33,
            "Target Purchase (3)": 311.87
          },
          "BiggestTransaction": {
            "amount": 448.07,
            "merchant": "Electronics"
          }
        },
        {
          "Total": 555.43,
          "Category": "Groceries",
          "Transactions": {
            "Grocery Store (3)": 555.43
          },
          "BiggestTransaction": {
            "amount": 192.95,
            "merchant": "Grocery Store"
          }
        },
        {
          "Total": 539.91,
          "Category": "Travel",
          "Transactions": {
            "Hotel Stay (3)": 539.91
          },
          "BiggestTransaction": {
            "amount": 208.76,
            "merchant": "Hotel Stay"
          }
        },
        {
          "Total": 162.62,
          "Category": "Fitness",
          "Transactions": {
            "Gym Membership (3)": 162.62
          },
          "BiggestTransaction": {
            "amount": 58.91,
            "merchant": "Gym Membership"
          }
        },
        {
          "Total": 141.15,
          "Category": "Food & Drink",
          "Transactions": {
            "Fast Food (3)": 37.75,
            "Starbucks Coffee": 11.68,
            "Restaurant Dinner": 91.72
          },
          "BiggestTransaction": {
            "amount": 91.72,
            "merchant": "Restaurant Dinner"
          }
        },
        {
          "Total": 125.73,
          "Category": "Utilities",
          "Transactions": {
            "Electricity Bill": 125.73
          },
          "BiggestTransaction": {
            "amount": 125.73,
            "merchant": "Electricity Bill"
          }
        },
        {
          "Total": 116.46,
          "Category": "Pets",
          "Transactions": {
            "Pet Supplies (2)": 116.46
          },
          "BiggestTransaction": {
            "amount": 65.13,
            "merchant": "Pet Supplies"
          }
        },
        {
          "Total": 42.1,
          "Category": "Transportation",
          "Transactions": {
            "Car Wash": 10.87,
            "Parking Fee (2)": 31.23
          },
          "BiggestTransaction": {
            "amount": 23.6,
            "merchant": "Parking Fee"
          }
        },
        {
          "Total": 31.45,
          "Category": "Subscriptions",
          "Transactions": {
            "Spotify Subscription": 9.26,
            "Netflix Subscription (2)": 22.19
          },
          "BiggestTransaction": {
            "amount": 11.26,
            "merchant": "Netflix Subscription"
          }
        },
        {
          "Total": 26.44,
          "Category": "Entertainment",
          "Transactions": {
            "Movie Theater": 26.44
          },
          "BiggestTransaction": {
            "amount": 26.44,
            "merchant": "Movie Theater"
          }
        }
      ],
      "fileName": "Feburary",
      "insights": {
        "averageSpend": {
          "daily": 142.03,
          "weekly": 923.22
        },
        "biggestTransaction": {
          "amount": 448.07,
          "merchant": "Electronics"
        },
        "biggestCategorySpend": {
          "total": 1951.61,
          "category": "Shopping"
        },
        "mostFrequentTransaction": {
          "total": 1195.31,
          "merchant": "Electronics",
          "frequency": 4
        }
      },
      "categories": {
        "Car Wash": "Transportation",
        "Fast Food": "Food & Drink",
        "Book Store": "Shopping",
        "Hotel Stay": "Travel",
        "Electronics": "Shopping",
        "Parking Fee": "Transportation",
        "Pet Supplies": "Pets",
        "Grocery Store": "Groceries",
        "Movie Theater": "Entertainment",
        "Clothing Store": "Shopping",
        "Gym Membership": "Fitness",
        "Amazon Purchase": "Shopping",
        "Target Purchase": "Shopping",
        "Electricity Bill": "Utilities",
        "Starbucks Coffee": "Food & Drink",
        "Restaurant Dinner": "Food & Drink",
        "Netflix Subscription": "Subscriptions",
        "Spotify Subscription": "Subscriptions"
      },
      "totalSpend": 3692.9,
      "transactions": [
        {
          "Date": 1706936400000,
          "Amount": 174.17,
          "Merchant": "Grocery Store"
        },
        {
          "Date": 1706936400000,
          "Amount": 146.97,
          "Merchant": "Hotel Stay"
        },
        {
          "Date": 1707109200000,
          "Amount": 65.13,
          "Merchant": "Pet Supplies"
        },
        {
          "Date": 1707109200000,
          "Amount": 26.44,
          "Merchant": "Movie Theater"
        },
        {
          "Date": 1707368400000,
          "Amount": 125.95,
          "Merchant": "Target Purchase"
        },
        {
          "Date": 1707368400000,
          "Amount": 188.31,
          "Merchant": "Grocery Store"
        },
        {
          "Date": 1707368400000,
          "Amount": 192.95,
          "Merchant": "Grocery Store"
        },
        {
          "Date": 1707454800000,
          "Amount": 11.68,
          "Merchant": "Starbucks Coffee"
        },
        {
          "Date": 1707541200000,
          "Amount": 448.07,
          "Merchant": "Electronics"
        },
        {
          "Date": 1707541200000,
          "Amount": 116.9,
          "Merchant": "Electronics"
        },
        {
          "Date": 1707541200000,
          "Amount": 11.38,
          "Merchant": "Book Store"
        },
        {
          "Date": 1707541200000,
          "Amount": 81.08,
          "Merchant": "Target Purchase"
        },
        {
          "Date": 1707627600000,
          "Amount": 58.91,
          "Merchant": "Gym Membership"
        },
        {
          "Date": 1707627600000,
          "Amount": 367.95,
          "Merchant": "Electronics"
        },
        {
          "Date": 1707714000000,
          "Amount": 44.9,
          "Merchant": "Book Store"
        },
        {
          "Date": 1707973200000,
          "Amount": 177.82,
          "Merchant": "Amazon Purchase"
        },
        {
          "Date": 1707973200000,
          "Amount": 7.63,
          "Merchant": "Parking Fee"
        },
        {
          "Date": 1708146000000,
          "Amount": 184.18,
          "Merchant": "Hotel Stay"
        },
        {
          "Date": 1708146000000,
          "Amount": 46.9,
          "Merchant": "Gym Membership"
        },
        {
          "Date": 1708232400000,
          "Amount": 91.72,
          "Merchant": "Restaurant Dinner"
        },
        {
          "Date": 1708232400000,
          "Amount": 9.26,
          "Merchant": "Spotify Subscription"
        },
        {
          "Date": 1708232400000,
          "Amount": 125.73,
          "Merchant": "Electricity Bill"
        },
        {
          "Date": 1708318800000,
          "Amount": 15.7,
          "Merchant": "Fast Food"
        },
        {
          "Date": 1708318800000,
          "Amount": 10.87,
          "Merchant": "Car Wash"
        },
        {
          "Date": 1708318800000,
          "Amount": 56.81,
          "Merchant": "Gym Membership"
        },
        {
          "Date": 1708405200000,
          "Amount": 14.47,
          "Merchant": "Fast Food"
        },
        {
          "Date": 1708578000000,
          "Amount": 7.58,
          "Merchant": "Fast Food"
        },
        {
          "Date": 1708750800000,
          "Amount": 11.26,
          "Merchant": "Netflix Subscription"
        },
        {
          "Date": 1708750800000,
          "Amount": 104.84,
          "Merchant": "Target Purchase"
        },
        {
          "Date": 1708750800000,
          "Amount": 51.33,
          "Merchant": "Pet Supplies"
        },
        {
          "Date": 1708837200000,
          "Amount": 101.7,
          "Merchant": "Clothing Store"
        },
        {
          "Date": 1708837200000,
          "Amount": 108.63,
          "Merchant": "Clothing Store"
        },
        {
          "Date": 1708923600000,
          "Amount": 262.39,
          "Merchant": "Electronics"
        },
        {
          "Date": 1709010000000,
          "Amount": 23.6,
          "Merchant": "Parking Fee"
        },
        {
          "Date": 1709096400000,
          "Amount": 10.93,
          "Merchant": "Netflix Subscription"
        },
        {
          "Date": 1709096400000,
          "Amount": 208.76,
          "Merchant": "Hotel Stay"
        }
      ]
    },
    "created_at": "2024-12-23 06:44:41.564936+00",
    "file_name": "Feburary"
  }

export function HeroSection({ targetPath }: { targetPath: string }) {
  return (
    <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-x-hidden py-2 sm:py-6 md:py-11">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-medium"
        >
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          <span>AI-Powered Financial Insights</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight tracking-tighter mb-4 sm:mb-6 px-2"
        >
          <span className="bg-gradient-to-r from-primary via-primary to-yellow-600 dark:from-primary dark:via-cyan-400 dark:to-primary bg-clip-text text-transparent">
            Broke AF?
          </span>
          <br />
          <span className="text-foreground">There's a Reason.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-12 px-4"
        >
          Your statement says you spent $4,000 this month. Cool, but on what? We use AI to figure out which transaction goes where,
          and give you the insights you need to understand your spending.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 px-4"
        >
          {[
            { icon: Zap, text: "Instant Analysis" },
            { icon: Shield, text: "Secure & Private" },
            { icon: TrendingUp, text: "Smart Insights" },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-card border shadow-sm"
            >
              <feature.icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
        >
          <Link
            href={targetPath}
            className={buttonVariants({
              size: "lg",
              className: "w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-7 rounded-full hover:scale-105 transition-all shadow-lg hover:shadow-xl group"
            })}
          >
            <span>Get Started Free</span>
            <Sparkles className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform" />
          </Link>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-7 rounded-full hover:scale-105 transition-all"
          >
            <a href="#features">
              See How It Works
            </a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto px-4"
        >
          {[
            { value: "AI", label: "Powered" },
            { value: "∞", label: "Categories" },
            { value: "<5s", label: "Analysis" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  return (
    <section className="w-full py-12 sm:py-16 md:py-24 overflow-x-hidden" id="features">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
            All Your Receipts, But Make Them Pretty
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Real demo with fake data (your real data is even more interesting)
          </p>
        </motion.div>

        <div className="grid gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-card rounded-2xl p-3 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border">
              <div className="mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">AI-Powered Categorization</h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Automatically categorizes and summarizes your spending</p>
              </div>
              <SummaryTable statement={statement} />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-card rounded-2xl p-3 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border h-full flex flex-col">
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">Spending Distribution</h3>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Interactive donut chart with category breakdown</p>
                </div>
                <div className="flex-1">
                  <PieChartComponent statement={statement} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-card rounded-2xl p-3 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border h-full flex flex-col">
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">Smart Insights</h3>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Key metrics and spending patterns at a glance</p>
                </div>
                <div className="flex-1">
                  <InsightsComponent statement={statement} />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-card rounded-2xl p-3 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border">
              <div className="mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">Time Series Analysis</h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Track your daily spending trends and click bars for transaction details</p>
              </div>
              <TransactionsChart statement={statement} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function CTASection({ targetPath }: { targetPath: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-24 rounded-3xl bg-gradient-to-r from-slate-950 to-slate-900 px-8 py-24 text-center text-white"
    >
      <h2 className="text-3xl font-bold md:text-4xl mb-6">Made by Jake Milad</h2>
      <p className="mx-auto mt-4 max-w-2xl text-slate-300 text-lg">
        Some links:
      </p>
      <Link
        href={targetPath}
        className={buttonVariants({
          variant: "secondary",
          size: "lg",
          className: "mt-8 px-8 py-6 text-lg rounded-full hover:scale-105 transition-transform"
        })}
      >
        LinkedIn
      </Link>
    </motion.section>
  )
}
