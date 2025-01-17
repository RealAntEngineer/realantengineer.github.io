// Cache-busting by appending a timestamp to the request URL
const cacheBustedUrl = `/header.html?v=${new Date().getTime()}`;

// Load the header partial with cache-busting
fetch(cacheBustedUrl)
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
    })
    .catch(error => {
        console.error('Error loading header:', error);
    });


//search handling
document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("search-bar");

    // Load the JSON file
    let jsonData = [];
    fetch("search.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load JSON file");
            }
            return response.json();
        })
        .then(data => {
            jsonData = data; // Store the JSON data
        })
        .catch(error => {
            console.error("Error loading JSON:", error);
        });

    // Handle search input
    searchBar.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const query = searchBar.value.trim().toLowerCase(); // User's search query
            if (query) {
                const results = searchInJson(query, jsonData); // Search function
                displaySearchResults(results);
            }
        }
    });

    // Search function
    function searchInJson(query, data) {
        return data.filter(item => item.name.toLowerCase().includes(query));
    }

    // Display results
    function displaySearchResults(results) {
        const resultsContainer = document.getElementById("search-results");
        resultsContainer.innerHTML = ""; // Clear previous results

        if (results.length === 0) {
            resultsContainer.innerHTML = "<p>No results found</p>";
            return;
        }

        results.forEach(result => {
            const resultItem = document.createElement("div");
            resultItem.innerHTML = `<a href="${result.url}">${result.name}</a>`;
            resultsContainer.appendChild(resultItem);
        });
    }
});
