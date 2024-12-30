
import { compareStatements, getAICategories } from "../actions";
import { Transaction } from "@/app/types/types";
import { LoadingOverlay } from "@/components/loading-overlay";

const transactions: Transaction[] = [
    {
      "Date": 1709269200000,
      "Amount": 9.99,
      "Merchant": "Spotify Subscription"
    },
    {
      "Date": 1709355600000,
      "Amount": 142.67,
      "Merchant": "Grocery Store"
    },
    {
      "Date": 1709442000000,
      "Amount": 7.85,
      "Merchant": "Starbucks Coffee"
    },
    {
      "Date": 1709614800000,
      "Amount": 156.78,
      "Merchant": "Hardware Store"
    },
    {
      "Date": 1709701200000,
      "Amount": 67.89,
      "Merchant": "Restaurant Dinner"
    },
    {
      "Date": 1709874000000,
      "Amount": 156.45,
      "Merchant": "Amazon Purchase"
    },
    {
      "Date": 1710046800000,
      "Amount": 57.23,
      "Merchant": "Gas Station"
    },
    {
      "Date": 1710129600000,
      "Amount": 24.5,
      "Merchant": "Movie Theater"
    },
    {
      "Date": 1710216000000,
      "Amount": 189.34,
      "Merchant": "Grocery Store"
    },
    {
      "Date": 1710388800000,
      "Amount": 15.67,
      "Merchant": "Fast Food"
    },
    {
      "Date": 1710475200000,
      "Amount": 28.9,
      "Merchant": "Uber Ride"
    },
    {
      "Date": 1710561600000,
      "Amount": 123.45,
      "Merchant": "Target Purchase"
    },
    {
      "Date": 1710734400000,
      "Amount": 42.18,
      "Merchant": "Pharmacy"
    },
    {
      "Date": 1710907200000,
      "Amount": 18.99,
      "Merchant": "Car Wash"
    },
    {
      "Date": 1711080000000,
      "Amount": 134.56,
      "Merchant": "Clothing Store"
    },
    {
      "Date": 1711252800000,
      "Amount": 67.89,
      "Merchant": "Pet Supplies"
    },
    {
      "Date": 1711339200000,
      "Amount": 45.99,
      "Merchant": "Gym Membership"
    },
    {
      "Date": 1711512000000,
      "Amount": 78.9,
      "Merchant": "Restaurant Dinner"
    },
    {
      "Date": 1711684800000,
      "Amount": 61.23,
      "Merchant": "Gas Station"
    },
    {
      "Date": 1711857600000,
      "Amount": 199.99,
      "Merchant": "Online Course"
    }
  ]

export default async function TestPage(){
    // const results = await compareStatements();
    const results = await getAICategories(transactions);
    return(
        <div>
            {/* {JSON.stringify(results, null, 2)} */}
            <LoadingOverlay isOpen={true} message="Processing..." />
        </div>
    )
}