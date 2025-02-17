import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

# Setup ChromeDriver with webdriver-manager
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

# Define the URL for the politician's profile
url = "https://www.capitoltrades.com/politicians/P000197"

# Navigate to the webpage
driver.get(url)

# Wait for the table to be present (this ensures the page is loaded and the table is available)
try:
    table = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "table"))
    )
    print("Table found!")
except:
    print("Table not found!")
    driver.quit()
    exit()

# Get the page source after the table is found
page_source = driver.page_source

# Parse the page source with BeautifulSoup
soup = BeautifulSoup(page_source, "html.parser")

# Find the table containing the trades data
table = soup.find("table", {"class": "table"})

# Initialize empty lists to store the data
traded_issuers = []
traded_dates = []

# Loop through the rows of the table to extract issuer and date
for row in table.find_all("tr")[1:]:  # Skip the header row
    cols = row.find_all("td")
    if len(cols) > 1:
        traded_issuers.append(cols[0].text.strip())  # Issuer is in the first column
        traded_dates.append(cols[1].text.strip())    # Date is in the second column

# Now create the HTML page with the extracted data
html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Politician Trades</title>
</head>
<body>
    <h1>Traded Issuers and Dates</h1>
    <table border="1">
        <tr>
            <th>Traded Issuer</th>
            <th>Traded Date</th>
        </tr>
"""

# Add rows to the HTML table for each traded issuer and date
for issuer, date in zip(traded_issuers, traded_dates):
    html_content += f"""
        <tr>
            <td>{issuer}</td>
            <td>{date}</td>
        </tr>
    """

# Close the table and the HTML tags
html_content += """
    </table>
</body>
</html>
"""

# Save the HTML content to a file
with open("traded_issuers.html", "w") as file:
    file.write(html_content)

# Close the WebDriver session
driver.quit()

print("HTML file generated: traded_issuers.html")
