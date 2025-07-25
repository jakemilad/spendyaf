'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"
import { SummaryTable } from "../features/insights/summary-table"
import { DbStatement } from "@/app/types/types"
import { fadeInUp, staggerContainer } from "./animations"

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
    <motion.section 
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="min-h-[40vh] flex items-center gap-6 pb-8 pt-6 md:py-10"
    >
      <motion.div 
        variants={fadeInUp}
        className="flex max-w-[980px] flex-col items-start gap-4"
      >
        <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl bg-gradient-to-r from-primary to-yellow-700 bg-clip-text text-transparent">
          You're Spendy AF,
          <br className="hidden sm:inline" />
          be serious.
        </h1>
        <p className="max-w-[700px] text-xl text-muted-foreground">
          Transform your financial data into actionable insights with our AI-powered expense analyzer.
        </p>
        <motion.div 
          variants={fadeInUp}
          className="mt-8"
        >
          <Link 
            href={targetPath} 
            className={buttonVariants({ 
              size: "lg",
              className: "text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform"
            })}
          >
            Get Started
          </Link>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

export function FeaturesSection({ features }: { features: any[] }) {
  return (
    <motion.section 
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="py-24"
    >
      <div className="grid gap-16 md:grid-cols-2">
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            variants={fadeInUp}
            className="group relative rounded-2xl border p-8 shadow-lg transition-all hover:shadow-xl"
          >
            <div className="aspect-[16/10] relative overflow-hidden rounded-xl mb-8">
              <Image
                src={feature.image}
                alt={feature.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index < 2}
              />
              {/* <SummaryTable statement={statement} /> */}
            </div>
            <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
            <p className="text-lg text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
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