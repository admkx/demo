// Fetch data from the API and initialize the application
async function initializeApp() {
  try {
    showLoading(true);
    const fetchedData = await fetchDataWithRetry('https://dujour.squiz.cloud/developer-challenge/data');
    data = fetchedData;
    showLoading(false);
    populateFilters();
    applyFilters();
  } catch (error) {
    console.error('Error initializing the application:', error);
  }
}

// Fetch data with retry logic
async function fetchDataWithRetry(url, retries = 3, timeout = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      const fetchPromise = fetch(url, { method: 'GET', signal });
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const response = await fetchPromise;
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}

// Show or hide loading message
function showLoading(isLoading) {
  document.getElementById('loading').style.display = isLoading ? 'block' : 'none';
}

// Populate the country and industry filters
function populateFilters() {
  const countryCounts = getCounts(data, 'country');
  const industryCounts = getCounts(data, 'industry');
  
  populateSelectElement(document.getElementById('country'), countryCounts);
  populateSelectElement(document.getElementById('industry'), industryCounts);
}

// Get unique values and their counts from an array of objects by a specified key
function getCounts(array, key) {
  return array.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

// Populate a select element with options
function populateSelectElement(selectElement, counts) {
  const fragment = document.createDocumentFragment();
  Object.entries(counts).sort().forEach(([value, count]) => {
    const option = document.createElement('option');
    option.value = sanitizeInput(value);
    option.textContent = `${sanitizeInput(value)} (${count})`;
    fragment.appendChild(option);
  });
  selectElement.appendChild(fragment);
}

// Apply filters and sorting, then update the display
function applyFilters() {
  const filteredData = getFilteredData(data);
  const sortedData = getSortedData(filteredData);
  displayResults(sortedData);
}

// Get filtered data based on selected filters
function getFilteredData(data) {
  const country = sanitizeInput(document.getElementById('country').value).toLowerCase();
  const industry = sanitizeInput(document.getElementById('industry').value).toLowerCase();

  return data.filter(item =>
    (!country || sanitizeInput(item.country).toLowerCase() === country) &&
    (!industry || sanitizeInput(item.industry).toLowerCase() === industry)
  );
}

// Get sorted data based on selected sorting options
function getSortedData(data) {
  const order = sanitizeInput(document.querySelector('input[name="order"]:checked').value);
  const sort = sanitizeInput(document.querySelector('input[name="sort"]:checked').value);

  return data.sort((a, b) => {
    if (sort === 'name') {
      return order === 'asc' ? sanitizeInput(a.name).localeCompare(sanitizeInput(b.name)) : sanitizeInput(b.name).localeCompare(sanitizeInput(a.name));
    } else {
      return order === 'asc' ? a.numberOfEmployees - b.numberOfEmployees : b.numberOfEmployees - a.numberOfEmployees;
    }
  });
}

// Display the results in the HTML
function displayResults(data) {
  const results = document.getElementById('results');
  const fragment = document.createDocumentFragment();
  data.forEach(item => {
    const li = document.createElement('li');
    li.className = 'py-2';
    li.textContent = `${sanitizeInput(item.name)} · ${sanitizeInput(item.country)} · ${sanitizeInput(item.industry)} · ${item.numberOfEmployees}`;
    fragment.appendChild(li);
  });
  results.innerHTML = '';
  results.appendChild(fragment);
}

// Sanitize input to prevent XSS attacks
function sanitizeInput(input) {
  const element = document.createElement('div');
  element.textContent = input;
  return element.innerHTML;
}

// Initialize the application when the page loads
window.onload = initializeApp;
