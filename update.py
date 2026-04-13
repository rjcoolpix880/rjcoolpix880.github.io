import json
import os

filepath = r"c:\rjcoolpix880.github.io\project-data.json"
with open(filepath, "r", encoding="utf-8") as f:
    data = json.load(f)

new_desc = """Colonial Williamsburg is known for its strict architectural requirements. Our team’s design fit comfortably within the traditional aesthetic without appearing dated. We worked closely with the Williamsburg Architecture Review Board to ensure the size and presence of the complex was appropriate for the site, creating a facility that respects its historic setting. As a stage for live performance, the building draws its lineage from the colonial past through the enduring language of music.

Rather than relying on literal imitation of 18th-century buildings, the design uses this musical connection as the primary bridge to the past. The fife and drum music heard throughout the city became the main driver for our architectural decisions. Specifically, we used the rhythmic measures of "Yankee Doodle" to guide the layout of the lobby’s shading screen. By studying the fife melody, we identified fifteen unique musical phrases that were translated into a series of repeating panel types. Each panel features a different depth and density of shading elements, creating a visual texture built directly from the song’s composition. Even the vertical supports behind the screen follow the song’s drum patterns, providing a subtle structural logic that moves across the entire facade.

This approach ensures the building is defined by a story that resonates with residents and visitors. By aligning the facility’s function with this specific part of Williamsburg’s heritage, the architecture becomes a meaningful part of the Williamsburg’s story. For donors and stakeholders, this provides a clear connection to the project, showing that every design choice was made to celebrate the local spirit and the shared experience of performance."""

# Check if the last project is "Williamsburg Live Performance Venue"
if data[-1].get("projectName") == "Williamsburg Live Performance Venue":
    data[-1]["technologyDescription"] = new_desc
else:
    data.append({
        "projectName": "Williamsburg Live Performance Venue",
        "projectAwards": [],
        "architecturalDescription": None,
        "technologyDescription": new_desc
    })

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)
