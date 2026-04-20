// Simple script to load project data from project-data.json and project-awards.json into architecture.html
document.addEventListener('DOMContentLoaded', () => {
  // Fetch both the project data and awards JSON files
  Promise.all([
    fetch('project-data.json').then(response => response.json()),
    fetch('project-awards.json').then(response => response.json())
  ])
    .then(([projects, awardsData]) => {
      // The awardsData is an array containing an object where keys are projectIDs
      const allAwards = awardsData[0];

      // Loop through each project in the data array
      projects.forEach(project => {
        // If the project doesn't have an ID, skip it
        if (!project.projectID) return;

        // Find the div in the HTML that matches this project's ID
        const projectDiv = document.querySelector(`[data-id="${project.projectID}"]`);
        
        // If a matching div is found, update its fields
        if (projectDiv) {
          
          // Update Date
          const dateDiv = projectDiv.querySelector('.dates');
          if (dateDiv && project.completionDate && project.startDate) {
            dateDiv.innerHTML = `<div class='dataTitle'>Dates:</div> ${project.startDate} - ${project.completionDate}`;
          }

          // Update Project Awards from the new source
          const projectAwardsDiv = projectDiv.querySelector('.projectAwards');
          if (projectAwardsDiv) {
            const awards = allAwards[project.projectID] || [];
            if (awards.length > 0) {
              const formattedAwards = awards
                .map(a => `${a.year} ${a.name} - ${a.body}`)
                .join('<br>');
              projectAwardsDiv.innerHTML = `<div class='dataTitle'>Awards:</div> ${formattedAwards}`;
            } else {
              projectAwardsDiv.innerHTML = ''; // Clear if no awards
            }
          }

          // Update Project SQFT
          const sqftDiv = projectDiv.querySelector('.sqft');
          if (sqftDiv && project.sqft) {
            sqftDiv.innerHTML = `<div class='dataTitle'>Area:</div> ${project.sqft}`;
          }

          // Update Project Type
          const projectTypeDiv = projectDiv.querySelector('.projectType');
          if (projectTypeDiv && project.projectType) {
            projectTypeDiv.innerHTML = `<div class='dataTitle'>Type:</div> ${project.projectType}`;
          }

          // Update Role
          const roleDiv = projectDiv.querySelector('.role');
          if (roleDiv && project.role) {
            roleDiv.innerHTML = `<div class='dataTitle'>Role:</div> ${project.role}`;
          }
        }
      });
    })
    .catch(error => console.error('Error loading project data:', error));
});
