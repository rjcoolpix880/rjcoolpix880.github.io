document.addEventListener('DOMContentLoaded', () => {
    // 1. Logic to determine current and next page
    const path = window.location.pathname;
    const filename = path.split('/').pop() || '1.html';
    const match = filename.match(/(\d+)\.html/);
    
    if (!match) return;

    const currentPage = parseInt(match[1]);

    const navigate = (direction) => {
        const nextPage = currentPage + direction;
        if (nextPage < 1) return; // Don't go below page 1
        window.location.href = `${nextPage}.html`;
    };

    // 2. Create the UI elements for arrows
    const leftArrow = document.createElement('div');
    leftArrow.className = 'nav-arrow nav-left';
    leftArrow.innerHTML = '&#8249;'; // < symbol
    
    const rightArrow = document.createElement('div');
    rightArrow.className = 'nav-arrow nav-right';
    rightArrow.innerHTML = '&#8250;'; // > symbol

    document.body.appendChild(leftArrow);
    document.body.appendChild(rightArrow);

    // 3. Click listeners
    leftArrow.addEventListener('click', () => navigate(-1));
    rightArrow.addEventListener('click', () => navigate(1));

    // 4. Keyboard listeners
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });

    // 5. Hide left arrow on page 1
    if (currentPage <= 1) {
        leftArrow.style.display = 'none';
    }
});
