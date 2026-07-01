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

        // --- PAGE 4 RENDERING (CV Only) ---
        if (document.getElementById('cv-col')) {
            renderList(document.getElementById('cv-col'), "CV", cvData.slice(0, 7), (item) => `
                <div class="bio-entry">
                    <div class="sub-title">${item.years}</div>
                    <div class="copy">${item.firm}<br><strong>${item.title1}${item.title2 ? ' | ' + item.title2 : ''}</strong></div>
                </div>
            `);
        }

        // --- PAGE 5 RENDERING (Speaking Part 1, Map, and Charts) ---
        if (document.getElementById('speaking-col-1') && document.getElementById('map')) {
            // Render first 16 speaking engagements in columns 1 and 2
            renderList(document.getElementById('speaking-col-1'), "Speaking", speakingData.slice(0, 8), speakingTemplate);
            renderList(document.getElementById('speaking-col-2'), "", speakingData.slice(8, 16), speakingTemplate);

            // Initialize Map
            initLeafletMap(speakingData);

            // Render Charts
            initCharts(speakingData);
        }

        // --- PAGE 6 RENDERING (Speaking Part 2 - Remaining Engagements) ---
        if (document.getElementById('speaking-col-3')) {
            renderList(document.getElementById('speaking-col-3'), "Speaking", speakingData.slice(16, 23), speakingTemplate);
            renderList(document.getElementById('speaking-col-4'), "", speakingData.slice(23, 29), speakingTemplate);
            renderList(document.getElementById('speaking-col-5'), "", speakingData.slice(29, 35), speakingTemplate);
        }

        // --- PAGE 7 RENDERING (Honors & Service) ---
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

// Leaflet Map Initialization
function initLeafletMap(speakingData) {
    // Center on USA and disable attribution control to avoid giant text
    const map = L.map('map', { attributionControl: false }).setView([39.0, -95.0], 4);

    // CartoDB Positron No Labels tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
    }).addTo(map);

    const categoryColors = {
        'Conference': '#3388ff',
        'School': '#ff7800'
    };

    // Filter valid locations
    const validEntries = speakingData.filter(entry => 
        entry.lat && entry.long && entry.lat !== '' && entry.long !== ''
    );

    // Aggregate by lat, long
    const locationMap = {};
    validEntries.forEach(entry => {
        const lat = parseFloat(entry.lat);
        const lng = parseFloat(entry.long);
        const key = lat + ',' + lng;
        
        if (!locationMap[key]) {
            locationMap[key] = {
                lat: lat,
                lng: lng,
                entries: [],
                city: entry.city || ''
            };
        }
        locationMap[key].entries.push(entry);
    });

    const bounds = [];

    // Create markers
    Object.values(locationMap).forEach(location => {
        const count = location.entries.length;
        const radius = Math.min(8 + (count - 1) * 3, 20);
        
        const categories = [...new Set(location.entries.map(e => e.category))];
        let color = '#9b59b6'; // Purple for mixed
        if (categories.length === 1) {
            color = categoryColors[categories[0]] || '#3388ff';
        }

        const circle = L.circleMarker([location.lat, location.lng], {
            radius: radius,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);

        bounds.push([location.lat, location.lng]);

        // Build popup
        let popup = `<div style="font-family: 'Lato', sans-serif; font-size: 11px; max-height: 150px; overflow-y: auto;">`;
        if (location.city) {
            popup += `<b>${location.city}</b><br>`;
        }
        popup += `<b>${count} speaking engagement${count > 1 ? 's' : ''}</b><br><br>`;
        
        location.entries.sort((a, b) => parseInt(b.year) - parseInt(a.year));
        location.entries.forEach((entry, idx) => {
            popup += `<b>${entry.year}</b> - ${entry.title}<br>`;
            if (idx < location.entries.length - 1) popup += '<br>';
        });
        popup += `</div>`;
        circle.bindPopup(popup);
    });

    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [30, 30] });
    }
}

