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
                    client: project.client || '',
                    photo: project.photo || ''
                });
            }
        }

        // 2. Sort by year descending (newest first)
        allAwards.sort((a, b) => {
            if (b.year !== a.year) {
                return b.year - a.year;
            }
            return a.projectName.localeCompare(b.projectName) || a.name.localeCompare(b.name);
        });

        // 3. Determine current page by parsing the filename (e.g. 10.html -> page 10)
        const path = window.location.pathname;
        const filename = path.split('/').pop() || '10.html';
        const match = filename.match(/(\d+)\.html/);
        const currentPage = match ? parseInt(match[1]) : 10;
        
        // Define page parameters
        // Page 10 -> awards 0-17 (18 items)
        // Page 11 -> awards 18-35 (18 items)
        // Page 12 -> awards 36-47 (12 items)
        let pageAwards = [];
        let itemsPerCol = 6;
        if (currentPage === 10) {
            pageAwards = allAwards.slice(0, 18);
            itemsPerCol = 6;
        } else if (currentPage === 11) {
            pageAwards = allAwards.slice(18, 36);
            itemsPerCol = 6;
        } else if (currentPage === 12) {
            pageAwards = allAwards.slice(36, 48);
            itemsPerCol = 4; // balanced distribution: 3 cols of 4
        }

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

        // 4. Distribute awards into 3 columns
        for (let colIdx = 0; colIdx < 3; colIdx++) {
            const colId = `col-${colIdx + 1}`;
            const container = document.getElementById(colId);
            if (!container) continue;

            const start = colIdx * itemsPerCol;
            const end = start + itemsPerCol;
            const colItems = pageAwards.slice(start, end);

            let contentHTML = '';
            // Only add the main section header on the first column of the first page (Page 10)
            if (currentPage === 10 && colIdx === 0) {
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

        // 5. Render project images in the 4th column (col-4)
        const col4 = document.getElementById('col-4');
        if (col4) {
            const pagePhotos = pageAwards.map(a => a.photo).filter(p => p && p !== '');
            const uniquePhotos = [...new Set(pagePhotos)];
            
            if (uniquePhotos.length === 0) {
                col4.innerHTML = '';
            } else {
                const displayedPhotos = uniquePhotos.slice(0, 4);
                col4.innerHTML = `
                    <div class="cell-content" style="display: flex; flex-direction: column; gap: 0.5rem; height: 100%; overflow-y: auto;">
                        ${displayedPhotos.map(photoUrl => {
                            let img = photoUrl;
                            if (!img.startsWith('/') && !img.startsWith('http')) {
                                img = '/' + img;
                            }
                            return `
                                <div style="width: 100%; border-radius: 0.05rem; overflow: hidden; background-color: #eee; flex-shrink: 0;">
                                    <img src="${img}" style="width: 100%; height: auto; display: block;" alt="Award winning project">
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
        }

    } catch (err) {
        console.error('Error loading or rendering awards:', err);
    }
});
