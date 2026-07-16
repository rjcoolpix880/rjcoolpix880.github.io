/**
 * Speaking Engagements Donut Chart
 * Colors segments by selected category (topic, category, or body)
 * Base color: #FA8072 (Salmon)
 */

window.renderSpeakingChart = function(data, container) {
    if (!data || !container) return;

    // Filter to only Speaking Engagements (though bio-dynamic-sections already does this)
    const speakingData = data.filter(d => d.section === "Speaking Engagements");
    const totalCount = speakingData.length;

    const menuLabel = document.createElement('div');
    menuLabel.textContent = 'View by:';
    menuLabel.style.fontSize = '9px';
    menuLabel.style.fontFamily = 'Roboto Slab, serif';
    menuLabel.style.textTransform = 'uppercase';
    menuLabel.style.letterSpacing = '2px';
    menuLabel.style.color = '#d3d3d3';
    menuLabel.style.marginBottom = '5px';
    menuLabel.style.textAlign = 'center';
    container.appendChild(menuLabel);

    const menu = document.createElement('div');
    menu.style.display = 'flex';
    menu.style.gap = '15px';
    menu.style.marginBottom = '20px';
    menu.style.fontSize = '12px';
    menu.style.fontFamily = 'Roboto Slab, serif';
    menu.style.textTransform = 'uppercase';
    menu.style.letterSpacing = '1px';
    menu.style.justifyContent = 'center';

    const fields = ['topic', 'year', 'category', 'body'];
    let currentField = 'topic';

    window.changeChartField = function(field) {
        currentField = field;
        menu.querySelectorAll('span').forEach(s => {
            const isMatch = s.textContent.toLowerCase() === field.toLowerCase();
            s.style.borderBottom = isMatch ? '2px solid #FA8072' : '2px solid transparent';
            s.style.color = isMatch ? '#313131' : '#b3b3b3';
        });
        updateChart();
    };

    fields.forEach(field => {
        const btn = document.createElement('span');
        btn.textContent = field;
        btn.style.cursor = 'pointer';
        btn.style.paddingBottom = '2px';
        btn.style.borderBottom = field === currentField ? '2px solid #FA8072' : '2px solid transparent';
        btn.style.color = field === currentField ? '#313131' : '#b3b3b3';
        btn.style.transition = 'all 0.3s ease';
        
        btn.onmouseover = function() {
            if (currentField !== field) {
                btn.style.color = '#FA8072';
                btn.style.borderBottom = '2px solid rgba(250, 128, 114, 0.3)';
            }
        };

        btn.onmouseout = function() {
            if (currentField !== field) {
                btn.style.color = '#b3b3b3';
                btn.style.borderBottom = '2px solid transparent';
            }
        };

        btn.onclick = function() {
            if (window.updateSpeakingFilter) {
                window.updateSpeakingFilter(null, null);
            }
            window.changeChartField(field);
        };
        menu.appendChild(btn);
    });

    container.appendChild(menu);

    // Chart container
    const chartDiv = document.createElement('div');
    chartDiv.id = 'speaking-donut-svg-container';
    chartDiv.style.textAlign = 'center';
    container.appendChild(chartDiv);

    const width = 300;
    const height = 300;
    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;
    const innerRadius = radius * 0.6;

    const svg = d3.select(chartDiv)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Tooltip/Hover label
    const label = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "2.5em")
        .style("font-size", "12px")
        .style("font-family", "Roboto Slab, serif")
        .style("fill", "#FA8072")
        .style("opacity", 0)
        .text("");

    // Total count in middle
    const centerGroup = svg.append("g");
    
    const totalText = centerGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.1em")
        .style("font-size", "42px")
        .style("font-family", "Teko, sans-serif")
        .style("fill", "#313131")
        .text(totalCount);
    
    const totalLabel = centerGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.6em")
        .style("font-size", "9px")
        .style("font-family", "Roboto Slab, serif")
        .style("text-transform", "uppercase")
        .style("letter-spacing", "1.5px")
        .style("fill", "#b3b3b3")
        .text("Total Engagements");

    // Tooltip/Hover label (will replace the total label on hover)
    const hoverLabelGroup = centerGroup.append("g")
        .style("display", "none");

    function wrapText(text, data) {
        text.selectAll("tspan").remove();
        const words = data.split(/\s+/);
        const lineLimit = 15; // characters per line approx
        let lines = [];
        let currentLine = "";

        words.forEach(word => {
            if ((currentLine + word).length > lineLimit && currentLine !== "") {
                lines.push(currentLine.trim());
                currentLine = word + " ";
            } else {
                currentLine += word + " ";
            }
        });
        lines.push(currentLine.trim());

        // Adjust font size based on number of lines
        const fontSize = lines.length > 2 ? "8px" : "10px";
        
        lines.forEach((line, i) => {
            text.append("tspan")
                .attr("x", 0)
                .attr("dy", i === 0 ? "1.6em" : "1.1em")
                .style("font-size", fontSize)
                .text(line);
        });
    }

    function updateChart() {
        // Aggregate data
        const aggregated = d3.rollups(
            speakingData,
            v => v.length,
            d => {
                const val = d[currentField] || "Other";
                if (currentField === 'body') {
                    if (val.includes("AIA")) return "AIA";
                    if (val.includes("PSMJ")) return "PSMJ";
                    if (val.includes("BIMxt")) return "BIMxt";
                    if (val.includes("UNC Charlotte")) return "UNC Charlotte";
                    if (val.includes("NC State")) return "NC State";
                    if (val.includes("Grassfield")) return "Grassfield STEM";
                }
                return val;
            }
        ).sort((a, b) => b[1] - a[1]);

        const pie = d3.pie()
            .value(d => d[1])
            .sort(null);

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius);

        const outerArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);

        // Color scale: #FA8072 and lighter
        // Base HSL: 6, 93%, 71%
        const colorScale = (i, total) => {
            if (total <= 1) return "#FA8072";
            const step = 20 / (total - 1);
            const l = 71 + (i * step);
            const s = 0.93 - (i * (0.3 / (total - 1))); // Slightly desaturate as it gets lighter
            return d3.hsl(6, s, l / 100).toString();
        };

        const data_ready = pie(aggregated);

        // Join data
        const u = svg.selectAll(".slice")
            .data(data_ready, d => d.data[0]);

        // Remove old
        u.exit().remove();

        // Enter new
        const enter = u.enter()
            .append("path")
            .attr("class", "slice")
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("cursor", "pointer");

        // Update all
        svg.selectAll(".slice")
            .on("click", function(event, d) {
                event.stopPropagation();
                const clickedValue = d.data[0];
                if (window.activeFilter && window.activeFilter.field === currentField && window.activeFilter.value === clickedValue) {
                    if (window.updateSpeakingFilter) {
                        window.updateSpeakingFilter(null, null);
                    }
                } else {
                    if (window.updateSpeakingFilter) {
                        window.updateSpeakingFilter(currentField, clickedValue);
                    }
                }
            })
            .transition()
            .duration(1000)
            .attr("fill", (d, i) => {
                if (window.activeFilter && window.activeFilter.field === currentField) {
                    return d.data[0] === window.activeFilter.value ? colorScale(i, aggregated.length) : "#e0e0e0";
                }
                return colorScale(i, aggregated.length);
            })
            .attrTween("d", function(d) {
                this._current = this._current || d;
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) { return arc(interpolate(t)); };
            });

        // Interactivity
        svg.selectAll(".slice")
            .on("mouseover", function(event, d) {
                d3.select(this).transition().duration(200).attr("opacity", 0.7);
                totalLabel.style("display", "none");
                
                // Clear and rebuild hover label
                hoverLabelGroup.style("display", "block").selectAll("text").remove();
                const text = hoverLabelGroup.append("text")
                    .attr("text-anchor", "middle")
                    .style("font-family", "Roboto Slab, serif")
                    .style("text-transform", "uppercase")
                    .style("letter-spacing", "1px")
                    .style("fill", "#FA8072")
                    .style("font-weight", "bold");
                
                wrapText(text, d.data[0]);
            })
            .on("mouseout", function(event, d) {
                d3.select(this).transition().duration(200).attr("opacity", 1);
                hoverLabelGroup.style("display", "none");
                totalLabel.style("display", "block");
            });

        // Add labels (sums) in middle of segments
        const t = svg.selectAll(".slice-label")
            .data(data_ready, d => d.data[0]);

        t.exit().remove();

        const tEnter = t.enter()
            .append("text")
            .attr("class", "slice-label")
            .attr("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", "12px")
            .style("font-family", "Roboto Slab, serif")
            .style("pointer-events", "none");

        svg.selectAll(".slice-label")
            .transition()
            .duration(1000)
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .text(d => d.data[1])
            .style("opacity", function(d) {
                if (window.activeFilter && window.activeFilter.field === currentField) {
                    return d.data[0] === window.activeFilter.value ? 1 : 0.3;
                }
                return 1;
            });

        // Define global function to refresh visual filtering representation on slices
        window.refreshChartFilterVisuals = function() {
            svg.selectAll(".slice")
                .transition()
                .duration(300)
                .attr("fill", function(d, i) {
                    if (window.activeFilter && window.activeFilter.field === currentField) {
                        return d.data[0] === window.activeFilter.value ? colorScale(i, aggregated.length) : "#e0e0e0";
                    }
                    return colorScale(i, aggregated.length);
                });

            svg.selectAll(".slice-label")
                .transition()
                .duration(300)
                .style("opacity", function(d) {
                    if (window.activeFilter && window.activeFilter.field === currentField) {
                        return d.data[0] === window.activeFilter.value ? 1 : 0.3;
                    }
                    return 1;
                });
        };
    }

    updateChart();

    // Click off handling on the SVG background/empty area
    d3.select(chartDiv).select("svg").on("click", function(event) {
        if (!event.target.classList.contains('slice')) {
            if (window.updateSpeakingFilter) {
                window.updateSpeakingFilter(null, null);
            }
        }
    });

    // Global document click off handling (clicks outside chart/list)
    if (window._speakingChartDocClickHandler) {
        document.removeEventListener('click', window._speakingChartDocClickHandler);
    }
    window._speakingChartDocClickHandler = function(event) {
        if (window.activeFilter) {
            const chartCont = document.getElementById('speaking-chart-container');
            const listCont = document.querySelector('.col-2third.container');
            if (chartCont && !chartCont.contains(event.target) && listCont && !listCont.contains(event.target)) {
                if (window.updateSpeakingFilter) {
                    window.updateSpeakingFilter(null, null);
                }
            }
        }
    };
    document.addEventListener('click', window._speakingChartDocClickHandler);
};
