document.addEventListener('DOMContentLoaded', function() {
    const baseDirectory = '/categories/'; // Absolute path to the base directory
    const scannedDirectories = new Set();  // Track scanned directories
    const addedPages = new Set();  // Track added pages to avoid duplicates

    // Start scanning from the base directory
    scanDirectory(baseDirectory);

    // Function to normalize directory paths and avoid issues with relative paths
    function normalizePath(path) {
        const segments = path.split('/').filter(Boolean);
        const normalizedSegments = [];
        for (const segment of segments) {
            if (segment === '.') continue;  // Ignore current directory references
            if (segment === '..') {
                normalizedSegments.pop();  // Go back to the parent directory
            } else {
                normalizedSegments.push(segment);
            }
        }
        return '/' + normalizedSegments.join('/') + '/'; // Ensure the path starts with a '/'
    }

    // Function to scan a directory and add its pages to the menu
    function scanDirectory(directory) {
        const normalizedDirectory = normalizePath(directory);
        if (scannedDirectories.has(normalizedDirectory)) return;
        scannedDirectories.add(normalizedDirectory);  // Mark directory as scanned

        axios.get(normalizedDirectory)
            .then(response => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.data, 'text/html');
                const links = $(doc).find('a');

                // Iterate over each link found in the directory
                links.each(function() {
                    const href = $(this).attr('href');
                    if (href && href.endsWith('/')) {
                        const subDir = normalizePath(normalizedDirectory + href);

                        // Avoid scanning parent or self-referencing directories
                        if (!scannedDirectories.has(subDir)) {
                            scanDirectory(subDir);
                        }
                    } else if (href && href.endsWith('.html')) {
                        // Full path of the HTML file with cache-busting query string
                        const fullPath = normalizePath(normalizedDirectory + href) + `?v=${new Date().getTime()}`;

                        // Avoid adding duplicates
                        if (!addedPages.has(fullPath)) {
                            addedPages.add(fullPath);  // Mark page as added
                            fetchPageTitleAndAddToMenu(fullPath, normalizedDirectory, href);  // Fetch page title and add to menu
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching directory:', error.message);
            });
    }

    // Function to fetch the title of the HTML page and add it to the navigation menu
    function fetchPageTitleAndAddToMenu(pageUrl, directory, fileName) {
        axios.get(pageUrl)
            .then(response => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.data, 'text/html');
                let pageTitle = doc.querySelector('title')?.innerText;

                // If there's no title, use the file name as the fallback
                if (!pageTitle || pageTitle.trim() === '') {
                    pageTitle = getPageName(fileName);
                }

                addPageToMenu(directory, pageUrl, pageTitle);  // Add page to menu with title
            })
            .catch(error => {
                console.error('Error fetching page title:', error.message);
            });
    }

    // Function to add a page to the navigation menu under its category
    function addPageToMenu(directory, pageUrl, pageTitle) {
        // Remove the base directory from the category path
        const relativeDirectory = directory.replace(baseDirectory, '').replace(/\/$/, '');
        const categoryPath = relativeDirectory.split('/').filter(Boolean);

        // Traverse or create the nested list structure
        let currentMenu = $('#nav-menu');
        categoryPath.forEach(category => {
            let categoryListItem = currentMenu.children(`li[data-category="${category}"]`);
            if (categoryListItem.length === 0) {
                categoryListItem = $('<li>').attr('data-category', category).text(category);
                const subMenu = $('<ul>');
                categoryListItem.append(subMenu);
                currentMenu.append(categoryListItem);
            }
            currentMenu = categoryListItem.children('ul');
        });

        // Add the page under the correct category
        const pageLink = $('<a>').attr('href', pageUrl).text(pageTitle);
        const pageListItem = $('<li>').append(pageLink);
        currentMenu.append(pageListItem);
    }

    // Function to convert a file name to a more readable format
    function getPageName(fileName) {
        return fileName
            .replace('.html', '')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    }
});
