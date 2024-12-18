const tempData = {
    "summary": [
      {
        "Total": 389.14,
        "Category": "Groceries",
        "Transactions": {
          "SAFEWAY (2)": 24.69,
          "E FOOD INC (3)": 57.38,
          "WHOLE FOODS MARKET": 49.59,
          "TOP TEN PRODUCE (9)": 257.48
        },
        "BiggestTransaction": {
          "amount": 60.17,
          "merchant": "TOP TEN PRODUCE"
        }
      },
      {
        "Total": 365.85,
        "Category": "Clothes",
        "Transactions": {
          "LULULEMONCOM": 155.9,
          "WINNERSHOMESENSE": 92.35,
          "LS THE ONLY VINTAGE": 117.6
        },
        "BiggestTransaction": {
          "amount": 155.9,
          "merchant": "LULULEMONCOM"
        }
      },
      {
        "Total": 325.45,
        "Category": "Restaurants",
        "Transactions": {
          "ANHANDCHI": 40.32,
          "MCDONALDS Q": 12.76,
          "OSAKA SUSHI": 24.15,
          "GRETA BAR YVR": 15,
          "SIEGELS BAGELS": 16.12,
          "THE CIDER HOUSE": 45.11,
          "BREKA BAKERY CAFE": 8.45,
          "BEANAROUNDTHEWORLD": 27.72,
          "PIZZA PIZZA VANCOU": 15.08,
          "RAMENDANBOKERRISDALE": 35.87,
          "BLARNEY STONE IRISH T": 32.67,
          "THIERRY CHOCOLATES MT": 14.43,
          "HARAMBE RESTAURANTETHI": 33.15,
          "RAIN OR SHINE HOMEMADE": 4.62
        },
        "BiggestTransaction": {
          "amount": 45.11,
          "merchant": "THE CIDER HOUSE"
        }
      },
      {
        "Total": 279.16,
        "Category": "Personal",
        "Transactions": {
          "KITS (2)": 58,
          "LONDON DRUGS": 21.25,
          "THE ARTONA GROUP INC": 93.62,
          "PURE INTEGRATIVE PHARMA": 47.22,
          "PINTOR BARBER BRITISH COLUMBI": 59.07
        },
        "BiggestTransaction": {
          "amount": 93.62,
          "merchant": "THE ARTONA GROUP INC"
        }
      },
      {
        "Total": 276.67,
        "Category": "Evo",
        "Transactions": {
          "EVO CAR SHARE (18)": 276.67
        },
        "BiggestTransaction": {
          "amount": 84,
          "merchant": "EVO CAR SHARE"
        }
      },
      {
        "Total": 232.09,
        "Category": "Online Shopping",
        "Transactions": {
          "AMAZON AMAZON": 7,
          "AMZN MKTP BSJ AMAZON": 147.73,
          "AMZN MKTP HOBUI AMAZON": 43.77,
          "AMZN MKTP HOCWI AMAZON": 33.59
        },
        "BiggestTransaction": {
          "amount": 147.73,
          "merchant": "AMZN MKTP BSJ AMAZON"
        }
      },
      {
        "Total": 196.11,
        "Category": "DoorDash",
        "Transactions": {
          "DOORDA DOORDASHKI": 71.18,
          "DOORDASHDASHPASS DOWNTOWN TORONT": 10.49,
          "DOORDASHPAPPAROTI DOWNTOWN TORONT": 22.76,
          "DOORDASHNOFRILLS DOWNTOWN TORONT (2)": 91.68
        },
        "BiggestTransaction": {
          "amount": 87.96,
          "merchant": "DOORDASHNOFRILLS DOWNTOWN TORONT"
        }
      },
      {
        "Total": 88.36,
        "Category": "Online Subscriptions",
        "Transactions": {
          "CRAVE": 24.64,
          "APPLEBILL (3)": 16.77,
          "CURSOR AI POWERED IDE": 28.37,
          "MEMBERSHIP FEE INSTALLMENT": 12.99,
          "AMAZON PRIME MEMBER AMAZONPRI": 5.59
        },
        "BiggestTransaction": {
          "amount": 28.37,
          "merchant": "CURSOR AI POWERED IDE"
        }
      },
      {
        "Total": 60.64,
        "Category": "Rogers",
        "Transactions": {
          "ROGERS": 60.64
        },
        "BiggestTransaction": {
          "amount": 60.64,
          "merchant": "ROGERS"
        }
      },
      {
        "Total": 35.2,
        "Category": "Transport",
        "Transactions": {
          "COMPASS ACCOUNT BURN (4)": 12.8,
          "COMPASS VENDING BURN (7)": 22.4
        },
        "BiggestTransaction": {
          "amount": 3.2,
          "merchant": "COMPASS VENDING BURN"
        }
      }
    ],
    "fileName": "October",
    "categories": {
      "KITS": "Personal",
      "CRAVE": "Online Subscriptions",
      "ROGERS": "Rogers",
      "SAFEWAY": "Groceries",
      "ANHANDCHI": "Restaurants",
      "APPLEBILL": "Online Subscriptions",
      "E FOOD INC": "Groceries",
      "MCDONALDS Q": "Restaurants",
      "OSAKA SUSHI": "Restaurants",
      "LONDON DRUGS": "Personal",
      "LULULEMONCOM": "Clothes",
      "AMAZON AMAZON": "Online Shopping",
      "EVO CAR SHARE": "Evo",
      "GRETA BAR YVR": "Restaurants",
      "SIEGELS BAGELS": "Restaurants",
      "THE CIDER HOUSE": "Restaurants",
      "TOP TEN PRODUCE": "Groceries",
      "WINNERSHOMESENSE": "Clothes",
      "BREKA BAKERY CAFE": "Restaurants",
      "DOORDA DOORDASHKI": "DoorDash",
      "BEANAROUNDTHEWORLD": "Restaurants",
      "PIZZA PIZZA VANCOU": "Restaurants",
      "WHOLE FOODS MARKET": "Groceries",
      "LS THE ONLY VINTAGE": "Clothes",
      "AMZN MKTP BSJ AMAZON": "Online Shopping",
      "COMPASS ACCOUNT BURN": "Transport",
      "COMPASS VENDING BURN": "Transport",
      "RAMENDANBOKERRISDALE": "Restaurants",
      "THE ARTONA GROUP INC": "Personal",
      "BLARNEY STONE IRISH T": "Restaurants",
      "CURSOR AI POWERED IDE": "Online Subscriptions",
      "THIERRY CHOCOLATES MT": "Restaurants",
      "AMZN MKTP HOBUI AMAZON": "Online Shopping",
      "AMZN MKTP HOCWI AMAZON": "Online Shopping",
      "HARAMBE RESTAURANTETHI": "Restaurants",
      "RAIN OR SHINE HOMEMADE": "Restaurants",
      "PURE INTEGRATIVE PHARMA": "Personal",
      "MEMBERSHIP FEE INSTALLMENT": "Online Subscriptions",
      "AMAZON PRIME MEMBER AMAZONPRI": "Online Subscriptions",
      "PINTOR BARBER BRITISH COLUMBI": "Personal",
      "DOORDASHDASHPASS DOWNTOWN TORONT": "DoorDash",
      "DOORDASHNOFRILLS DOWNTOWN TORONT": "DoorDash",
      "DOORDASHPAPPAROTI DOWNTOWN TORONT": "DoorDash"
    },
    "totalSpend": 2268.57,
    "transactions": [
      {
        "Date": 1727420400000,
        "Amount": 15,
        "Merchant": "GRETA BAR YVR"
      },
      {
        "Date": 1727506800000,
        "Amount": 32.67,
        "Merchant": "BLARNEY STONE IRISH T"
      },
      {
        "Date": 1727506800000,
        "Amount": 22.76,
        "Merchant": "DOORDASHPAPPAROTI DOWNTOWN TORONT"
      },
      {
        "Date": 1727593200000,
        "Amount": 32.35,
        "Merchant": "TOP TEN PRODUCE"
      },
      {
        "Date": 1727679600000,
        "Amount": 7.44,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1727679600000,
        "Amount": 16.22,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1727766000000,
        "Amount": 3.2,
        "Merchant": "COMPASS VENDING BURN"
      },
      {
        "Date": 1727766000000,
        "Amount": 3.2,
        "Merchant": "COMPASS VENDING BURN"
      },
      {
        "Date": 1727766000000,
        "Amount": 21.55,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1727852400000,
        "Amount": 6.71,
        "Merchant": "APPLEBILL"
      },
      {
        "Date": 1727852400000,
        "Amount": 47.22,
        "Merchant": "PURE INTEGRATIVE PHARMA"
      },
      {
        "Date": 1727852400000,
        "Amount": 42.27,
        "Merchant": "TOP TEN PRODUCE"
      },
      {
        "Date": 1727938800000,
        "Amount": 4.47,
        "Merchant": "APPLEBILL"
      },
      {
        "Date": 1727938800000,
        "Amount": 8.53,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1727938800000,
        "Amount": 15.12,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1728025200000,
        "Amount": 3.2,
        "Merchant": "COMPASS VENDING BURN"
      },
      {
        "Date": 1728025200000,
        "Amount": 18.48,
        "Merchant": "E FOOD INC"
      },
      {
        "Date": 1728025200000,
        "Amount": 14.02,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1728025200000,
        "Amount": 16.12,
        "Merchant": "SIEGELS BAGELS"
      },
      {
        "Date": 1728111600000,
        "Amount": 27.72,
        "Merchant": "BEANAROUNDTHEWORLD"
      },
      {
        "Date": 1728111600000,
        "Amount": 67.95,
        "Merchant": "KITS"
      },
      {
        "Date": 1728284400000,
        "Amount": 5.59,
        "Merchant": "AMAZON PRIME MEMBER AMAZONPRI"
      },
      {
        "Date": 1728284400000,
        "Amount": 3.2,
        "Merchant": "COMPASS VENDING BURN"
      },
      {
        "Date": 1728284400000,
        "Amount": -9.95,
        "Merchant": "KITS"
      },
      {
        "Date": 1728284400000,
        "Amount": 38.96,
        "Merchant": "TOP TEN PRODUCE"
      },
      {
        "Date": 1728370800000,
        "Amount": 3.2,
        "Merchant": "COMPASS VENDING BURN"
      },
      {
        "Date": 1728370800000,
        "Amount": 3.2,
        "Merchant": "COMPASS VENDING BURN"
      },
      {
        "Date": 1728370800000,
        "Amount": 18.11,
        "Merchant": "E FOOD INC"
      },
      {
        "Date": 1728457200000,
        "Amount": 3.2,
        "Merchant": "COMPASS VENDING BURN"
      },
      {
        "Date": 1728457200000,
        "Amount": 21.25,
        "Merchant": "LONDON DRUGS"
      },
      {
        "Date": 1728457200000,
        "Amount": 24.15,
        "Merchant": "OSAKA SUSHI"
      },
      {
        "Date": 1728543600000,
        "Amount": 10.49,
        "Merchant": "DOORDASHDASHPASS DOWNTOWN TORONT"
      },
      {
        "Date": 1728543600000,
        "Amount": 59.07,
        "Merchant": "PINTOR BARBER BRITISH COLUMBI"
      },
      {
        "Date": 1728543600000,
        "Amount": 60.64,
        "Merchant": "ROGERS"
      },
      {
        "Date": 1728543600000,
        "Amount": 16.6,
        "Merchant": "TOP TEN PRODUCE"
      },
      {
        "Date": 1728630000000,
        "Amount": 33.15,
        "Merchant": "HARAMBE RESTAURANTETHI"
      },
      {
        "Date": 1728630000000,
        "Amount": 45.11,
        "Merchant": "THE CIDER HOUSE"
      },
      {
        "Date": 1728716400000,
        "Amount": 5.24,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1728716400000,
        "Amount": 6.34,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1728802800000,
        "Amount": 12.96,
        "Merchant": "TOP TEN PRODUCE"
      },
      {
        "Date": 1728889200000,
        "Amount": 40.32,
        "Merchant": "ANHANDCHI"
      },
      {
        "Date": 1728889200000,
        "Amount": 147.73,
        "Merchant": "AMZN MKTP BSJ AMAZON"
      },
      {
        "Date": 1728889200000,
        "Amount": 43.77,
        "Merchant": "AMZN MKTP HOBUI AMAZON"
      },
      {
        "Date": 1728889200000,
        "Amount": 93.62,
        "Merchant": "THE ARTONA GROUP INC"
      },
      {
        "Date": 1728975600000,
        "Amount": 3.2,
        "Merchant": "COMPASS ACCOUNT BURN"
      },
      {
        "Date": 1728975600000,
        "Amount": 20.79,
        "Merchant": "E FOOD INC"
      },
      {
        "Date": 1728975600000,
        "Amount": 9.08,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1728975600000,
        "Amount": 14.43,
        "Merchant": "THIERRY CHOCOLATES MT"
      },
      {
        "Date": 1729062000000,
        "Amount": 7,
        "Merchant": "AMAZON AMAZON"
      },
      {
        "Date": 1729062000000,
        "Amount": 3.2,
        "Merchant": "COMPASS ACCOUNT BURN"
      },
      {
        "Date": 1729062000000,
        "Amount": 24.64,
        "Merchant": "CRAVE"
      },
      {
        "Date": 1729062000000,
        "Amount": 13.64,
        "Merchant": "SAFEWAY"
      },
      {
        "Date": 1729148400000,
        "Amount": 117.6,
        "Merchant": "LS THE ONLY VINTAGE"
      },
      {
        "Date": 1729234800000,
        "Amount": 12.92,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1729234800000,
        "Amount": 49.59,
        "Merchant": "WHOLE FOODS MARKET"
      },
      {
        "Date": 1729234800000,
        "Amount": 92.35,
        "Merchant": "WINNERSHOMESENSE"
      },
      {
        "Date": 1729321200000,
        "Amount": 15.12,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1729321200000,
        "Amount": 21.34,
        "Merchant": "TOP TEN PRODUCE"
      },
      {
        "Date": 1729321200000,
        "Amount": 71.18,
        "Merchant": "DOORDA DOORDASHKI"
      },
      {
        "Date": 1729407600000,
        "Amount": 35.87,
        "Merchant": "RAMENDANBOKERRISDALE"
      },
      {
        "Date": 1729407600000,
        "Amount": 3.72,
        "Merchant": "DOORDASHNOFRILLS DOWNTOWN TORONT"
      },
      {
        "Date": 1729407600000,
        "Amount": 87.96,
        "Merchant": "DOORDASHNOFRILLS DOWNTOWN TORONT"
      },
      {
        "Date": 1729407600000,
        "Amount": 7.99,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1729407600000,
        "Amount": 10.73,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1729407600000,
        "Amount": 12.76,
        "Merchant": "MCDONALDS Q"
      },
      {
        "Date": 1729407600000,
        "Amount": 11.05,
        "Merchant": "SAFEWAY"
      },
      {
        "Date": 1729494000000,
        "Amount": 3.2,
        "Merchant": "COMPASS ACCOUNT BURN"
      },
      {
        "Date": 1729494000000,
        "Amount": 15.12,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1729580400000,
        "Amount": 3.2,
        "Merchant": "COMPASS ACCOUNT BURN"
      },
      {
        "Date": 1729666800000,
        "Amount": 28.37,
        "Merchant": "CURSOR AI POWERED IDE"
      },
      {
        "Date": 1729666800000,
        "Amount": 5.24,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1729666800000,
        "Amount": 23.94,
        "Merchant": "TOP TEN PRODUCE"
      },
      {
        "Date": 1729753200000,
        "Amount": 84,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1729753200000,
        "Amount": 155.9,
        "Merchant": "LULULEMONCOM"
      },
      {
        "Date": 1729839600000,
        "Amount": 5.59,
        "Merchant": "APPLEBILL"
      },
      {
        "Date": 1729839600000,
        "Amount": 8.45,
        "Merchant": "BREKA BAKERY CAFE"
      },
      {
        "Date": 1729839600000,
        "Amount": 5.24,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1729839600000,
        "Amount": 8.89,
        "Merchant": "TOP TEN PRODUCE"
      },
      {
        "Date": 1729926000000,
        "Amount": 16.77,
        "Merchant": "EVO CAR SHARE"
      },
      {
        "Date": 1729926000000,
        "Amount": 15.08,
        "Merchant": "PIZZA PIZZA VANCOU"
      },
      {
        "Date": 1730012400000,
        "Amount": 33.59,
        "Merchant": "AMZN MKTP HOCWI AMAZON"
      },
      {
        "Date": 1730012400000,
        "Amount": 60.17,
        "Merchant": "TOP TEN PRODUCE"
      },
      {
        "Date": 1730098800000,
        "Amount": 12.99,
        "Merchant": "MEMBERSHIP FEE INSTALLMENT"
      },
      {
        "Date": 1730098800000,
        "Amount": 4.62,
        "Merchant": "RAIN OR SHINE HOMEMADE"
      }
    ]
  }