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
