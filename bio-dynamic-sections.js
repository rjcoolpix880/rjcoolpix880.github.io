document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('dynamic-bio-sections');
    if (!container) return;

    // Inject styles for interactivity
    var style = document.createElement('style');
    style.textContent = `
        .speaking-engagement-item {
            transition: opacity 0.3s ease;
        }
        .speaking-engagement-item.greyed-out {
            opacity: 0.25;
        }
        .interactive-year, .interactive-body {
            transition: color 0.2s ease, text-decoration 0.2s ease;
        }
        .interactive-year:hover, .interactive-body:hover {
            color: #FA8072;
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);

    // Global state and logic for interactivity
    window.activeFilter = null;

    window.updateSpeakingFilter = function(field, value) {
        if (field && value) {
            window.activeFilter = { field: field, value: value };
        } else {
            window.activeFilter = null;
        }

        // 1. Update the list items opacity
        var listItems = document.querySelectorAll('.speaking-engagement-item');
        listItems.forEach(function(li) {
            if (!window.activeFilter) {
                li.classList.remove('greyed-out');
            } else {
                var match = false;
                if (field === 'body') {
                    var itemBody = li.getAttribute('data-body') || '';
                    var filterVal = value;
                    if (filterVal === 'AIA' && itemBody.includes('AIA')) match = true;
                    else if (filterVal === 'PSMJ' && itemBody.includes('PSMJ')) match = true;
                    else if (filterVal === 'BIMxt' && itemBody.includes('BIMxt')) match = true;
                    else if (filterVal === 'UNC Charlotte' && itemBody.includes('UNC Charlotte')) match = true;
                    else if (filterVal === 'NC State' && itemBody.includes('NC State')) match = true;
                    else if (filterVal === 'Grassfield STEM' && itemBody.includes('Grassfield')) match = true;
                    else if (itemBody === filterVal) match = true;
                } else {
                    var itemVal = li.getAttribute('data-' + field);
                    match = (itemVal === value);
                }

                if (match) {
                    li.classList.remove('greyed-out');
                } else {
                    li.classList.add('greyed-out');
                }
            }
        });

        // 2. Update the pie chart visual
        if (window.refreshChartFilterVisuals) {
            window.refreshChartFilterVisuals();
        }
    };

    window.selectFieldAndValue = function(field, value) {
        if (window.changeChartField) {
            window.changeChartField(field);
        }
        window.updateSpeakingFilter(field, value);
    };

    var jsonPath = 'bio-data.json';

    // Defined explicit order for sections
    var sectionOrder = [
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

    fetch(jsonPath)
        .then(function(response) { return response.json(); })
        .then(function(data) {
            // Filter data by status (only keep if status is complete, null, empty, or undefined)
            data = data.filter(function(entry) {
                if (entry.status === undefined || entry.status === null || entry.status === '') {
                    return true;
                }
                if (typeof entry.status === 'string' && entry.status.toLowerCase() === 'complete') {
                    return true;
                }
                return false;
            });

            // Group data by section
            var groupedData = {};
            data.forEach(function(entry) {
                var sec = entry.section || "Other";
                if (!groupedData[sec]) {
                    groupedData[sec] = [];
                }
                groupedData[sec].push(entry);
            });

            // Get all unique sections
            var allSections = Object.keys(groupedData);

            // Sort sections based on predefined array
            allSections.sort(function(a, b) {
                var indexA = sectionOrder.indexOf(a);
                var indexB = sectionOrder.indexOf(b);

                // If both are in the list, compare indices
                if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                }
                // If only a is in the list, it comes first
                if (indexA !== -1) return -1;
                // If only b is in the list, it comes first
                if (indexB !== -1) return 1;
                
                // If neither are in the list, sort alphabetically
                return a.localeCompare(b);
            });

            container.innerHTML = '';

            // Construct DOM for each section
            allSections.forEach(function(sectionName, index) {
                var items = groupedData[sectionName];

                // If not the first section, add the whitelineBig separator
                if (index > 0) {
                    var whiteline = document.createElement('div');
                    whiteline.className = 'whitelineBig';
                    container.appendChild(whiteline);
                }

                // Left column for header and possibly map
                var colThird = document.createElement('div');
                colThird.className = 'col-third container';

                var h3 = document.createElement('h3');
                h3.textContent = sectionName;
                colThird.appendChild(h3);
                colThird.appendChild(document.createElement('br'));
                
                // Add the map if this is the Speaking Engagements section
                if (sectionName === "Speaking Engagements") {
                    colThird.appendChild(document.createElement('br'));
                    var mapContainer = document.createElement('div');
                    mapContainer.className = 'bio-map-iframe-container';
                    var iframe = document.createElement('iframe');
                    iframe.className = 'bio-map-iframe';
                    iframe.src = 'bio-map.html';
                    mapContainer.appendChild(iframe);
                    colThird.appendChild(mapContainer);

                    // Add Donut Chart
                    colThird.appendChild(document.createElement('br'));
                    colThird.appendChild(document.createElement('br'));
                    var chartContainer = document.createElement('div');
                    chartContainer.id = 'speaking-chart-container';
                    colThird.appendChild(chartContainer);
                    
                    if (window.renderSpeakingChart) {
                        window.renderSpeakingChart(items, chartContainer);
                    }
                }

                container.appendChild(colThird);

                // Right column for the list
                var colTwoThirds = document.createElement('div');
                colTwoThirds.className = 'col-2third container';
                
                // Extra spacing for Speaking Engagements list container (mimicking old layout)
                if (sectionName === "Speaking Engagements") {
                    colTwoThirds.appendChild(document.createElement('br'));
                    colTwoThirds.appendChild(document.createElement('br'));
                }

                var ul = document.createElement('ul');

                // Sort items by year descending within the section
                // items already defined at top of loop
                items.sort(function(a, b) {
                    var yearA = parseInt(a.year, 10) || 0;
                    var yearB = parseInt(b.year, 10) || 0;
                    return yearB - yearA;
                });

                items.forEach(function(entry) {
                    // Check if it's CV or has a title
                    if (sectionName === "Curriculum Vitae" || entry.title) {
                        var li = document.createElement('li');
                        
                        if (sectionName === "Curriculum Vitae") {
                            // CV specific formatting
                            if (entry.years) {
                                li.appendChild(document.createTextNode(entry.years + ' '));
                            }
                            if (entry.firm) {
                                var strong = document.createElement('strong');
                                strong.textContent = entry.firm;
                                li.appendChild(strong);
                                li.appendChild(document.createTextNode(' '));
                            }
                            var titles = [];
                            if (entry.title1) titles.push(entry.title1);
                            if (entry.title2) titles.push(entry.title2);
                            if (titles.length > 0) {
                                li.appendChild(document.createTextNode(titles.join(', ')));
                            }
                        } else {
                            // Standard formatting
                            // 1. Add Year
                            if (entry.year) {
                                var yearText = entry.year + ' ';
                                if (sectionName === "Speaking Engagements") {
                                    var yearSpan = document.createElement('span');
                                    yearSpan.className = 'interactive-year';
                                    yearSpan.style.cursor = 'pointer';
                                    yearSpan.textContent = yearText;
                                    yearSpan.onclick = function(e) {
                                        e.stopPropagation();
                                        if (window.selectFieldAndValue) {
                                            window.selectFieldAndValue('year', entry.year);
                                        }
                                    };
                                    li.appendChild(yearSpan);
                                } else {
                                    li.appendChild(document.createTextNode(yearText));
                                }
                            }

                            // 2. Add Body (Bold) if it exists
                            if (entry.body) {
                                var strong = document.createElement('strong');
                                strong.textContent = entry.body;
                                if (sectionName === "Speaking Engagements") {
                                    strong.className = 'interactive-body';
                                    strong.style.cursor = 'pointer';
                                    strong.onclick = function(e) {
                                        e.stopPropagation();
                                        if (window.selectFieldAndValue) {
                                            let groupedBody = entry.body;
                                            if (entry.body.includes("AIA")) groupedBody = "AIA";
                                            else if (entry.body.includes("PSMJ")) groupedBody = "PSMJ";
                                            else if (entry.body.includes("BIMxt")) groupedBody = "BIMxt";
                                            else if (entry.body.includes("UNC Charlotte")) groupedBody = "UNC Charlotte";
                                            else if (entry.body.includes("NC State")) groupedBody = "NC State";
                                            else if (entry.body.includes("Grassfield")) groupedBody = "Grassfield STEM";
                                            
                                            window.selectFieldAndValue('body', groupedBody);
                                        }
                                    };
                                }
                                li.appendChild(strong);
                                li.appendChild(document.createTextNode(' ')); // Space after body
                            }

                            // 3. Add Title (Link or Text)
                            if (entry.link) {
                                var a = document.createElement('a');
                                a.href = entry.link;
                                a.target = '_blank';
                                a.textContent = entry.title;
                                li.appendChild(a);
                            } else {
                                li.appendChild(document.createTextNode(entry.title));
                            }

                            // Add classes and data attributes for Speaking Engagements list item
                            if (sectionName === "Speaking Engagements") {
                                li.className = 'speaking-engagement-item';
                                li.setAttribute('data-topic', entry.topic || '');
                                li.setAttribute('data-year', entry.year || '');
                                li.setAttribute('data-category', entry.category || '');
                                li.setAttribute('data-body', entry.body || '');
                            }
                        }

                        ul.appendChild(li);
                    }
                });

                colTwoThirds.appendChild(ul);
                container.appendChild(colTwoThirds);
            });
        })
        .catch(function(error) {
            console.error('Error fetching bio sections: ', error);
            container.innerHTML = '<p>Could not load bio sections data.</p>';
        });
});
