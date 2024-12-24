import { getUserStatements } from "@/app/actions"
import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/auth.config"
import { DashboardClient } from "@/components/dashboard-client"
import { DbStatement } from "../../types/types"
import { redirect } from "next/navigation"

// export const pieData: {
//   summary: CategorySummary[];
//   fileName: string;
//   categories: Record<string, string>;
//   totalSpend: number;
//   transactions: Array<{ Amount: number; Merchant: string }>;
// } = {
//   summary: [
//     {
//       "Total": 102.34,
//       "Category": "Amazon",
//       "Transactions": {
//         "AMAZONCA WWWAMAZONCA": 6.99,
//         "AMZN MKTP CAZMR WWWAMAZONCA": 56.7,
//         "AMZN MKTP CAZNL WWWAMAZONCA": 10.46,
//         "AMZN MKTP CAZSEV WWWAMAZONCA": 17.01,
//         "PRIMEVIDEOCEPKPL WWWAMAZONCA": 5.59,
//         "AMAZONCA PRIME MEMBER AMAZONCAPRI": 5.59
//       }
//     },
//     {
//       "Total": 12.99,
//       "Category": "Gym",
//       "Transactions": {
//         "MEMBERSHIP FEE INSTALLMENT": 12.99
//       }
//     },
//     {
//       "Total": 1118.81,
//       "Category": "Transport",
//       "Transactions": {
//         "AIRCANADA WINNIPEG": 612.42,
//         "AMTRAK INT WASHINGTON": 314.81,
//         "UBER LIME SAN FRANCISCO": 21.26,
//         "COMPASS ACCOUNT BURN (14)": 44.8,
//         "UBER TRIP HTTPSHELPUB (9)": 125.52
//       }
//     },
//     {
//       "Total": 477.76,
//       "Category": "Groceries",
//       "Transactions": {
//         "SAFEWAY (3)": 336.96,
//         "E FOOD INC (2)": 42.42,
//         "TOP TEN PRODUCE (4)": 98.38
//       }
//     },
//     {
//       "Total": 37.57,
//       "Category": "DoorDash",
//       "Transactions": {
//         "DOORDASHDASHPASS DOWNTOWN TORONT": 10.49,
//         "DOORDASHLEPETITSAIG DOWNTOWN TORONT": 27.08
//       }
//     },
//     {
//       "Total": 147.54,
//       "Category": "Evo",
//       "Transactions": {
//         "EVO CAR SHARE (13)": 147.54
//       }
//     },
//     {
//       "Total": 502.51,
//       "Category": "Clothes",
//       "Transactions": {
//         "LULULEMON": 12.54,
//         "LULULEMONCOM (2)": 499.97,
//         "LULULEMON ATHLETICA BC": -10
//       }
//     },
//     {
//       "Total": 291.27,
//       "Category": "Restaurants",
//       "Transactions": {
//         "KITS": 77.95,
//         "AHISUSHI": 19.26,
//         "RAMENDANBOROBSON": 39.09,
//         "BREKA BAKERY CAFE": 15.4,
//         "SING SING BEER BAR": 32.78,
//         "KELLY CARLOS OBRYAN": 27.47,
//         "THIERRY CHOCOLATES MT": 5.07,
//         "RAMEN DANBO KERRISDALE": 37.08,
//         "BANANA LEAF IN KITSILAN": 37.17
//       }
//     },
//     {
//       "Total": 147.43,
//       "Category": "Online Subscriptions",
//       "Transactions": {
//         "NETFLIXCOM": 6.71,
//         "APPLECOMBILL (2)": 11.18,
//         "PLAYSTATION NETWORK": 100.79,
//         "CURSOR AI POWERED IDE NEW YORK": 28.75
//       }
//     },
//     {
//       "Total": 33.84,
//       "Category": "Personal",
//       "Transactions": {
//         "BC LIQUOR VANCOUVE": 17.84,
//         "UNIVERSITY GOLF CLUB": 16
//       }
//     },
//     {
//       "Total": 24.64,
//       "Category": "Bills",
//       "Transactions": {
//         "BELL MEDIA": 24.64
//       }
//     },
//     {
//       "Total": 50.84,
//       "Category": "Movies",
//       "Transactions": {
//         "CINEPLEX": 15.66,
//         "CINEPLEX WEB QP": 35.18
//       }
//     },
//     {
//       "Total": 74.24,
//       "Category": "Rogers",
//       "Transactions": {
//         "ROGERS": 74.24
//       }
//     },
//     {
//       "Total": 474.6,
//       "Category": "Online Shopping",
//       "Transactions": {
//         "EXPEDIA EXPEDIACA": 474.6
//       }
//     }
//   ],
//   fileName: "November Transactions",
//   categories: {
//     "KITS": "Restaurants",
//     "ROGERS": "Rogers",
//     "SAFEWAY": "Groceries",
//     "AHISUSHI": "Restaurants",
//     "CINEPLEX": "Movies",
//     "LULULEMON": "Clothes",
//     "BELL MEDIA": "Bills",
//     "E FOOD INC": "Groceries",
//     "NETFLIXCOM": "Online Subscriptions",
//     "APPLECOMBILL": "Online Subscriptions",
//     "LULULEMONCOM": "Clothes",
//     "EVO CAR SHARE": "Evo",
//     "CINEPLEX WEB QP": "Movies",
//     "TOP TEN PRODUCE": "Groceries",
//     "RAMENDANBOROBSON": "Restaurants",
//     "BREKA BAKERY CAFE": "Restaurants",
//     "EXPEDIA EXPEDIACA": "Online Shopping",
//     "AIRCANADA WINNIPEG": "Transport",
//     "BC LIQUOR VANCOUVE": "Personal",
//     "SING SING BEER BAR": "Restaurants",
//     "KELLY CARLOS OBRYAN": "Restaurants",
//     "PLAYSTATION NETWORK": "Online Subscriptions",
//     "AMAZONCA WWWAMAZONCA": "Amazon",
//     "COMPASS ACCOUNT BURN": "Transport",
//     "UNIVERSITY GOLF CLUB": "Personal",
//     "AMTRAK INT WASHINGTON": "Transport",
//     "THIERRY CHOCOLATES MT": "Restaurants",
//     "UBER TRIP HTTPSHELPUB": "Transport",
//     "LULULEMON ATHLETICA BC": "Clothes",
//     "RAMEN DANBO KERRISDALE": "Restaurants",
//     "BANANA LEAF IN KITSILAN": "Restaurants",
//     "UBER LIME SAN FRANCISCO": "Transport",
//     "MEMBERSHIP FEE INSTALLMENT": "Gym",
//     "AMZN MKTP CAZMR WWWAMAZONCA": "Amazon",
//     "AMZN MKTP CAZNL WWWAMAZONCA": "Amazon",
//     "AMZN MKTP CAZSEV WWWAMAZONCA": "Amazon",
//     "PRIMEVIDEOCEPKPL WWWAMAZONCA": "Amazon",
//     "CURSOR AI POWERED IDE NEW YORK": "Online Subscriptions",
//     "DOORDASHDASHPASS DOWNTOWN TORONT": "DoorDash",
//     "AMAZONCA PRIME MEMBER AMAZONCAPRI": "Amazon",
//     "DOORDASHLEPETITSAIG DOWNTOWN TORONT": "DoorDash"
//   },
//   totalSpend: 3516.38,
//   transactions: [
//     {
//       "Amount": 10.46,
//       "Merchant": "AMZN MKTP CAZNL WWWAMAZONCA"
//     },
//     {
//       "Amount": 17.01,
//       "Merchant": "AMZN MKTP CAZSEV WWWAMAZONCA"
//     },
//     {
//       "Amount": 12.99,
//       "Merchant": "MEMBERSHIP FEE INSTALLMENT"
//     },
//     {
//       "Amount": 56.7,
//       "Merchant": "AMZN MKTP CAZMR WWWAMAZONCA"
//     },
//     {
//       "Amount": 10.99,
//       "Merchant": "UBER TRIP HTTPSHELPUB"
//     },
//     {
//       "Amount": 23.25,
//       "Merchant": "TOP TEN PRODUCE"
//     },
//     {
//       "Amount": 3.2,
//       "Merchant": "COMPASS ACCOUNT BURN"
//     },
//     {
//       "Amount": 3.2,
//       "Merchant": "COMPASS ACCOUNT BURN"
//     },
//     {
//       "Amount": 27.08,
//       "Merchant": "DOORDASHLEPETITSAIG DOWNTOWN TORONT"
//     },
//     {
//       "Amount": 8.53,
//       "Merchant": "EVO CAR SHARE"
//     },
//     {
//       "Amount": 12.42,
//       "Merchant": "UBER TRIP HTTPSHELPUB"
//     },
//     {
//       "Amount": 12.54,
//       "Merchant": "LULULEMON"
//     },
//     {
//       "Amount": 57.64,
//       "Merchant": "SAFEWAY"
//     },
//     {
//       "Amount": 39.09,
//       "Merchant": "RAMENDANBOROBSON"
//     },
//     {
//       "Amount": 28.75,
//       "Merchant": "CURSOR AI POWERED IDE NEW YORK"
//     },
//     {
//       "Amount": 13.14,
//       "Merchant": "UBER TRIP HTTPSHELPUB"
//     },
//     {
//       "Amount": 25.65,
//       "Merchant": "UBER TRIP HTTPSHELPUB"
//     },
//     {
//       "Amount": 5.79,
//       "Merchant": "EVO CAR SHARE"
//     },
//     {
//       "Amount": 9.08,
//       "Merchant": "EVO CAR SHARE"
//     },
//     {
//       "Amount": 3.2,
//       "Merchant": "COMPASS ACCOUNT BURN"
//     },
//     {
//       "Amount": 5.79,
//       "Merchant": "EVO CAR SHARE"
//     },
//     {
//       "Amount": 3.2,
//       "Merchant": "COMPASS ACCOUNT BURN"
//     },
//     {
//       "Amount": 42.69,
//       "Merchant": "TOP TEN PRODUCE"
//     },
//     {
//       "Amount": 15.4,
//       "Merchant": "BREKA BAKERY CAFE"
//     },
//     {
//       "Amount": 27.47,
//       "Merchant": "KELLY CARLOS OBRYAN"
//     },
//     {
//       "Amount": 100.79,
//       "Merchant": "PLAYSTATION NETWORK"
//     },
//     {
//       "Amount": 8.98,
//       "Merchant": "TOP TEN PRODUCE"
//     },
//     {
//       "Amount": 11.1,
//       "Merchant": "UBER TRIP HTTPSHELPUB"
//     },
//     {
//       "Amount": 16,
//       "Merchant": "UNIVERSITY GOLF CLUB"
//     },
//     {
//       "Amount": 37.17,
//       "Merchant": "BANANA LEAF IN KITSILAN"
//     },
//     {
//       "Amount": 24.64,
//       "Merchant": "BELL MEDIA"
//     },
//     {
//       "Amount": 15.66,
//       "Merchant": "CINEPLEX"
//     },
//     {
//       "Amount": 3.2,
//       "Merchant": "COMPASS ACCOUNT BURN"
//     },
//     {
//       "Amount": 7.44,
//       "Merchant": "EVO CAR SHARE"
//     },
//     {
//       "Amount": 11.16,
//       "Merchant": "UBER TRIP HTTPSHELPUB"
//     },
//     {
//       "Amount": 6.99,
//       "Merchant": "AMAZONCA WWWAMAZONCA"
//     },
//     {
//       "Amount": 35.18,
//       "Merchant": "CINEPLEX WEB QP"
//     },
//     {
//       "Amount": 3.2,
//       "Merchant": "COMPASS ACCOUNT BURN"
//     },
//     {
//       "Amount": 6.71,
//       "Merchant": "NETFLIXCOM"
//     },
//     {
//       "Amount": 5.59,
//       "Merchant": "PRIMEVIDEOCEPKPL WWWAMAZONCA"
//     },
//     {
//       "Amount": 3.2,
//       "Merchant": "COMPASS ACCOUNT BURN"
//     },
//     {
//       "Amount": 3.2,
//       "Merchant": "COMPASS ACCOUNT BURN"
//     },
//     {
//       "Amount": 3.2,
//       "Merchant": "COMPASS ACCOUNT BURN"
//     },
//     {
//       "Amount": 9.08,
//       "Merchant": "EVO CAR SHARE"
//     },
//     {
//       "Amount": 131.44,
//       "Merchant": "SAFEWAY"
//     },
//     {
//       "Amount": 10.49,
//       "Merchant": "DOORDASHDASHPASS DOWNTOWN TORONT"
//     },
//     {
//       "Amount": 21.26,
//       "Merchant": "UBER LIME SAN FRANCISCO"
//     },
//     {
//       "Amount": 25.45,
//       "Merchant": "UBER TRIP HTTPSHELPUB"
//     },
//     {
//       "Amount": 612.42,
//       "Merchant": "AIRCANADA WINNIPEG"
//     },
//     {
//       "Amount": 12.92,
//       "Merchant": "EVO CAR SHARE"
//     },
//     {
//       "Amount": -10,
//       "Merchant": "LULULEMON ATHLETICA BC"
//     },
//     {
//       "Amount": 430.08,
//       "Merchant": "LULULEMONCOM"
//     },
//     {
//       "Amount": 74.24,
//       "Merchant": "ROGERS"
//     },
//     {
//       "Amount": 19.26,
//       "Merchant": "AHISUSHI"
//     },
//     {
//       "Amount": 5.59,
//       "Merchant": "AMAZONCA PRIME MEMBER AMAZONCAPRI"
//     },
//     {
//       "Amount": 23.1,
//       "Merchant": "E FOOD INC"
//     },
//     {
//       "Amount": 314.81,
//       "Merchant": "AMTRAK INT WASHINGTON"
//     },
//     {
//       "Amount": 474.6,
//       "Merchant": "EXPEDIA EXPEDIACA"
//     },
//     {
//       "Amount": 69.89,
//       "Merchant": "LULULEMONCOM"
//     },
//     {
//       "Amount": 9.31,
//       "Merchant": "UBER TRIP HTTPSHELPUB"
//     },
//     {
//       "Amount": 19.32,
//       "Merchant": "E FOOD INC"
//     },
//     {
//       "Amount": 37.08,
//       "Merchant": "RAMEN DANBO KERRISDALE"
//     },
//     {
//       "Amount": 4.47,
//       "Merchant": "APPLECOMBILL"
//     },
//     {
//       "Amount": 16.22,
//       "Merchant": "EVO CAR SHARE"
//     },
//     {
//       "Amount": 147.88,
//       "Merchant": "SAFEWAY"
//     },
//     {
//       "Amount": 5.07,
//       "Merchant": "THIERRY CHOCOLATES MT"
//     },
//     {
//       "Amount": 6.71,
//       "Merchant": "APPLECOMBILL"
//     },
//     {
//       "Amount": 17.84,
//       "Merchant": "BC LIQUOR VANCOUVE"
//     },
//     {
//       "Amount": 10.73,
//       "Merchant": "EVO CAR SHARE"
//     },
//     {
//       "Amount": 18.41,
//       "Merchant": "EVO CAR SHARE"
//     },
//     {
//       "Amount": 21.55,
//       "Merchant": "EVO CAR SHARE"
//     },
//     {
//       "Amount": 77.95,
//       "Merchant": "KITS"
//     },
//     {
//       "Amount": 32.78,
//       "Merchant": "SING SING BEER BAR"
//     },
//     {
//       "Amount": 9.08,
//       "Merchant": "EVO CAR SHARE"
//     },
//     {
//       "Amount": 12.92,
//       "Merchant": "EVO CAR SHARE"
//     },
//     {
//       "Amount": 6.3,
//       "Merchant": "UBER TRIP HTTPSHELPUB"
//     },
//     {
//       "Amount": 3.2,
//       "Merchant": "COMPASS ACCOUNT BURN"
//     },
//     {
//       "Amount": 3.2,
//       "Merchant": "COMPASS ACCOUNT BURN"
//     },
//     {
//       "Amount": 3.2,
//       "Merchant": "COMPASS ACCOUNT BURN"
//     },
//     {
//       "Amount": 3.2,
//       "Merchant": "COMPASS ACCOUNT BURN"
//     },
//     {
//       "Amount": 23.46,
//       "Merchant": "TOP TEN PRODUCE"
//     },
//     {
//       "Amount": 3.2,
//       "Merchant": "COMPASS ACCOUNT BURN"
//     }
//   ]
// }

