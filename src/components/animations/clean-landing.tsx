'use client'

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Upload, Brain, Sparkles, FileSpreadsheet, Loader2 } from "lucide-react"
import { PieChartComponent } from "../charts/pie-chart"
import { InsightsComponent } from "../features/insights/insights"
import { SummaryTable } from "../features/insights/summary-table"
import { DbStatement } from "@/app/types/types"

const randomBudgets = {
  Shopping: 2200,
  Groceries: 650,
  Travel: 900,
  Fitness: 200,
  "Food & Drink": 300,
  Utilities: 180,
  Pets: 250,
  Transportation: 150,
  Subscriptions: 120,
  Entertainment: 180
}

const statement: DbStatement = {
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
          "Total": 295.13,
          "Category": "Pets",
          "Transactions": {
            "Pet Supplies (2)": 295.13
          },
          "BiggestTransaction": {
            "amount": 165.13,
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
      "budgets": randomBudgets,
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
          "Amount": 295.13,
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

function UploadView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col items-center justify-center gap-6 p-8"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
        <div className="relative bg-card border-2 border-dashed border-muted-foreground/25 rounded-3xl p-12 flex flex-col items-center gap-4 hover:border-primary/50 transition-colors">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
             <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Drop Statement</h3>
            <p className="text-sm text-muted-foreground">.CSV from any bank</p>
          </div>
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full"
      >
        <FileSpreadsheet className="h-3 w-3" />
        <span>chase_feb_2024.csv detected</span>
      </motion.div>
    </motion.div>
  )
}

function ProcessingView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center gap-8 p-8"
    >
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 border-4 border-muted rounded-full" />
        <div className="absolute inset-0 border-4 border-t-primary border-r-primary/50 border-b-transparent border-l-transparent rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="h-8 w-8 text-primary animate-pulse" />
        </div>
      </div>

      <div className="space-y-4 w-full max-w-xs">
        <ProcessingStep label="Parsing transactions..." delay={0} />
        <ProcessingStep label="Reconciling merchants..." delay={0.5} />
        <ProcessingStep label="Categorizing with AI..." delay={1} />
        <ProcessingStep label="Generating insights..." delay={1.5} />
      </div>
    </motion.div>
  )
}

function ProcessingStep({ label, delay }: { label: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 text-sm"
    >
      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
      <span className="text-muted-foreground">{label}</span>
    </motion.div>
  )
}

function DashboardView({ statement }: { statement: DbStatement }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-full overflow-y-auto p-4 md:p-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Top Cards */}
        <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <div className="text-xs text-muted-foreground uppercase">Total Spend</div>
            <div className="text-2xl font-bold mt-1">$3,692.90</div>
          </div>
          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <div className="text-xs text-muted-foreground uppercase">Top Category</div>
            <div className="text-2xl font-bold mt-1 text-primary">Shopping</div>
          </div>
           <div className="bg-card border rounded-xl p-4 shadow-sm hidden md:block">
            <div className="text-xs text-muted-foreground uppercase">Transactions</div>
            <div className="text-2xl font-bold mt-1">36</div>
          </div>
           <div className="bg-card border rounded-xl p-4 shadow-sm hidden md:block">
            <div className="text-xs text-muted-foreground uppercase">Avg. Daily</div>
            <div className="text-2xl font-bold mt-1">$142</div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-1 border rounded-2xl p-4 bg-card/50">
           <PieChartComponent statement={statement} />
        </div>
        <div className="col-span-1 md:col-span-1 border rounded-2xl p-4 bg-card/50">
           <InsightsComponent statement={statement} />
        </div>
        <div className="col-span-full lg:col-span-1 border rounded-2xl p-4 bg-card/50 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-hidden">
                <SummaryTable statement={statement} />
            </div>
        </div>
      </div>
    </motion.div>
  )
}

export function CleanLanding({ targetPath }: { targetPath: string }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (step === 0) { // Upload View
      timer = setTimeout(() => setStep(1), 2500)
    } else if (step === 1) { // Processing View
      timer = setTimeout(() => setStep(2), 2500)
    } else if (step === 2) { // Dashboard View
      timer = setTimeout(() => setStep(0), 8000)
    }
    return () => clearTimeout(timer)
  }, [step])

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden p-4 sm:p-8">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex flex-col items-center w-full max-w-[1800px] mx-auto gap-8">
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 z-10 mb-2"
        >
             <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight tracking-tighter mb-4 sm:mb-6 px-2">
                <span className="bg-gradient-to-r from-primary via-primary to-yellow-600 dark:from-primary dark:via-cyan-400 dark:to-primary bg-clip-text text-transparent">
                    Broke AF?
                </span>
                <br />
                <span className="text-foreground">There's a Reason.</span>
             </h1>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full aspect-[4/5] md:aspect-[16/10] lg:aspect-[16/9] bg-card border rounded-4xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[2000px] group"
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="h-10 md:h-12 border-b bg-muted/20 backdrop-blur-sm flex items-center px-4 md:px-6 gap-2 z-20">
            <div className="flex gap-1.5 md:gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/20" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/20" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/20" />
            </div>
            <div className="ml-auto text-[10px] md:text-xs font-mono text-muted-foreground/50 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                spendy.af
            </div>
            </div>

            <div className="flex-1 relative overflow-hidden bg-background/50 backdrop-blur-sm">
            <AnimatePresence mode="wait">
                {step === 0 && <UploadView key="upload" />}
                {step === 1 && <ProcessingView key="processing" />}
                {step === 2 && <DashboardView key="dashboard" statement={statement} />}
            </AnimatePresence>
            </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="z-10"
        >
            <Link href={targetPath}>
                <Button size="lg" className="h-12 md:h-14 px-8 md:px-10 rounded-full text-base md:text-lg shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all">
                    Enter App <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </motion.div>

      </div>
    </div>
  )
}
