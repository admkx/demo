// Initialize an empty array to hold the data from the API
let data = [];

// Fetch data from the API and initialize the filters
async function fetchData() {
  try {
    // Show the loading message
    document.getElementById('loading').style.display = 'block';
    
    // Fetch data from the provided URL
    const response = await fetch('https://dujour.squiz.cloud/developer-challenge/data', { method: 'GET' });
    // Convert the response to JSON format and store it in the data array
    data = await response.json();
    
    // Hide the loading message
    document.getElementById('loading').style.display = 'none';
    
    // Call the function to initialize the filters with the fetched data
    initializeFilters();
    // Call the function to apply the filters and display the data
    applyFilters();
  } catch (error) {
    // Log any errors that occur during the fetch process
    console.error('Error fetching data:', error);
  }
}

// Initialize the country and industry filters with unique values from the data
function initializeFilters() {
  // Get references to the country and industry select elements in the HTML
  const countrySelect = document.getElementById('country');
  const industrySelect = document.getElementById('industry');

  // Create an object to count the number of occurrences of each country
  const countryCount = data.reduce((acc, item) => {
    acc[item.country] = (acc[item.country] || 0) + 1;
    return acc;
  }, {});

  // Create an object to count the number of occurrences of each industry
  const industryCount = data.reduce((acc, item) => {
    acc[item.industry] = (acc[item.industry] || 0) + 1;
    return acc;
  }, {});

  // Get the unique country values and sort them alphabetically
  const countries = Object.keys(countryCount).sort();
  // Get the unique industry values and sort them alphabetically
  const industries = Object.keys(industryCount).sort();

  // Add each unique country as an option in the country select element, along with the count
  countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.text = `${country} (${countryCount[country]})`;
    countrySelect.appendChild(option);
  });

  // Add each unique industry as an option in the industry select element, along with the count
  industries.forEach(industry => {
    const option = document.createElement('option');
    option.value = industry;
    option.text = `${industry} (${industryCount[industry]})`;
    industrySelect.appendChild(option);
  });
}

// Apply filters and sort to the data and update the display
function applyFilters() {
  // Get the selected values from the country and industry select elements
  const country = document.getElementById('country').value.toLowerCase();
  const industry = document.getElementById('industry').value.toLowerCase();
  const order = document.querySelector('input[name="order"]:checked').value;
  const sort = document.querySelector('input[name="sort"]:checked').value;

  // Filter the data based on the selected country and industry values
  let filteredData = data.filter(item =>
    // Check if the country filter is empty or matches the item's country
    (!country || item.country.toLowerCase() === country) &&
    // Check if the industry filter is empty or matches the item's industry
    (!industry || item.industry.toLowerCase() === industry)
    );

  // Sort the filtered data based on the selected sort option and order
  filteredData.sort((a, b) => {
    // If sorting by name, compare the names alphabetically
    if (sort === 'name') {
      return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    // If sorting by number of employees, compare the numbers
    } else {
      return order === 'asc' ? a.numberOfEmployees - b.numberOfEmployees : b.numberOfEmployees - a.numberOfEmployees;
    }
  });

  // Display the filtered and sorted data in the HTML
  displayResults(filteredData);
}

// Display the results in the HTML
function displayResults(data) {
  // Get the reference to the results list element in the HTML
  const results = document.getElementById('results');
  // Create the list items for each data entry and join them into a single string
  results.innerHTML = data.map(item => `<li class="py-2">${item.name} · ${item.country} · ${item.industry} · ${item.numberOfEmployees}</li>`).join('');
}

// Fetch data when the page loads
window.onload = fetchData;
