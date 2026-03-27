document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('dynamic-bio-sections');
    if (!container) return;

    var jsonPath = 'bio-data.json';

    // Defined explicit order for sections
    var sectionOrder = [
        "Speaking Engagements",
        "Task Force Appointments",
        "Jury Appointments",
        "Chair Appointments",
        "Awards",
        "Publications",
        "Internal Speaking Engagements"
    ];

    fetch(jsonPath)
        .then(function(response) { return response.json(); })
        .then(function(data) {
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
                var items = groupedData[sectionName];
                items.sort(function(a, b) {
                    var yearA = parseInt(a.year, 10) || 0;
                    var yearB = parseInt(b.year, 10) || 0;
                    return yearB - yearA;
                });

                items.forEach(function(entry) {
                    if (entry.title) {
                        var li = document.createElement('li');
                        
                        // Text node prefix for the year
                        var textPrefix = entry.year ? entry.year + ' - ' : '';
                        
                        if (entry.section === "Speaking Engagements" && entry.year) {
                            textPrefix = entry.year + ' ';
                        } else if (entry.section !== "Speaking Engagements" && entry.year) {
                             textPrefix = entry.year + ' ';
                        }

                        // Combine the year text and title properly
                        if (entry.link) {
                            var textNode = document.createTextNode(textPrefix);
                            var a = document.createElement('a');
                            a.href = entry.link;
                            a.target = '_blank';
                            a.textContent = entry.title;
                            li.appendChild(textNode);
                            li.appendChild(a);
                        } else {
                            li.textContent = textPrefix + entry.title;
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
