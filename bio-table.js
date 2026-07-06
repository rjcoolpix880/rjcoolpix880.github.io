let bioData = [];
let renderedItems = [];
let currentSort = { key: 'year', direction: 'desc' };

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initSearchAndFilter();
    initSorting();
});

async function loadData() {
    try {
        const response = await fetch('bio-data.json');
        bioData = await response.json();
        
        populateSectionFilter();
        filterAndRender();
    } catch (error) {
        console.error('Error loading bio data:', error);
    }
}

function populateSectionFilter() {
    const filterSelect = document.getElementById('sectionFilter');
    if (!filterSelect) return;

    const sections = [...new Set(bioData.map(item => item.section))].filter(Boolean);
    
    // Explicit order for sections matching standard resume flow
    const sectionOrder = [
        "Speaking Engagements",
        "Task Force Appointments",
        "Jury Appointments",
        "Chair Appointments",
        "Awards",
        "Publications",
        "Internal Speaking Engagements",
        "Academic",
        "Juries and Reviews",
        "Curriculum Vitae"
    ];

    sections.sort((a, b) => {
        const idxA = sectionOrder.indexOf(a);
        const idxB = sectionOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    sections.forEach(sec => {
        const opt = document.createElement('option');
        opt.value = sec;
        opt.textContent = sec;
        filterSelect.appendChild(opt);
    });
}

function filterAndRender() {
    const searchInput = document.getElementById('tableSearch');
    const filterSelect = document.getElementById('sectionFilter');
    
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedSection = filterSelect ? filterSelect.value : '';

    let filtered = bioData;

    // Filter by Section dropdown
    if (selectedSection) {
        filtered = filtered.filter(item => item.section === selectedSection);
    }

    // Filter by Search term
    if (searchTerm) {
        filtered = filtered.filter(item => {
            const title = (item.title || item.title1 || item.title2 || '').toLowerCase();
            const body = (item.body || item.firm || '').toLowerCase();
            const topic = (item.topic || '').toLowerCase();
            const category = (item.category || '').toLowerCase();
            const scope = (item.scope || '').toLowerCase();
            const city = (item.city || '').toLowerCase();
            const blurb = (item.blurb || item.content || '').toLowerCase();
            const year = (item.year || item.years || '').toLowerCase();
            const sectionName = (item.section || '').toLowerCase();

            return title.includes(searchTerm) ||
                   body.includes(searchTerm) ||
                   topic.includes(searchTerm) ||
                   category.includes(searchTerm) ||
                   scope.includes(searchTerm) ||
                   city.includes(searchTerm) ||
                   blurb.includes(searchTerm) ||
                   year.includes(searchTerm) ||
                   sectionName.includes(searchTerm);
        });
    }

    sortData(filtered);
    renderTable(filtered);
}

function getSortYear(item) {
    if (item.year) return parseInt(item.year) || 0;
    if (item.years) {
        // Extract the first 4-digit number from "2025 - Present" or similar
        const match = item.years.match(/\d{4}/);
        return match ? parseInt(match[0]) : 0;
    }
    return 0;
}

function sortData(data) {
    data.sort((a, b) => {
        let valA, valB;
        if (currentSort.key === 'year') {
            valA = getSortYear(a);
            valB = getSortYear(b);
        } else if (currentSort.key === 'section') {
            valA = a.section || '';
            valB = b.section || '';
        } else if (currentSort.key === 'title') {
            valA = a.title || a.title1 || '';
            valB = b.title || b.title1 || '';
        } else if (currentSort.key === 'organization') {
            valA = a.body || a.firm || '';
            valB = b.body || b.firm || '';
        } else if (currentSort.key === 'topic') {
            valA = a.topic || '';
            valB = b.topic || '';
        } else if (currentSort.key === 'category') {
            valA = a.category || a.scope || '';
            valB = b.category || b.scope || '';
        } else if (currentSort.key === 'location') {
            valA = a.city || '';
            valB = b.city || '';
        } else {
            valA = a[currentSort.key] || '';
            valB = b[currentSort.key] || '';
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
}

function renderTable(data) {
    const tableBody = document.getElementById('tableBody');
    const projectCount = document.getElementById('projectCount');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    renderedItems = data;

    if (projectCount) {
        projectCount.innerText = `Showing ${data.length} records`;
    }

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // 1. Media / Actions
        let mediaHtml = '';
        if (item.image) {
            mediaHtml = `<img src="${item.image}" class="table-thumbnail" onclick="showPhoto('${item.image}', '${(item.title || '').replace(/'/g, "\\'")}')" alt="${item.title || ''}">`;
        } else if (item.link) {
            mediaHtml = `<a href="${item.link}" target="_blank" class="bio-link-btn">Link ↗</a>`;
        }

        // 2. Year / Date Range
        const yearHtml = item.years || item.year || '';

        // 3. Section Pill
        const secSlug = (item.section || 'other').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        const sectionHtml = `<span class="section-pill section-${secSlug}">${item.section}</span>`;

        // 4. Organization / Firm / Body (Org before Title)
        const orgHtml = item.body || item.firm || '';

        // 5. Title / Role (linked if item has a link)
        let titleHtml = '';
        if (item.section === 'Curriculum Vitae') {
            const titleText = [item.title1, item.title2].filter(Boolean).join(', ');
            titleHtml = `<span class="title-cell">${titleText}</span>`;
        } else {
            const titleText = item.title || '';
            titleHtml = item.link ? 
                `<a href="${item.link}" target="_blank" class="project-link title-cell">${titleText}</a>` : 
                `<span class="title-cell">${titleText}</span>`;
        }

        // 6. Blurb / Description (after Title)
        const rawBlurb = item.content || item.blurb || '';
        let blurbHtml = '';
        if (rawBlurb) {
            blurbHtml = `<div class="blurb-cell">${rawBlurb}</div>`;
        }

        // 7. Topic
        const topicHtml = item.topic || '';

        // 8. Category / Scope
        const catParts = [item.category, item.scope].filter(Boolean);
        const catHtml = catParts.join(' / ') || '';

        // 9. Location
        const locHtml = item.city || '';

        row.innerHTML = `
            <td style="text-align: center;">${mediaHtml}</td>
            <td style="white-space: nowrap;">${yearHtml}</td>
            <td>${sectionHtml}</td>
            <td>${orgHtml}</td>
            <td>${titleHtml}</td>
            <td>${blurbHtml}</td>
            <td>${topicHtml}</td>
            <td>${catHtml}</td>
            <td>${locHtml}</td>
        `;
        tableBody.appendChild(row);
    });
}

function initSearchAndFilter() {
    const searchInput = document.getElementById('tableSearch');
    const filterSelect = document.getElementById('sectionFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterAndRender);
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', filterAndRender);
    }
}

function initSorting() {
    const headers = document.querySelectorAll('th[data-key]');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const key = header.getAttribute('data-key');

            if (currentSort.key === key) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.key = key;
                currentSort.direction = 'asc';
            }

            // Update UI headers to show sort direction (handled via CSS or text markers)
            // Just filter and render again
            filterAndRender();
        });
    });
}

