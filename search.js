document.addEventListener('DOMContentLoaded', () => {
    const searchData = {
        services: [
            { title: 'Health Insurance', url: 'benefits.html', type: 'service' },
            { title: 'Claims Processing', url: 'claims.html', type: 'service' },
            { title: 'Enrollment', url: 'enrollment.html', type: 'service' }
        ],
        pages: [
            { title: 'About Us', url: 'about.html', type: 'page' },
            { title: 'Contact', url: 'contact.html', type: 'page' },
            { title: 'Privacy Policy', url: 'privacy.html', type: 'page' }
        ],
        faqs: [
            { title: 'How to submit a claim?', url: 'claims.html', type: 'faq' },
            { title: 'Coverage options', url: 'benefits.html', type: 'faq' }
        ]
    };

    const searchToggle = document.querySelector('.search-toggle');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchInput = searchOverlay.querySelector('input');
    const searchResults = searchOverlay.querySelector('.search-results');

    function performSearch(query) {
        query = query.toLowerCase();
        const results = [];

        // Search through all categories
        Object.values(searchData).forEach(category => {
            category.forEach(item => {
                if (item.title.toLowerCase().includes(query)) {
                    results.push(item);
                }
            });
        });

        displayResults(results);
    }

    function displayResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<p class="no-results">No results found</p>';
            return;
        }

        const html = results.map(result => `
            <a href="${result.url}" class="search-result-item">
                <i class="fas ${getIconForType(result.type)}"></i>
                <span>${result.title}</span>
            </a>
        `).join('');

        searchResults.innerHTML = html;
    }

    function getIconForType(type) {
        const icons = {
            service: 'fa-briefcase-medical',
            page: 'fa-file-alt',
            faq: 'fa-question-circle'
        };
        return icons[type] || 'fa-link';
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length >= 2) {
            performSearch(query);
        } else {
            searchResults.innerHTML = '';
        }
    });
}); 