
const data = [
  //['Category', 'Tool', 'Phase Start-Phase End', 'Description', 'https://www.google.com','ease of use'],
  ['Viz', 'Enscape', 'IN-CD', 'description text', 'https://www.clarknexsen.com','0'],
  ['Viz', 'Lumion', 'SD-CD', 'more description text', 'https://www.google.com','1'],
  ['Carbon', 'Tally Cat', 'DD-DD', 'yet again description text', 'https://www.google.com','2'],
  ['Carbon', 'Kalidescope', 'SD-DD', 'yo description text', 'https://www.clarknexsen.com','0'],
  ['Energy', 'Energy +', 'DD-CD', 'yet again description text', 'https://www.google.com','2'],
  ['Viz', 'Vray', 'DD-DD', 'more description text that is much longer so we can see how it ends up being displayed. now im just rambeling to make it longer.', 'https://www.vray.com','2']
];

const parsedData = data.map(item => {
  return {
    category: item[0],
    name: item[1],
    cssClass: item[2],
    tooltip: item[3],
    link: item[4]
  };
});



const table = document.createElement('table');

// Function to sort the table by category or cssClass
const sortTable = (sortKey) => {
  parsedData.sort((a, b) => {
    if (a[sortKey] < b[sortKey]) {
      return -1;
    }
    if (a[sortKey] > b[sortKey]) {
      return 1;
    }
    return 0;
  });

  // Clear the existing table
  table.innerHTML = '';

  // Create the first row with th elements
  const firstRow = document.createElement('tr');
  const categoryHeader = document.createElement('th');
  categoryHeader.textContent = 'Category';
  const nameHeader = document.createElement('th');
  nameHeader.innerHTML = "<div class='title'>Interview</div><div class='title'>SD</div><div class='title'>DD</div><div class='title'>CD</div> ";
  firstRow.appendChild(categoryHeader);
  firstRow.appendChild(nameHeader);
  table.appendChild(firstRow);




  // Rebuild the table with the sorted data

  parsedData.forEach(item => {
    const row = document.createElement('tr');
    const categoryCell = document.createElement('td');
    const nameCell = document.createElement('td');
      nameCell.className = 'fill';

    categoryCell.textContent = item.category;

    const nameDiv = document.createElement('div');
    nameDiv.className = item.cssClass;

    const tooltipSpan = document.createElement('span');
    tooltipSpan.textContent = item.tooltip;
    tooltipSpan.className = 'tooltiptext';

    nameDiv.appendChild(tooltipSpan);


    const nameLink = document.createElement('a');
    nameLink.textContent = item.name;
    nameLink.href = item.link;

    nameLink.title = item.tooltip;
    nameDiv.appendChild(nameLink);

    nameCell.appendChild(nameDiv);

    row.appendChild(categoryCell);
    row.appendChild(nameCell);
    table.appendChild(row);
  });
};

// Button to sort by category
const sortByCategoryButton = document.createElement('button');
sortByCategoryButton.textContent = 'Sort by Category';
sortByCategoryButton.addEventListener('click', () => {
  sortTable('category');
});
document.body.appendChild(sortByCategoryButton);

// Button to sort by cssClass
const sortByCssClassButton = document.createElement('button');
sortByCssClassButton.textContent = 'Sort by cssClass';
sortByCssClassButton.addEventListener('click', () => {
  sortTable('cssClass');
});
document.body.appendChild(sortByCssClassButton);

document.body.appendChild(table);

// Simulate a click on the sortByCategoryButton to sort the table by category by default
sortByCategoryButton.click();