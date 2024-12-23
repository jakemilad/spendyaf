amount_ranges = {
    "Starbucks Coffee": (3, 15),
    "Amazon Purchase": (10, 300),
    "Grocery Store": (20, 200),
    "Electricity Bill": (50, 150),
    "Netflix Subscription": (9, 16),
    "Gas Station": (30, 100),
    "Restaurant Dinner": (20, 100),
    "Pharmacy": (5, 50),
    "Uber Ride": (10, 50),
    "Spotify Subscription": (9, 10),
    "Target Purchase": (20, 150),
    "Online Course": (50, 500),
    "Gym Membership": (30, 60),
    "Cell Phone Bill": (50, 100),
    "Book Store": (5, 50),
    "Hardware Store": (10, 200),
    "Fast Food": (5, 20),
    "Movie Theater": (10, 30),
    "Car Wash": (10, 30),
    "Clothing Store": (20, 150),
    "Electronics": (50, 500),
    "Pet Supplies": (10, 100),
    "Parking Fee": (5, 25),
    "Hotel Stay": (100, 500),
    "Airline Ticket": (100, 1000)
}

adjusted_transactions = [
    [
        datetime.strptime(row[0], "%Y-%m-%d").strftime("%d %b %Y"),
        datetime.strptime(row[1], "%Y-%m-%d").strftime("%d %b %Y"),
        row[2],
        round(random.uniform(*amount_ranges[row[2]]), 2)
    ]
    for row in transactions
]

adjusted_csv_file_path = "/mnt/data/february_transactions_adjusted.csv"
with open(adjusted_csv_file_path, "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["Date", "Date Processed", "Description", "Amount"])
    writer.writerows(adjusted_transactions)

adjusted_csv_file_path
