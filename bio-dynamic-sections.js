document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('dynamic-bio-sections');
    if (!container) return;

    // Inject styles for interactivity
    var style = document.createElement('style');
    style.textContent = `
        .speaking-engagement-item {
            transition: opacity 0.3s ease;
            position: relative;
            list-style: none !important;
            padding-left: 15px;
            margin-bottom: 0px;
        }
        .speaking-engagement-item.greyed-out {
            opacity: 0.25;
        }
        .speaking-bullet-dot {
            position: absolute;
            left: 0;
            top: 0.45em;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background-color: #FA8072;
            display: inline-block;
            transition: background-color 0.3s ease, transform 0.2s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,0.15);
        }
        .speaking-engagement-item:hover .speaking-bullet-dot {
            transform: scale(1.3);
        }
        .interactive-year, .interactive-body {
            transition: color 0.2s ease, text-decoration 0.2s ease;
        }
        .interactive-year:hover, .interactive-body:hover {
            color: #FA8072;
            text-decoration: underline;
        }

        .speaking-viewby-container {
            margin-top: 14px;
            margin-bottom: 14px;
            text-align: center;
            font-family: 'Roboto Slab', serif;
        }
        .speaking-viewby-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #b3b3b3;
            margin-bottom: 5px;
        }
        .speaking-viewby-menu {
            display: flex;
            gap: 15px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            justify-content: center;
        }
        .speaking-viewby-btn {
            cursor: pointer;
            padding-bottom: 2px;
            border-bottom: 2px solid transparent;
            color: #b3b3b3;
            transition: all 0.3s ease;
        }
        .speaking-viewby-btn:hover {
            color: #FA8072;
            border-bottom: 2px solid rgba(250, 128, 114, 0.3);
        }
        .speaking-viewby-btn.active {
            color: #313131;
            border-bottom: 2px solid #FA8072;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);

    // Global state and logic for interactivity
    window.activeFilter = null;
    window.currentChartField = 'topic';
    window.allSpeakingRawData = [];

    window.updateSpeakingListBulletColors = function(field) {
        field = field || window.currentChartField || 'topic';
        var listItems = document.querySelectorAll('.speaking-engagement-item');
        if (!listItems.length || !window.getSalmonColorPalette || !window.allSpeakingRawData.length) return;

        var colorMap = window.getSalmonColorPalette(window.allSpeakingRawData, field);
        listItems.forEach(function(li) {
            var dot = li.querySelector('.speaking-bullet-dot');
            if (!dot) return;

            var rawVal = li.getAttribute('data-' + field) || '';
            var val = rawVal || 'Other';
            if (field === 'body') {
                if (val.includes("AIA")) val = "AIA";
                else if (val.includes("PSMJ")) val = "PSMJ";
                else if (val.includes("BIMxt")) val = "BIMxt";
                else if (val.includes("UNC Charlotte")) val = "UNC Charlotte";
                else if (val.includes("NC State")) val = "NC State";
                else if (val.includes("Grassfield")) val = "Grassfield STEM";
            }
            var color = colorMap[val] || '#DF6A58';
            dot.style.backgroundColor = color;
        });
    };

    window.updateSpeakingFilter = function(field, value) {
        if (field && value) {
            window.activeFilter = { field: field, value: value };
        } else {
            window.activeFilter = null;
        }

        // 1. Update list items opacity
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

        // 2. Update pie chart visual
        if (window.refreshChartFilterVisuals) {
            window.refreshChartFilterVisuals();
        }

        // 3. Update map iframe filter
        var iframe = document.querySelector('.bio-map-iframe');
        if (iframe && iframe.contentWindow && iframe.contentWindow.updateMapFilter) {
            iframe.contentWindow.updateMapFilter(field, value);
        }
    };

    window.selectFieldAndValue = function(field, value) {
        if (field) {
            window.currentChartField = field;
            if (window.changeChartField) {
                window.changeChartField(field);
            }
            var iframe = document.querySelector('.bio-map-iframe');
            if (iframe && iframe.contentWindow && iframe.contentWindow.setMapField) {
                iframe.contentWindow.setMapField(field);
            }

            // Sync View by buttons state
            document.querySelectorAll('.speaking-viewby-btn').forEach(function(btn) {
                if (btn.getAttribute('data-field') === field) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Update text list bullet dot colors to match
            window.updateSpeakingListBulletColors(field);
        }
        window.updateSpeakingFilter(field, value);
    };

    window.onChartFieldChanged = function(field) {
        window.currentChartField = field;
        var iframe = document.querySelector('.bio-map-iframe');
        if (iframe && iframe.contentWindow && iframe.contentWindow.setMapField) {
            iframe.contentWindow.setMapField(field);
        }
        document.querySelectorAll('.speaking-viewby-btn').forEach(function(btn) {
            if (btn.getAttribute('data-field') === field) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        window.updateSpeakingListBulletColors(field);
    };

    var jsonPath = 'bio-data.json';

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
            window.allSpeakingRawData = data;

            data = data.filter(function(entry) {
                if (entry.status === undefined || entry.status === null || entry.status === '') {
                    return true;
                }
                if (typeof entry.status === 'string' && entry.status.toLowerCase() === 'complete') {
                    return true;
                }
                return false;
            });

            var groupedData = {};
            data.forEach(function(entry) {
                var sec = entry.section || "Other";
                if (!groupedData[sec]) {
                    groupedData[sec] = [];
                }
                groupedData[sec].push(entry);
            });

            var allSections = Object.keys(groupedData);

            allSections.sort(function(a, b) {
                var indexA = sectionOrder.indexOf(a);
                var indexB = sectionOrder.indexOf(b);

                if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                }
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return a.localeCompare(b);
            });

            container.innerHTML = '';

            allSections.forEach(function(sectionName, index) {
                var items = groupedData[sectionName];

                if (index > 0) {
                    var whiteline = document.createElement('div');
                    whiteline.className = 'whitelineBig';
                    container.appendChild(whiteline);
                }

                var colThird = document.createElement('div');
                colThird.className = 'col-third container';

                var h3 = document.createElement('h3');
                h3.textContent = sectionName;
                colThird.appendChild(h3);
                colThird.appendChild(document.createElement('br'));
                
                if (sectionName === "Speaking Engagements") {
                    colThird.appendChild(document.createElement('br'));
                    var mapContainer = document.createElement('div');
                    mapContainer.className = 'bio-map-iframe-container';
                    var iframe = document.createElement('iframe');
                    iframe.className = 'bio-map-iframe';
                    iframe.src = 'bio-map.html';
                    mapContainer.appendChild(iframe);
                    colThird.appendChild(mapContainer);

                    // Add View By menu directly below map
                    var viewByDiv = document.createElement('div');
                    viewByDiv.className = 'speaking-viewby-container';
                    viewByDiv.innerHTML = `
                        <div class="speaking-viewby-label">View by:</div>
                        <div class="speaking-viewby-menu">
                            <span class="speaking-viewby-btn ${window.currentChartField === 'topic' ? 'active' : ''}" data-field="topic">topic</span>
                            <span class="speaking-viewby-btn ${window.currentChartField === 'year' ? 'active' : ''}" data-field="year">year</span>
                            <span class="speaking-viewby-btn ${window.currentChartField === 'category' ? 'active' : ''}" data-field="category">category</span>
                            <span class="speaking-viewby-btn ${window.currentChartField === 'body' ? 'active' : ''}" data-field="body">body</span>
                        </div>
                    `;
                    colThird.appendChild(viewByDiv);

                    viewByDiv.querySelectorAll('.speaking-viewby-btn').forEach(function(btn) {
                        btn.onclick = function() {
                            var f = this.getAttribute('data-field');
                            window.selectFieldAndValue(f, null);
                        };
                    });

                    // Add Donut Chart
                    colThird.appendChild(document.createElement('br'));
                    var chartContainer = document.createElement('div');
                    chartContainer.id = 'speaking-chart-container';
                    colThird.appendChild(chartContainer);
                    
                    if (window.renderSpeakingChart) {
                        window.renderSpeakingChart(items, chartContainer);
                    }
                }

                container.appendChild(colThird);

                var colTwoThirds = document.createElement('div');
                colTwoThirds.className = 'col-2third container';
                
                if (sectionName === "Speaking Engagements") {
                    colTwoThirds.appendChild(document.createElement('br'));
                    colTwoThirds.appendChild(document.createElement('br'));
                }

                var ul = document.createElement('ul');

                items.sort(function(a, b) {
                    var yearA = parseInt(a.year, 10) || 0;
                    var yearB = parseInt(b.year, 10) || 0;
                    return yearB - yearA;
                });

                items.forEach(function(entry) {
                    if (sectionName === "Curriculum Vitae" || entry.title) {
                        var li = document.createElement('li');
                        
                        if (sectionName === "Curriculum Vitae") {
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
                                li.appendChild(document.createTextNode(' '));
                            }

                            if (entry.link) {
                                var a = document.createElement('a');
                                a.href = entry.link;
                                a.target = '_blank';
                                a.textContent = entry.title;
                                li.appendChild(a);
                            } else {
                                li.appendChild(document.createTextNode(entry.title));
                            }

                            if (sectionName === "Speaking Engagements") {
                                li.className = 'speaking-engagement-item';
                                li.setAttribute('data-topic', entry.topic || '');
                                li.setAttribute('data-year', entry.year || '');
                                li.setAttribute('data-category', entry.category || '');
                                li.setAttribute('data-body', entry.body || '');

                                var bulletDot = document.createElement('span');
                                bulletDot.className = 'speaking-bullet-dot';
                                li.insertBefore(bulletDot, li.firstChild);
                            }
                        }

                        ul.appendChild(li);
                    }
                });

                colTwoThirds.appendChild(ul);
                container.appendChild(colTwoThirds);
            });

            // Initial bullet dots color calculation
            setTimeout(function() {
                if (window.updateSpeakingListBulletColors) {
                    window.updateSpeakingListBulletColors('topic');
                }
            }, 100);
        })
        .catch(function(error) {
            console.error('Error fetching bio sections: ', error);
            container.innerHTML = '<p>Could not load bio sections data.</p>';
        });
});
