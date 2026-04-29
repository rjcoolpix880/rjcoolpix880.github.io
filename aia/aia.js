document.addEventListener('DOMContentLoaded', async () => {
    const gridItems = document.querySelectorAll('.grid-item[projectID]');
    if (gridItems.length === 0) return;

    try {
        // Fetch the data files
        const [projectsRes, awardsRes] = await Promise.all([
            fetch('/project-data.json'),
            fetch('/project-awards.json')
        ]);

        const projects = await projectsRes.json();
        const awardsData = await awardsRes.json();
        // awardsData is an array with one object inside
        const awardsMap = awardsData[0] || {};

        gridItems.forEach(item => {
            const pid = item.getAttribute('projectID');
            const project = projects.find(p => p.projectID === pid);
            const awards = awardsMap[pid] || [];

            if (project) {
                renderProject(item, project, awards);
            } else {
                item.innerHTML = `<div class="error">Project ${pid} not found</div>`;
            }
        });
    } catch (err) {
        console.error('Error loading project data:', err);
    }
});

function renderProject(container, project, awards) {
    container.innerHTML = `
        <div class="cell-content">
            <div class="image-wrapper">
                <img class="image" src="${project.photo}" alt="${project.projectName}">
            </div>
            
            <div class="header">
                <div class="sub-title">${project.client || ''}</div>
                <h2 class="title">${project.projectName}</h2>
            </div>

            <div class="meta">
                <div class="meta-row">
                    <span>${project.location || ''}</span>
                    <span>${project.completionDate || ''}</span>
                </div>
                <div class="meta-row">
                    <span>${project.projectType || ''}</span>
                    <span>${project.sqft || ''}</span>
                </div>
                ${awards.length > 0 ? `<div class="meta-awards"> ${awards.length} Awards</div>` : ''}
            </div>

            <p class="copy">${project.briefDescription || ''}</p>
        </div>
    `;
}





