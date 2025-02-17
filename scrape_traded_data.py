import requests
from bs4 import BeautifulSoup
import csv
from datetime import datetime

# URL of the page to scrape
url = 'https://www.capitoltrades.com/politicians/P000197'  # Replace with the actual website URL

# Send a GET request to fetch the page content
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    # Parse the content of the page using BeautifulSoup
    soup = BeautifulSoup(response.content, 'html.parser')

    # Find the table element
    table = soup.find('table')  # Finds the first table, adjust if necessary

    # If a table is found
    if table:
        # Extract the headers (th elements)
        headers = [header.text.strip() for header in table.find_all('th')]
        headers.append('Price')  # Add 'Price' to the headers

        # Create or open CSV file to write results
        filename = f"scraped_table_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.csv"
        with open(filename, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(headers)  # Write the headers

            # Extract the rows of the table
            rows = table.find_all('tr')

            for row in rows:
                # Extract each cell in the row (td elements)
                cells = row.find_all('td')

                # If there are cells (avoid empty rows)
                if cells:
                    row_data = [cell.text.strip() for cell in cells]

                    # Check if there's a link to the trade detail page (last column or wherever the link is)
                    goto_trade_page = row_data[-2]  # Assuming 'Goto trade detail page' is in the second last column
                    
                    if 'Goto trade detail page' in goto_trade_page:
                        # Extract the trade ID (you might need to adjust this part based on the actual link structure)
                        link = row.find('a', href=True)
                        if link:
                            # Extract the trade ID from the link (assuming it's in the URL)
                            trade_url = link['href']
                            trade_id = trade_url.split('/')[-1]  # Extract ID from URL, e.g., "20003780587"
                            
                            # Construct the full URL for the trade details page
                            detail_url = f"https://www.capitoltrades.com/trades/{trade_id}"
                            print(f"Navigating to trade detail page: {detail_url}")  # Debug: Check the extracted link
                            
                            # Fetch the detailed page
                            detail_response = requests.get(detail_url)
                            if detail_response.status_code == 200:
                                detail_soup = BeautifulSoup(detail_response.content, 'html.parser')

                                # Extract the price from the detail page
                                price_div = detail_soup.find('div', {'class': 'flex place-content-center px-2 lg:px-3 xl:px-6 justify-end pr-0'})
                                if price_div:
                                    price_span = price_div.find('span')
                                    if price_span:
                                        price = price_span.text.strip()  # Extract the price
                                    else:
                                        price = 'N/A'
                                else:
                                    price = 'N/A'
                            else:
                                price = 'N/A'
                        else:
                            price = 'N/A'
                    else:
                        price = 'N/A'

                    # Add the price to the row data
                    row_data.append(price)

                    # Write row data to the CSV file
                    writer.writerow(row_data)

        print(f"Data successfully extracted and saved to {filename}")
    else:
        print("No table found on the page.")
else:
    print('Failed to retrieve the page.')
