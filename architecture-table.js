let projectsData = [];
let awardsData = {};
let currentSort = { key: 'hours', direction: 'desc' };

const PHASE_ORDER = ['PD', 'SD', 'DD', 'CD', 'CA'];

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initSearch();
    initSorting();
});

async function loadData() {
    try {
        const [projectsRes, awardsRes] = await Promise.all([
            fetch('project-data.json').then(r => r.json()),
            fetch('project-awards.json').then(r => r.json())
        ]);

        // Filter projects by section "Architecture"
        projectsData = projectsRes.filter(p => p.section === 'Architecture');
        awardsData = awardsRes[0];

        sortData();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function renderTable(data) {
    const tableBody = document.getElementById('tableBody');
    const projectCount = document.getElementById('projectCount');
    tableBody.innerHTML = '';

    projectCount.innerText = `Showing ${data.length} projects`;

    data.forEach(project => {
        const row = document.createElement('tr');
        const awards = awardsData[project.projectID] || [];
        const hasBrief = project.briefDesciption && project.briefDesciption.trim() !== '';

        row.innerHTML = `
            <td style="text-align: center;">
                ${project.photo ?
                `<img src="${project.photo}" class="table-thumbnail" onclick="showPhoto('${project.photo}', '${project.projectName.replace(/'/g, "\\'")}')" alt="${project.projectName}">` :
                ''
            }
            </td>
            <td>${project.projectID || ''}</td>
            <td>${project.client || ''}</td>
            <td style="font-weight: 600;">
                ${project.link ?
                `<a href="${project.link}" target="_blank" class="project-link">${project.projectName || ''}</a>` :
                (project.projectName || '')
            }
            </td>
            <td>${project.startDate || ''}</td>
            <td>${project.completionDate || ''}</td>
            <td>${getStatusPill(project.status || '')}</td>
            <td>${project.projectType || ''}</td>
            <td>${project.role || ''}</td>
            <td>${project.sqft || ''}</td>
            <td>${getPhasesBar(project.phases || [])}</td>
            <td style="text-align: center;">
                ${awards.length > 0 ?
                `<button class="btn-awards" onclick="showAwards('${project.projectID}', '${project.projectName.replace(/'/g, "\\'")}')">
                        ${awards.length} Award${awards.length > 1 ? 's' : ''}
                    </button>` : ''
            }
            </td>
            <td style="text-align: center;">${project.compD ? '<span class="icon-check">✓</span>' : ''}</td>
            <td style="text-align: center;">
                ${hasBrief ?
                `<button class="btn-brief" onclick="showBrief('${project.projectID}')">View</button>` :
                ''
            }
            </td>
            <td style="text-align: center;">${project.architecturalDescription ? '<span class="icon-check">✓</span>' : ''}</td>
            <td style="text-align: center;">${project.technologyDescription ? '<span class="icon-check">✓</span>' : ''}</td>
            <td>${project.AOR || ''}</td>
            <td>${project.designArchitect || ''}</td>
            <td>${project.hours || ''}</td>
        `;
        tableBody.appendChild(row);
    });
}

function getStatusPill(status) {
    if (!status) return '';
    const slug = status.toLowerCase().replace(/\s+/g, '-');
    return `<span class="status-pill status-${slug}">${status}</span>`;
}

function getPhasesBar(phases) {
    if (!phases || phases.length === 0) return '<div class="phases-bar"></div>';

    // Find first and last index in PHASE_ORDER
    const indices = phases
        .map(p => PHASE_ORDER.indexOf(p))
        .filter(idx => idx !== -1);

    if (indices.length === 0) return '<div class="phases-bar"></div>';

    const minIdx = Math.min(...indices);
    const maxIdx = Math.max(...indices);

    let segments = '';
    PHASE_ORDER.forEach((phase, idx) => {
        const isActive = idx >= minIdx && idx <= maxIdx;
        const className = isActive ? `phase-segment phase-${phase.toLowerCase()}` : 'phase-segment';
        segments += `<div class="${className}" title="${phase}"></div>`;
    });

    return `<div class="phases-bar">${segments}</div>`;
}

function initSearch() {
    const searchInput = document.getElementById('tableSearch');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = projectsData.filter(p => {
            return (
                (p.projectName && p.projectName.toLowerCase().includes(term)) ||
                (p.client && p.client.toLowerCase().includes(term)) ||
                (p.projectType && p.projectType.toLowerCase().includes(term)) ||
                (p.role && p.role.toLowerCase().includes(term)) ||
                (p.status && p.status.toLowerCase().includes(term)) ||
                (p.projectID && p.projectID.toLowerCase().includes(term)) ||
                (p.briefDesciption && p.briefDesciption.toLowerCase().includes(term))
            );
        });
        renderTable(filtered);
    });
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

            sortData();
        });
    });
}

function sortData() {
    const sorted = [...projectsData].sort((a, b) => {
        let valA = a[currentSort.key];
        let valB = b[currentSort.key];

        // Special handling for nested or calculated fields
        if (currentSort.key === 'awards') {
            valA = (awardsData[a.projectID] || []).length;
            valB = (awardsData[b.projectID] || []).length;
        }

        if (valA == null) valA = '';
        if (valB == null) valB = '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    renderTable(sorted);
}

function showAwards(projectId, projectName) {
    const awards = awardsData[projectId] || [];
    const modal = document.getElementById('awardsModal');
    const modalTitle = document.getElementById('modalTitle');
    const list = document.getElementById('modalAwardsList');

    modalTitle.innerText = `Awards: ${projectName}`;
    list.innerHTML = awards.map(a => `
        <div class="award-item">
            <div class="award-header">${a.year} - ${a.body}</div>
            <div class="award-name">${a.name}</div>
            ${a.comments ? `<div class="award-body">"${a.comments}"</div>` : ''}
            ${a.url ? `<a href="${a.url}" target="_blank" style="font-size: 0.75rem; color: var(--primary-color);">Project Link</a>` : ''}
        </div>
    `).join('');

    modal.style.display = 'flex';
}

function showPhoto(src, projectName) {
    const modal = document.getElementById('awardsModal');
    const modalTitle = document.getElementById('modalTitle');
    const list = document.getElementById('modalAwardsList');

    modalTitle.innerText = projectName;
    list.innerHTML = `
        <div style="text-align: center; padding: 1rem 0;">
            <img src="${src}" id="modalImageLarge" alt="${projectName}">
        </div>
    `;

    modal.style.display = 'flex';
}

function showBrief(projectId) {
    const project = projectsData.find(p => p.projectID === projectId);
    if (!project) return;

    const modal = document.getElementById('awardsModal');
    const modalTitle = document.getElementById('modalTitle');
    const list = document.getElementById('modalAwardsList');

    modalTitle.innerText = `Brief: ${project.projectName}`;
    list.innerHTML = `
        <div style="padding: 1rem 0; line-height: 1.6; color: var(--text-color);">
            ${project.briefDesciption}
        </div>
    `;

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('awardsModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('awardsModal');
    if (event.target == modal) {
        closeModal();
    }
}
