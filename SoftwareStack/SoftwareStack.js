
const data = [
  //['Category', 'Tool', 'Phase Start','Phase End', 'Description', 'https://www.google.com','ease of use'],
  ['Viz', 'Enscape', 'IN','CD', 'description text', 'http://clarknexsen/_layouts/15/media/proxy.ashx?id=ad1ce026-4b1f-4d28-b995-3bd593627f49&size=250w250h_fxd','0','App','Revit,Rhino'],
  ['Viz', 'Lumion', 'SD','CD', 'more description text', 'https://www.google.com','1','App','Revit,Rhino'],
  ['Viz', 'Twinmotion', 'IN','CD', 'more description text', 'https://www.google.com','1','App','All 3d modeling tools'],
  ['Carbon', 'Tally Cat', 'IN','DD', 'yet again description text', 'https://www.google.com','1','App','Revit'],
  ['Carbon', 'Kaleidoscope', 'SD','DD', 'yo description text', 'https://www.clarknexsen.com','0','Web','n/a'],
  ['Carbon', 'Tally', 'SD','CD', 'yo description text', 'https://www.clarknexsen.com','2','App','Revit'],
  ['Carbon', 'EC3', 'SD','CD', 'yo description text', 'https://www.clarknexsen.com','0','Web','n/a'],
  ['Carbon', 'Building Transparency', 'DD','CD', 'yo description text', 'https://www.clarknexsen.com','2','Web','n/a'],
  ['Energy', 'Energy +', 'DD','CD', 'yet again description text', 'https://www.google.com','2','App','standalone'],
  ['Energy', 'Climate Studio', 'IN','DD', 'amazing', 'https://www.google.com','2','App','Rhino,Grasshopper'],
  ['Energy', 'Diva', 'IN','SD', 'yup', 'https://www.google.com','2','App','Grasshopper'],
  ['Viz', 'Vray', 'CD','CD', 'more description text that is much longer so we can see how it ends up being displayed. now im just rambeling to make it longer.', 'https://www.vray.com','2','App','Revit, Rhino, ']
];


/* testing list
const data = [
['1','2','1','5'],
['1','2','1','3'],
['1','2','1','3'],
['1','2','1','1'],
['1','2','1','1']
];
*/

const timecolor = [
  ['0','#41B3A3'],
  ['1','#E8A87C'],
  ['2','#E27D60']
];

//not used anymore
/*const padding = [
  ['IN-CD','0%','100%'],
  ['SD-CD','25%','50%'],
  ['DD-DD','50%','25%'],
  ['DD-CD','25%','75%']
];*/


const leftspace = [
  ['IN','0'],
  ['SD','25'],
  ['DD','50'],
  ['CD','75']
];


const rightspace = [
  ['IN','25'],
  ['SD','50'],
  ['DD','75'],
  ['CD','97']
];


//this part of the script is manupulating the list and adding to it----------------------------------

//appends the color in the data table with data from the timecolor table
for (let i = 0; i < data.length; i++) {
  const item = data[i];
  for (let j = 0; j < timecolor.length; j++) {
    if (timecolor[j][0] === item[6]) {
      item.push(timecolor[j][1]);
    }
  }
};



//appends the the data table with data from the leftspace table
for (let i = 0; i < data.length; i++) {
  const item = data[i];
  for (let j = 0; j < leftspace.length; j++) {
    if (leftspace[j][0] === item[2]) {
      item.push(leftspace[j][1]);
    }
  }
};



//appends the the data table with data from the rightspace table
for (let i = 0; i < data.length; i++) {
  const item = data[i];
  for (let j = 0; j < rightspace.length; j++) {
    if (rightspace[j][0] === item[3]) {
      item.push(rightspace[j][1]);
    }
  }
};



for (let i = 0; i < data.length; i++) {
  let subarray = data[i];
  let result = subarray[11] - subarray[10];
  subarray.push(result);
};







console.log(data);


//this part of the script parses the final data ----------------------------------


const parsedData = data.map(item => {
  return {
    category: item[0],
    name: item[1],
    cssClass: item[2],
    cssClass: item[3],
    tooltip: item[4],
    link: item[5],
    apptype: item[7],
    apps: item[8],
    color: item[9],
    left: item[10],
    right: item[11],
    width: item[12]
  };
});

//maps the timenumber to the timecolor data and returns it as 'color'
//const timecolorMap = {};
//
  //  for (const [time, color] of timecolor) {
  //    timecolorMap[time] = color;
   // }

    //for (const item of data) {
      //const time = item[5];
      //const color = timecolorMap[time];
    //}







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
  categoryHeader.textContent = '    ';
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
    //nameDiv.className = item.name;
    nameDiv.style.backgroundColor = item.color;
    nameDiv.style.left = item.left + '%';
    nameDiv.style.width = item.width + '%';
    nameDiv.style.position = 'relative';
    nameDiv.style.color = 'white';
    nameDiv.style.padding = '15px';
    nameDiv.style.borderRadius = '25px';

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

    const infoDiv = document.createElement('div');
    infoDiv.textContent = item.apptype +' - ' + item.apps;
    infoDiv.className = 'info';
    nameDiv.appendChild(infoDiv);


    table.appendChild(row);
  });
};








// Button to sort by category
const sortByCategoryButton = document.createElement('button');
sortByCategoryButton.className = 'button';
sortByCategoryButton.textContent = 'Sort by Category';
sortByCategoryButton.addEventListener('click', () => {
  sortTable('category','left');
});
document.body.appendChild(sortByCategoryButton);

// Button to sort by cssClass
const sortByCssClassButton = document.createElement('button');
sortByCssClassButton.className = 'button';
sortByCssClassButton.textContent = 'Sort by Phase';
sortByCssClassButton.addEventListener('click', () => {
  sortTable('left','category');
});
document.body.appendChild(sortByCssClassButton);

document.body.appendChild(table);


// Simulate a click on the sortByCategoryButton to sort the table by category by default
sortByCssClassButton.click();
sortByCategoryButton.click();