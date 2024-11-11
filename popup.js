document.addEventListener('DOMContentLoaded', function () {
  const dateInput = document.getElementById('date');
  const today = new Date();
  
  // Format the date to YYYY-MM-DD in local time
  const localDate = today.getFullYear() + '-' +
                    (today.getMonth() + 1).toString().padStart(2, '0') + '-' +
                    today.getDate().toString().padStart(2, '0');

  dateInput.value = localDate;

  fetchShows(localDate);

  document.getElementById('searchButton').addEventListener('click', function () {
    const date = document.getElementById('date').value;
    if (date) {
      fetchShows(date);
    }
  });
});

function fetchShows(date) {
  const url = `https://api.tvmaze.com/schedule?country=US&date=${date}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '';

      if (data.length === 0) {
        resultsDiv.innerHTML = '<p>No shows found for this date.</p>';
        return;
      }

      const allowedNetworks = ["ABC", "NBC", "CBS", "FOX", "The CW", "MSNBC", "CNN", "Food Network"];
      const primetimeShows = data.filter(show => {
        const airtime = show.airtime;
        const [hour, minute] = airtime.split(':').map(Number);
        return hour >= 20 && hour < 23 && show.show.network && allowedNetworks.includes(show.show.network.name);
      });

      if (primetimeShows.length === 0) {
        resultsDiv.innerHTML = '<p>No primetime shows found for this date.</p>';
        return;
      }

      const table = document.createElement('table');
      table.innerHTML = `
        <thead>
          <tr>
            <th>Show Name</th>
            <th>Episode Name</th>
            <th>Air Time</th>
            <th>Network</th>
            <th>Streaming Service</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      `;

      const streamingServices = {
        "ABC": "Hulu",
        "NBC": "Peacock",
        "CBS": "Paramount+",
        "FOX": "Hulu",
        "The CW": "Netflix",
        "MSNBC": "Peacock",
        "CNN": "CNN App",
        "Food Network": "Discovery+"
      };

      const tbody = table.querySelector('tbody');
      primetimeShows.forEach(show => {
        const row = document.createElement('tr');
        let logoUrl = 'N/A';

        if (show.show.network) {
          const networkName = encodeURIComponent(show.show.network.name);
          logoUrl = `https://logo.clearbit.com/${networkName}.com`;
        }

        const [hour, minute] = show.airtime.split(':').map(Number);
        let standardTime = 'N/A';
        if (!isNaN(hour) && !isNaN(minute)) {
          const period = hour >= 12 ? 'PM' : 'AM';
          const standardHour = hour % 12 === 0 ? 12 : hour % 12;
          standardTime = `${standardHour}:${minute.toString().padStart(2, '0')} ${period}`;
        }

        let streamingInfo = 'N/A';
        if (show.show.network && streamingServices[show.show.network.name]) {
          streamingInfo = streamingServices[show.show.network.name];
        }

        const imdbUrl = show.show.externals && show.show.externals.imdb ? `https://www.imdb.com/title/${show.show.externals.imdb}` : '#';
        const showLink = `<a href="${imdbUrl}" target="_blank" style="color: white;">${show.show.name}</a>`;

        row.innerHTML = `
          <td>${showLink}</td>
          <td>${show.name}</td>
          <td>${standardTime}</td>
          <td>${logoUrl !== 'N/A' ? `<img src="${logoUrl}" alt="${show.show.network.name} Logo" width="20" onerror="this.style.display='none';">` : 'N/A'}
          ${show.show.network ? show.show.network.name : 'N/A'}</td>
          <td>${streamingInfo}</td>
        `;
        tbody.appendChild(row);
      });

      resultsDiv.appendChild(table);
    })
    .catch(error => {
      console.error('Error fetching shows:', error);
      document.getElementById('results').innerHTML = '<p>Error fetching shows. Please try again later.</p>';
    });
}
