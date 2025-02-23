// This array will hold the data fetched from the API
let data = [];

// This function starts the application by fetching the data and initializing filters
async function initializeApp() {
  try {
    // Show the loading message while data is being fetched
    showLoading(true);

    // Fetch data from the API with retry logic
    const fetchedData = await fetchDataWithRetry('https://dujour.squiz.cloud/developer-challenge/data');

    // Store the fetched data in the global 'data' variable
    data = fetchedData;

    // Hide the loading message after data is fetched
    showLoading(false);

    // Populate the filter options based on the fetched data
    populateFilters();

    // Apply filters and display the initial data
    applyFilters();
  } catch (error) {
    // Log any errors that occur during initialization
    console.error('Error initializing the application:', error);
  }
}

// This function fetches data from a URL with retry logic and a timeout
async function fetchDataWithRetry(url, retries = 3, timeout = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      // Create an AbortController to handle timeout
      const controller = new AbortController();
      const signal = controller.signal;

      // Start fetching data from the given URL
      const fetchPromise = fetch(url, { method: 'GET', signal });

      // Set a timeout to abort the fetch request if it takes too long
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Wait for the fetch to complete
      const response = await fetchPromise;

      // Clear the timeout since the fetch completed
      clearTimeout(timeoutId);

      // Check if the response is OK (status code 200-299)
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Parse the response as JSON and return it
      return await response.json();
    } catch (error) {
      // If this was the last retry attempt, throw the error
      if (i === retries - 1) throw error;
    }
  }
}

// This function shows or hides the loading message
function showLoading(isLoading) {
  // Display the loading message if 'isLoading' is true, otherwise hide it
  document.getElementById('loading').style.display = isLoading ? 'block' : 'none';
}

// This function populates the country and industry filters with unique values
function populateFilters() {
  // Get counts of unique country and industry values from the data
  const countryCounts = getCounts(data, 'country');
  const industryCounts = getCounts(data, 'industry');
  
  // Populate the country filter with the unique country values and their counts
  populateSelectElement(document.getElementById('country'), countryCounts);

  // Populate the industry filter with the unique industry values and their counts
  populateSelectElement(document.getElementById('industry'), industryCounts);
}

// This function returns an object with counts of unique values for a specified key
function getCounts(array, key) {
  // Reduce the array to an object where each key is a unique value and its value is the count
  return array.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

// This function populates a select element with options and their counts
function populateSelectElement(selectElement, counts) {
  // Create a document fragment to hold the options (reduces reflows/repaints)
  const fragment = document.createDocumentFragment();

  // For each unique value and its count, create and append an option element
  Object.entries(counts).sort().forEach(([value, count]) => {
    const option = document.createElement('option');
    option.value = sanitizeInput(value);
    option.textContent = `${sanitizeInput(value)} (${count})`;
    fragment.appendChild(option);
  });

  // Append the fragment to the select element
  selectElement.appendChild(fragment);
}

// This function applies filters and sorting, then updates the displayed data
function applyFilters() {
  // Get the data filtered by the selected country and industry
  const filteredData = getFilteredData(data);

  // Sort the filtered data based on the selected sorting options
  const sortedData = getSortedData(filteredData);

  // Display the sorted and filtered data in the results list
  displayResults(sortedData);
}

// This function returns the data filtered by the selected country and industry
function getFilteredData(data) {
  // Get the selected country and industry values (converted to lowercase)
  const country = sanitizeInput(document.getElementById('country').value).toLowerCase();
  const industry = sanitizeInput(document.getElementById('industry').value).toLowerCase();

  // Filter the data based on the selected country and industry
  return data.filter(item =>
    (!country || sanitizeInput(item.country).toLowerCase() === country) &&
    (!industry || sanitizeInput(item.industry).toLowerCase() === industry)
  );
}

// This function returns the data sorted by the selected sorting options
function getSortedData(data) {
  // Get the selected sorting order and sort field
  const order = sanitizeInput(document.querySelector('input[name="order"]:checked').value);
  const sort = sanitizeInput(document.querySelector('input[name="sort"]:checked').value);

  // Sort the data based on the selected sort field and order
  return data.sort((a, b) => {
    if (sort === 'name') {
      // Sort alphabetically by name
      return order === 'asc' ? sanitizeInput(a.name).localeCompare(sanitizeInput(b.name)) : sanitizeInput(b.name).localeCompare(sanitizeInput(a.name));
    } else {
      // Sort numerically by number of employees
      return order === 'asc' ? a.numberOfEmployees - b.numberOfEmployees : b.numberOfEmployees - a.numberOfEmployees;
    }
  });
}

// This function displays the data in the results list
function displayResults(data) {
  // Get the reference to the results list element
  const results = document.getElementById('results');

  // Create a document fragment to hold the list items (reduces reflows/repaints)
  const fragment = document.createDocumentFragment();

  // For each item in the data, create and append a list item element
  data.forEach(item => {
    const li = document.createElement('li');
    li.className = 'py-2';
    li.textContent = `${sanitizeInput(item.name)} · ${sanitizeInput(item.country)} · ${sanitizeInput(item.industry)} · ${item.numberOfEmployees}`;
    fragment.appendChild(li);
  });

  // Clear the current results and append the new fragment
  results.innerHTML = '';
  results.appendChild(fragment);
}

// This function sanitizes input to prevent XSS attacks
function sanitizeInput(input) {
  const element = document.createElement('div');
  element.textContent = input;
  return element.innerHTML;
}

// Start the application when the page loads
window.onload = initializeApp;
