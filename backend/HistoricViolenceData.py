from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import time

# Initialize the Chrome driver with options
service = Service(executable_path="chromedriver-mac-arm64/chromedriver")
driver = webdriver.Chrome(service=service)

URL = "https://compstat.nypdonline.org/"
driver.get(URL)

# Function to select a borough from the dropdown and scrape data
def select_borough_and_scrape_data(borough_name):
    try:
        # Wait for the dropdown to be clickable and click it
        dropdown = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "kendo-dropdownlist.k-dropdownlist"))
        )
        dropdown.click()

        # Wait for the options to be visible and select the desired borough
        options_list = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.XPATH, "//ul[@class='k-list-ul']"))
        )
        options = options_list.find_elements(By.TAG_NAME, "li")
        
        for option in options:
            if borough_name in option.text:
                option.click()
                break

        # Wait for the data to load
        time.sleep(3)

        # Extract the table data from the div with class 'k-grid-content k-virtual-content'
        table = driver.find_element(By.CSS_SELECTOR, "div.k-grid-content.k-virtual-content")
        rows = table.find_elements(By.CSS_SELECTOR, "tr.k-master-row")

        # Extract rows
        data = []
        for row in rows:
            cols = row.find_elements(By.TAG_NAME, "td")
            filtered_cols = [cols[i].text.replace(',', '') for i in range(1, len(cols)) if (i % 3) == 1]  # Skip first element and take every third
            data.append(filtered_cols)

        # Remove the first element of the data array
        if data:
            data = data[1:]

        # Keep only the 8th element
        if len(data) >= 8:
            data = [data[7]]
        else:
            data = []

        # Split the data into week_to_date, 28_day, and year_to_date
        week_to_date = [data[0][0]] if data else [None]
        twenty_eight_day = [data[0][1]] if data else [None]
        year_to_date = [data[0][2]] if data else [None]

        return week_to_date, twenty_eight_day, year_to_date

    except Exception as e:
        return None, None, None

# List of boroughs to scrape
boroughs = ['Brooklyn North', 'Brooklyn South', 'Bronx', 'Manhattan North', 'Manhattan South', 'Queens North', 'Queens South', 'Staten Island']  # Add more as needed

# Initialize data structures
week_to_date_data = {}
twenty_eight_day_data = {}
year_to_date_data = {}

# Scrape data for each borough
for borough in boroughs:
    week_to_date, twenty_eight_day, year_to_date = select_borough_and_scrape_data(borough)
    if week_to_date and twenty_eight_day and year_to_date:
        week_to_date_data[borough] = week_to_date[0]
        twenty_eight_day_data[borough] = twenty_eight_day[0]
        year_to_date_data[borough] = year_to_date[0]

# Create DataFrames and save to CSV files
week_to_date_df = pd.DataFrame([week_to_date_data])
twenty_eight_day_df = pd.DataFrame([twenty_eight_day_data])
year_to_date_df = pd.DataFrame([year_to_date_data])

week_to_date_df.to_csv('total_crime_wtd.csv', index=False)
twenty_eight_day_df.to_csv('total_crime_28d.csv', index=False)
year_to_date_df.to_csv('total_crime_ytd.csv', index=False)

print('Data saved to CSV files.')

# Close the driver
driver.quit()
