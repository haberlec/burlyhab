/**
 * Publications Renderer Module
 * Dynamically loads and renders publications from JSON data
 */

let publicationsData = [];
let filteredPublications = [];

/**
 * Load publications from JSON file
 */
export async function loadPublications() {
    try {
        const response = await fetch('/src/data/publications.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        publicationsData = await response.json();
        filteredPublications = [...publicationsData];
        return publicationsData;
    } catch (error) {
        console.error('Error loading publications:', error);
        showError('Failed to load publications. Please refresh the page.');
        return [];
    }
}

/**
 * Render publications to the DOM
 */
export function renderPublications(publications = filteredPublications) {
    const container = document.getElementById('publications-list');
    if (!container) {
        console.error('Publications container not found');
        return;
    }

    // Group publications by year
    const groupedByYear = groupByYear(publications);

    // Clear container
    container.innerHTML = '';

    // Render each year group
    Object.keys(groupedByYear)
        .sort((a, b) => {
            // "In Preparation/Review" always first
            if (a === "In Preparation/Review") return -1;
            if (b === "In Preparation/Review") return 1;
            // Then sort numerically descending
            return parseInt(b) - parseInt(a);
        })
        .forEach(year => {
            // Add year heading
            const yearDiv = document.createElement('div');
            yearDiv.className = 'pub-year';
            yearDiv.textContent = year;
            container.appendChild(yearDiv);

            // Add publications for this year
            groupedByYear[year].forEach(pub => {
                const pubDiv = createPublicationElement(pub);
                container.appendChild(pubDiv);
            });
        });

    // Update count
    updatePublicationCount(publications.length);
}

/**
 * Group publications by year
 */
function groupByYear(publications) {
    return publications.reduce((groups, pub) => {
        const year = pub.year;
        if (!groups[year]) {
            groups[year] = [];
        }
        groups[year].push(pub);
        return groups;
    }, {});
}

/**
 * Create a publication DOM element
 */
function createPublicationElement(pub) {
    const div = document.createElement('div');
    div.className = 'publication';
    div.dataset.year = pub.year;
    div.dataset.title = pub.title.toLowerCase();
    div.dataset.authors = pub.authors.toLowerCase();

    const titleP = document.createElement('p');
    titleP.className = 'pub-title';
    titleP.textContent = pub.title;

    const authorsP = document.createElement('p');
    authorsP.className = 'pub-authors';
    authorsP.innerHTML = pub.authors; // Use innerHTML to preserve highlight-author span

    const venueP = document.createElement('p');
    venueP.className = 'pub-venue';
    venueP.textContent = pub.venue;

    div.appendChild(titleP);
    div.appendChild(authorsP);
    div.appendChild(venueP);

    return div;
}

/**
 * Filter publications by search term
 */
export function filterPublications(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
        filteredPublications = [...publicationsData];
    } else {
        filteredPublications = publicationsData.filter(pub => {
            return (
                pub.title.toLowerCase().includes(term) ||
                pub.authors.toLowerCase().includes(term) ||
                pub.venue.toLowerCase().includes(term) ||
                pub.year.toString().toLowerCase().includes(term)
            );
        });
    }

    renderPublications(filteredPublications);
    return filteredPublications;
}

/**
 * Filter publications by year
 */
export function filterByYear(year) {
    if (!year || year === 'all') {
        filteredPublications = [...publicationsData];
    } else {
        filteredPublications = publicationsData.filter(pub => pub.year.toString() === year);
    }

    renderPublications(filteredPublications);
    return filteredPublications;
}

/**
 * Get unique years from publications
 */
export function getYears() {
    const years = [...new Set(publicationsData.map(pub => pub.year))];
    return years.sort((a, b) => {
        if (a === "In Preparation/Review") return -1;
        if (b === "In Preparation/Review") return 1;
        return parseInt(b) - parseInt(a);
    });
}

/**
 * Update publication count display
 */
function updatePublicationCount(count) {
    const countElement = document.getElementById('publication-count');
    if (countElement) {
        const total = publicationsData.length;
        if (count === total) {
            countElement.textContent = `Showing all ${total} publications`;
        } else {
            countElement.textContent = `Showing ${count} of ${total} publications`;
        }
    }
}

/**
 * Show error message
 */
function showError(message) {
    const container = document.getElementById('publications-list');
    if (container) {
        container.innerHTML = `
            <div style="color: #ff6b6b; padding: 2rem; background: rgba(255, 107, 107, 0.1); border-radius: 8px; border: 2px solid #ff6b6b; text-align: center;">
                <h3 style="margin: 0 0 1rem 0;">⚠️ Error</h3>
                <p style="margin: 0;">${message}</p>
            </div>
        `;
    }
}

/**
 * Initialize publications system
 */
export async function initPublications() {
    try {
        await loadPublications();
        renderPublications();
        console.log(`Loaded ${publicationsData.length} publications`);
    } catch (error) {
        console.error('Error initializing publications:', error);
        showError('Failed to initialize publications system');
    }
}

// Export data for external access
export function getPublicationsData() {
    return publicationsData;
}

export function getFilteredPublications() {
    return filteredPublications;
}