// function DashboardClient({
//   initialStatements, 
//   userName
// }: {
//   initialStatements: DbStatement[],
//   userName: string
// }) {

//   const [selectedStatement, setSelectedStatement] = useState<DbStatement | null>(
//     initialStatements.length > 0 ? initialStatements[0] : null
//   )

//   return (
//     <div className="flex h-[calc(100vh-4rem)]">
//       <DashboardSidebar 
//         statements={initialStatements}
//         selectedStatement={selectedStatement}
//         onStatementSelect={setSelectedStatement}
//         userName={userName}
//       />
//       <main className="flex-1 overflow-auto p-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           <div className="col-span-1 md:col-span-2 lg:col-span-2">
//             {/* Other widgets */}
//           </div>
//           <div className="col-span-1 bg-card rounded-lg shadow">
//             {selectedStatement && (
//               <PieChartComponent data={selectedStatement.data} />
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

export default async function DashboardPage() {
  const statements = (await getUserStatements() || []) as DbStatement[]
  const session = await getServerSession(authOptions)

  return (
    <DashboardClient 
      initialStatements={statements}
      userName={session?.user?.name || ""}
    />
  )
}

// export default async function DashboardPage() {
//   const statements = (await getUserStatements() || []) as DbStatement[];
//   const session = await getServerSession(authOptions)

//   return (
//     <div className="flex h-[calc(100vh-4rem)]">
//       <DashboardSidebar initialStatements={statements} userName={session?.user?.name || ""} />
//       <main className="flex-1 overflow-auto p-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           <div className="col-span-1 md:col-span-2 lg:col-span-2">
//             {/* Widget 1 */ }
//           </div>
//           <div className="col-span-1 bg-card rounded-lg shadow">
//             <PieChartComponent data={pieData} />
//           </div>
//           <div className="col-span-1 md:col-span-2 bg-card rounded-lg shadow">
//             {/* Widget 2 */}
//           </div>
//           <div className="col-span-1 bg-card rounded-lg shadow">
//             {/* Widget 4 */}
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }
