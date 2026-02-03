document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('speaking-engagements-list-container');
    if (!container) return;

    var jsonPath = 'bio-map-data.json';
    var ul = document.createElement('ul');
    ul.id = 'bio-speaking-engagements-list';

    fetch(jsonPath)
        .then(function(response) { return response.json(); })
        .then(function(data) {
            data.sort(function(a, b) { return parseInt(b.year, 10) - parseInt(a.year, 10); });
            data.forEach(function(entry) {
                if (entry.year && entry.title) {
                    var li = document.createElement('li');
                    li.textContent = entry.year + ' ' + entry.title;
                    ul.appendChild(li);
                }
            });
            container.innerHTML = '';
            container.appendChild(ul);
        })
        .catch(function() {
            ul.innerHTML = '<li>Could not load speaking engagements.</li>';
            container.innerHTML = '';
            container.appendChild(ul);
        });
});
