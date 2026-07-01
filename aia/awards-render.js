document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [projectsRes, awardsRes] = await Promise.all([
            fetch('/project-data.json'),
            fetch('/project-awards.json')
        ]);

        const projects = await projectsRes.json();
        const awardsData = await awardsRes.json();
        const awardsMap = awardsData[0] || {};

        // 1. Extract and combine awards with project info
        const allAwards = [];
        for (const [projectId, awardsList] of Object.entries(awardsMap)) {
            const project = projects.find(p => p.projectID === projectId) || {};
            for (const award of awardsList) {
                allAwards.push({
                    year: parseInt(award.year) || 0,
                    yearStr: award.year,
                    name: award.name,
                    body: award.body,
                    projectName: project.projectName || '',
                    client: project.client || ''
                });
            }
        }

        // 2. Sort by year descending (newest first).
        // If year is the same, sort by project name or award name for stability.
        allAwards.sort((a, b) => {
            if (b.year !== a.year) {
                return b.year - a.year;
            }
            return a.projectName.localeCompare(b.projectName) || a.name.localeCompare(b.name);
        });

        // 3. Determine current page by parsing the filename (e.g. 8.html -> page 8)
        const path = window.location.pathname;
        const filename = path.split('/').pop() || '8.html';
        const match = filename.match(/(\d+)\.html/);
        const currentPage = match ? parseInt(match[1]) : 8;
        
        const pageIndex = currentPage - 8; // 0 for page 8, 1 for page 9, 2 for page 10
        const itemsPerPage = 16;
        const pageAwards = allAwards.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage);
        const colOffset = (pageIndex * 4) + 1;

        // Render function for a single award entry
        const awardTemplate = (item) => `
            <div class="bio-entry" style="margin-bottom: 0.5rem;">
                <div class="sub-title">${item.name}</div>
                <div class="copy" style="color: #333;">
                    <strong>${item.yearStr} ${item.body}</strong><br>
                    ${item.projectName}<br>
                    ${item.client}
                </div>
            </div>
        `;

        // 4. Distribute awards into 4 columns (up to 4 per column)
        const itemsPerCol = 4;
        for (let colIdx = 0; colIdx < 4; colIdx++) {
            const colId = `awards-col-${colOffset + colIdx}`;
            const container = document.getElementById(colId);
            if (!container) continue;

            const start = colIdx * itemsPerCol;
            const end = start + itemsPerCol;
            const colItems = pageAwards.slice(start, end);

            let contentHTML = '';
            // Only add the main section header on the first column of the first page (Page 8)
            if (currentPage === 8 && colIdx === 0) {
                contentHTML += `<h1 class="title" style="margin-bottom: 0.6rem;">Awards</h1>`;
            } else {
                // Ensure layout alignment matches columns with headers by adding a spacer
                contentHTML += `<div style="height: 0.6rem;"></div>`;
            }

            contentHTML += `
                <div class="cell-content">
                    <div class="entries-wrapper">
                        ${colItems.map(awardTemplate).join('')}
                    </div>
                </div>
            `;
            container.innerHTML = contentHTML;
        }

    } catch (err) {
        console.error('Error loading or rendering awards:', err);
    }
});