// D3 Analytics Donut Charts
function initCharts(speakingData) {
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#7700ff';

    // 1. Process Body Data
    const bodyCounts = {};
    speakingData.forEach(d => {
        let val = d.body || "Other";
        if (val.includes("AIA")) val = "AIA";
        else if (val.includes("PSMJ")) val = "PSMJ";
        else if (val.includes("BIMxt")) val = "BIMxt";
        else if (val.includes("UNC Charlotte")) val = "UNC Charlotte";
        else if (val.includes("NC State")) val = "NC State";
        else if (val.includes("Grassfield")) val = "Grassfield STEM";
        
        bodyCounts[val] = (bodyCounts[val] || 0) + 1;
    });

    const bodyData = Object.entries(bodyCounts).map(([name, value]) => ({ name, value }));
    // Sort descending
    bodyData.sort((a, b) => b.value - a.value);

    // Group small slices (value <= 1 and not one of the main groups if too many) into "Other"
    const mainBodies = [];
    let otherSum = 0;
    bodyData.forEach(d => {
        if (d.value <= 1) {
            otherSum += d.value;
        } else {
            mainBodies.push(d);
        }
    });
    if (otherSum > 0) {
        mainBodies.push({ name: "Other", value: otherSum });
    }

    // 2. Process Category Data
    const catCounts = {};
    speakingData.forEach(d => {
        const val = d.category || "Other";
        catCounts[val] = (catCounts[val] || 0) + 1;
    });
    const categoryData = Object.entries(catCounts).map(([name, value]) => ({ name, value }));
    categoryData.sort((a, b) => b.value - a.value);

    // Draw charts
    drawDonutChart("chart-body", mainBodies, "Total Bodies", accentColor);
    drawDonutChart("chart-category", categoryData, "Total Categories", accentColor);
}

function drawDonutChart(containerId, data, centerLabel, accentColor) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = 360;
    const height = 180;
    const radius = 65;
    const innerRadius = radius * 0.55;

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Label shifted below the donut chart with more clearance
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.6rem")
        .style("font-size", "7.5px")
        .style("font-family", "'Lato', sans-serif")
        .style("fill", "#666")
        .style("text-transform", "uppercase")
        .style("letter-spacing", "0.5px")
        .text(centerLabel);

    // Base color transformation
    const baseColor = d3.hsl(accentColor);
    const colorScale = (i, N) => {
        if (N <= 1) return baseColor.toString();
        const factor = i / (N - 1 || 1);
        const l = baseColor.l + (1 - baseColor.l) * 0.7 * factor;
        const s = baseColor.s * (1 - 0.4 * factor);
        return d3.hsl(baseColor.h, s, l).toString();
    };

    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);

    const outerArc = d3.arc()
        .innerRadius(radius * 1.1)
        .outerRadius(radius * 1.1);

    const pieData = pie(data);

    // Slices
    svg.selectAll("path")
        .data(pieData)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => colorScale(i, data.length))
        .attr("stroke", "#fff")
        .style("stroke-width", "1.5px");

    // Labels & Lines
    svg.selectAll("text.label")
        .data(pieData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("dy", "0.35em")
        .style("font-size", "7.5px")
        .style("font-family", "'Lato', sans-serif")
        .style("fill", "#555")
        .text(d => `${d.data.name} (${d.data.value})`)
        .attr("transform", function(d) {
            const pos = outerArc.centroid(d);
            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            pos[0] = radius * 1.25 * (midAngle < Math.PI ? 1 : -1);
            return `translate(${pos})`;
        })
        .attr("text-anchor", function(d) {
            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            return midAngle < Math.PI ? "start" : "end";
        });

    svg.selectAll("polyline")
        .data(pieData)
        .enter()
        .append("polyline")
        .style("fill", "none")
        .style("stroke", "#ccc")
        .style("stroke-width", "0.8px")
        .style("stroke-dasharray", "1.5,1.5")
        .attr("points", function(d) {
            const posA = arc.centroid(d);
            const posB = outerArc.centroid(d);
            const posC = outerArc.centroid(d);
            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            posC[0] = radius * 1.2 * (midAngle < Math.PI ? 1 : -1);
            return [posA, posB, posC];
        });
}