function showDetails(index) {
    const item = renderedItems[index];
    if (!item) return;

    const modal = document.getElementById('detailsModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (!modal || !modalTitle || !modalBody) return;

    const titleText = item.title || [item.title1, item.title2].filter(Boolean).join(', ') || 'Details';
    modalTitle.innerText = titleText;

    let contentHtml = '';

    // Render metadata section
    contentHtml += `<div style="margin-bottom: 1.5rem; font-size: 0.875rem; color: var(--secondary-color); border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">`;
    contentHtml += `<div><strong>Section:</strong> ${item.section}</div>`;
    if (item.year || item.years) contentHtml += `<div><strong>Year:</strong> ${item.years || item.year}</div>`;
    if (item.body || item.firm) contentHtml += `<div><strong>Organization:</strong> ${item.body || item.firm}</div>`;
    if (item.city) contentHtml += `<div><strong>Location:</strong> ${item.city}</div>`;
    if (item.attendees) contentHtml += `<div><strong>Attendees:</strong> ${item.attendees}</div>`;
    contentHtml += `</div>`;

    // Render primary description text (blurb or content)
    const textContent = item.content || item.blurb || '';
    if (textContent) {
        // Convert double newlines to paragraph tags for readability
        const paragraphs = textContent.split(/\n\s*\n/).map(p => `<p style="margin-top: 0; line-height: 1.6;">${p.replace(/\n/g, '<br>')}</p>`).join('');
        contentHtml += `<div style="color: var(--text-color);">${paragraphs}</div>`;
    }

    // Embed large photo if there is an image
    if (item.image) {
        contentHtml += `
            <div style="text-align: center; margin-top: 1.5rem;">
                <img src="${item.image}" id="modalImageLarge" alt="${titleText}">
            </div>
        `;
    }

    // Embed links
    if (item.link) {
        contentHtml += `
            <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                <a href="${item.link}" target="_blank" class="bio-link-btn" style="padding: 0.5rem 1rem;">Visit Resource / Article ↗</a>
            </div>
        `;
    }

    modalBody.innerHTML = contentHtml;
    modal.style.display = 'flex';
}

function showPhoto(src, title) {
    const modal = document.getElementById('detailsModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.innerText = title;
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 1rem 0;">
            <img src="${src}" id="modalImageLarge" alt="${title}">
        </div>
    `;

    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('detailsModal');
    if (event.target == modal) {
        closeModal();
    }
}
