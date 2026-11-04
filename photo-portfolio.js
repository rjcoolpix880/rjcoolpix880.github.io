/**
 * Photo Portfolio Tag Filtering
 * Handles interactive filtering for photos based on category/keyword tags.
 */

document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.photo-filter-btn');
    const photoCards = document.querySelectorAll('.photo-card');

    if (!filterButtons.length || !photoCards.length) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedFilter = (button.getAttribute('data-filter') || 'all').toLowerCase().trim();

            // Update button active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter photo items
            photoCards.forEach(card => {
                const rawTags = card.getAttribute('data-tags') || '';
                const tags = rawTags
                    .toLowerCase()
                    .split(/[,\s]+/)
                    .map(t => t.trim())
                    .filter(Boolean);

                if (selectedFilter === 'all' || tags.includes(selectedFilter)) {
                    card.classList.remove('is-hidden');
                } else {
                    card.classList.add('is-hidden');
                }
            });
        });
    });
});
