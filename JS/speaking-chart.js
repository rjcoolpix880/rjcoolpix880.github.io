// Helper function to generate identical color palette across Chart, Map, and Text List
// Color palette ranges from Primary Coral (#FA8072), through Soft Lilac (#AF7EE1), to Slate Cyan (#00ABD8)
window.getSalmonColorPalette = function(speakingData, field) {
    if (!speakingData || !speakingData.length) return {};
    const items = speakingData.filter(d => d.section === "Speaking Engagements");
    const aggregated = d3.rollups(
        items,
        v => v.length,
        d => {
            const val = d[field] || "Other";
            if (field === 'body') {
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

    const total = aggregated.length;
    const colorMap = {};
    const colorInterpolator = d3.scaleLinear()
        .domain([0, 0.5, 1])
        .range(['#FA8072', '#AF7EE1', '#00ABD8']);

    aggregated.forEach((item, i) => {
        let color = "#FA8072";
        if (total > 1) {
            color = colorInterpolator(i / (total - 1));
        }
        colorMap[item[0]] = color;
    });
    return colorMap;
};

window.renderSpeakingChart = function(data, container) {
    if (!data || !container) return;

    // Filter to only Speaking Engagements
    const speakingData = data.filter(d => d.section === "Speaking Engagements");
    const totalCount = speakingData.length;

    const fields = ['topic', 'year', 'category', 'body'];
    let currentField = window.currentChartField || 'topic';

    window.changeChartField = function(field) {
        currentField = field;
        window.currentChartField = field;
        updateChart();
        if (window.onChartFieldChanged) {
            window.onChartFieldChanged(field);
        }
    };

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

        // Color scale: Primary Coral (#FA8072) -> Soft Lilac (#AF7EE1) -> Slate Cyan (#00ABD8)
        const colorScale = (i, total) => {
            if (total <= 1) return "#FA8072";
            const colorInterpolator = d3.scaleLinear()
                .domain([0, 0.5, 1])
                .range(['#FA8072', '#AF7EE1', '#00ABD8']);
            return colorInterpolator(i / (total - 1));
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

        // Add labels (sums) in middle of segments (only if segment is large enough)
        svg.selectAll(".slice-label").remove();

        const labelSlices = data_ready.filter(d => (d.endAngle - d.startAngle) > 0.18);

        const t = svg.selectAll(".slice-label")
            .data(labelSlices, d => d.data[0]);

        t.enter()
            .append("text")
            .attr("class", "slice-label")
            .attr("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", "11px")
            .style("font-family", "Roboto Slab, serif")
            .style("pointer-events", "none")
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
