document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/bio-data.json');
        const data = await res.json();

        // 1. Filter data by sections
        const cvData = data.filter(item => item.section === "Curriculum Vitae");
        const speakingData = data.filter(item => item.section === "Speaking Engagements");
        const honorsData = data.filter(item => ["Awards"].includes(item.section));
        const serviceData = data.filter(item => ["Task Force Appointments", "Jury Appointments", "Chair Appointments"].includes(item.section));
        const teachingData = data.filter(item => ["Juries and Reviews", "Academic"].includes(item.section));
        const publicationsData = data.filter(item => item.section === "Publications");

        // Sort all by year
        const sortByYear = (arr) => arr.sort((a, b) => parseInt(b.year) - parseInt(a.year));
        sortByYear(speakingData);
        sortByYear(honorsData);
        sortByYear(serviceData);
        sortByYear(teachingData);
        sortByYear(publicationsData);

        // --- PAGE 3 RENDERING ---
        if (document.getElementById('cv-col')) {
            renderList(document.getElementById('cv-col'), "CV", cvData.slice(0, 7), (item) => `
                <div class="bio-entry">
                    <div class="sub-title">${item.years}</div>
                    <div class="copy">${item.firm}<br><strong>${item.title1}${item.title2 ? ' | ' + item.title2 : ''}</strong></div>
                </div>
            `);

            const limit = 8;
            renderList(document.getElementById('speaking-col-1'), "Speaking", speakingData.slice(0, limit), speakingTemplate);
            renderList(document.getElementById('speaking-col-2'), "", speakingData.slice(limit, limit * 2), speakingTemplate);
            renderList(document.getElementById('speaking-col-3'), "", speakingData.slice(limit * 2, limit * 3), speakingTemplate);
        }

        // --- PAGE 4 RENDERING ---
        if (document.getElementById('awards-teaching-col')) {
            const awardsHTML = `
                <div class="cell-content">
                    <h1 class="title">Honors</h1>
                    <div class="entries-wrapper" style="flex: 0 0 auto; margin-bottom: 1.5rem;">
                        ${honorsData.slice(0, 5).map(item => `
                            <div class="bio-entry">
                                <div class="sub-title">${item.year}</div>
                                <div class="copy">${item.title}</div>
                            </div>
                        `).join('')}
                    </div>
                    <h1 class="title">Teaching</h1>
                    <div class="entries-wrapper">
                        ${teachingData.slice(0, 5).map(item => `
                            <div class="bio-entry">
                                <div class="sub-title">${item.year}</div>
                                <div class="copy">${item.title}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            document.getElementById('awards-teaching-col').innerHTML = awardsHTML;

            renderList(document.getElementById('service-col'), "Service", serviceData.slice(0, 10), (item) => `
                <div class="bio-entry">
                    <div class="sub-title">${item.year}</div>
                    <div class="copy">${item.title}</div>
                </div>
            `);

            const pressLimit = 6;
            renderList(document.getElementById('press-col-1'), "Press", publicationsData.slice(0, pressLimit), (item) => `
                <div class="bio-entry">
                    <div class="sub-title">${item.year}</div>
                    <div class="copy"><strong>${item.body}</strong><br>${item.title}</div>
                </div>
            `);

            renderList(document.getElementById('press-col-2'), "", publicationsData.slice(pressLimit, pressLimit * 2), (item) => `
                <div class="bio-entry">
                    <div class="sub-title">${item.year}</div>
                    <div class="copy"><strong>${item.body}</strong><br>${item.title}</div>
                </div>
            `);
        }



    } catch (err) {
        console.error('Error loading bio data:', err);
    }
});

const speakingTemplate = (item) => `
    <div class="bio-entry">
        <div class="sub-title">${item.year}</div>
        <div class="copy"><strong>${item.body}</strong><br>${item.title}</div>
    </div>
`;

function renderList(container, title, items, templateFn) {
    if (!container) return;
    container.innerHTML = `
        <div class="cell-content">
            <h1 class="title">${title}</h1>
            <div class="entries-wrapper">
                ${items.map(templateFn).join('')}
            </div>
        </div>
    `;
}
