let language = localStorage.getItem('language');

let currentCity = '';
let countyCalculationType = 'total';
let timeCalculationType = 'normal';
let tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}),
  latlng = L.latLng(30, 0);

let tiles2 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}),
  latlng2 = L.latLng(47.19801, 19.3);

let tiles3 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}),
  latlng3 = L.latLng(47.19801, 19.3);

let map = L.map('map', { center: latlng, zoom: 3, layers: [tiles] });
let hun = L.map('hun', { center: latlng2, zoom: 7, layers: [tiles2] });
let county = L.map('county', { center: latlng3, zoom: 7, layers: [tiles3] });
let hunLayer;
let countyLayer;
let currentYear = "2026";
let colorScheme = 'normal';
let foreignCityVoters = [];

let MEGYE_MAX = {};
let MEGYE_LAKOSOK_FIX = {};

function hideHelp() {
  document.getElementById("help").style.display = "none";
}

function calculateCountyData() {
  for (let year in MEGYE_LAKOSOK) {
    let max = 0;
    let maxD = 0;
    for (let county in MEGYE_LAKOSOK[year]) {
      if (county == 0) continue;
      let count = 0;
      for (let oevks in MEGYE_LAKOSOK[year][county]) {
        if (MEGYE_LAKOSOK[year][county][oevks]) {
          if (Math.abs(MEGYE_LAKOSOK[year][county][oevks]) > maxD) {
            maxD = Math.abs(MEGYE_LAKOSOK[year][county][oevks]);
          }
          count += +MEGYE_LAKOSOK[year][county][oevks];
        }
      }
      MEGYE_LAKOSOK[year][county][0] = count;
      if (Math.abs(count) > max) max = Math.abs(count);
    }
    MEGYE_LAKOSOK[year][0] = max;

    MEGYE_LAKOSOK_FIX[year] = [];

    for (let county in MEGYE_LAKOSOK[year]) {
      if (county == 0) continue;
      MEGYE_LAKOSOK_FIX[year][county] = []
      MEGYE_LAKOSOK_FIX[year][county][0] = max / MEGYE_LAKOSOK[year][county][0];

      for (let oevk in MEGYE_LAKOSOK[year][county]) {
        if (oevk == 0) continue;
        MEGYE_LAKOSOK_FIX[year][county][oevk] = maxD / MEGYE_LAKOSOK[year][county][oevk];
      }
    }
  }
}

function loadMarkers() {
  LOCATIONS.forEach(function (point) {
    let loc = point.location;
    let marker = L.marker(L.latLng(loc.lat, loc.lng), { title: point.hu + "\n" + point.en });
    marker.on('click', function () {
      currentCity = point.city;
      loadKor(point.city);
    });
    marker.addTo(map)
  });
}

function getColor(percentage) {
  if (percentage > 1)
    percentage = 1;
  if (percentage < -1)
    percentage = -1;

  if (colorScheme == 'normal') {
    if (percentage == 0) {
      return { color: '#000', fillColor: 'hsl(180,100%,50%)', opacity: 0.25, fillOpacity: 0.25, weight: 1 };
    } else if (percentage > 0) {
      let value = 60 - Math.round(percentage * 60);
      let color = 'hsl(' + value + ',100%,50%)';
      return { color: '#000', fillColor: color, opacity: 0.25, fillOpacity: 0.75, weight: 1 };
    } else {
      let value = 180 - Math.round(percentage * 60);
      let color = 'hsl(' + value + ',100%,50%)';
      return { color: '#000', fillColor: color, opacity: 0.25, fillOpacity: 0.75, weight: 1 };
    }
  } else {
    if (percentage == 0) {
      return { color: '#000', fillColor: 'hsl(0,0%,50%)', opacity: 0.25, fillOpacity: 0.25, weight: 1 };
    } else if (percentage > 0) {
      let value = 50 - Math.round(percentage * 50);
      let color = 'hsl(0,0%,' + value + '%)';
      return { color: '#000', fillColor: color, opacity: 0.25, fillOpacity: 0.75, weight: 1 };
    } else {
      let value = 50 - Math.round(percentage * 50);
      let color = 'hsl(0,0%,' + value + '%)';
      return { color: '#000', fillColor: color, opacity: 0.25, fillOpacity: 0.75, weight: 1 };
    }
  }
}

function handler(type, foreign_city) {
  let max = 0;
  let count = 0;
  let countCounty = {};

  let timeDiff = false;
  if (timeCalculationType == 'diff' && currentYear.split("-").length == 2) {
    timeDiff = true;
  }

  REGISZTRALTAK[currentYear].forEach(function (r) {
    let r_county = r[0];
    let r_code = r[1];
    let r_city = r[2];
    let r_count = r[3];

    if (timeDiff) {
      r_count = r[4];
    }

    if (countyCalculationType == 'avg') {
      r_count *= MEGYE_LAKOSOK_FIX[currentYear][r_county][r_code];
    }

    if (r_city == foreign_city) {
      if (Math.abs(r_count) > max) {
        max = Math.abs(r_count);
      }
      count += r_count;
      countCounty[r_county] = countCounty[r_county] || 0;
      countCounty[r_county] += r_count;
    }
  });

  if (countyCalculationType == 'avg') {
    for (let l in countCounty) {
      countCounty[l] = countCounty[l] * MEGYE_LAKOSOK_FIX[currentYear][l][0];
    }
  }

  let maxCounty = Math.max(Math.max(...Object.values(countCounty)), -Math.min(...Object.values(countCounty)));

  return function (feature, layer) {
    for (let i = 0; i < REGISZTRALTAK[currentYear].length; i++) {
      let r = REGISZTRALTAK[currentYear][i];

      let r_county = r[0];
      let r_code = r[1];
      let r_city = r[2];
      let r_count = r[3];

      if (timeDiff)
        r_count = r[4];

      if (countyCalculationType == 'avg') {
        r_count *= MEGYE_LAKOSOK_FIX[currentYear][r_county][r_code];
      }

      if (r_city == foreign_city) {
        if (r_county == +feature.properties.MEGY_KOD && r_code == +feature.properties.OEVK_STR) {
          percentage = (r_count * 1.0 / max);
          if (type == 'color') {
            return getColor(percentage);
          };
          if (type == 'click') {
            if (countyCalculationType == 'avg') {
              layer.bindPopup('<b>' + feature.properties.OEVK_NAME +
                '</b><br/>' + (percentage * 100).toFixed(3) + '%');
            } else {
              layer.bindPopup('<b>' + feature.properties.OEVK_NAME +
                '</b><br/>' + (language == 'en' ? 'Voters: ' : 'Szavazók: ') + r_count + ' (' + Math.abs((r_count / count) * 100).toFixed(3) + '%)');
            }
            return;
          }
        }
        if (r_county == +feature.properties.MEGY_KOD && feature.properties.OEVK_ID == null) {
          percentage = (countCounty[r_county] * 1.0 / maxCounty);
          if (type == 'color') {
            return getColor(percentage);
          }
          if (type == 'click') {
            if (countyCalculationType == 'avg') {
              layer.bindPopup('<b>' + feature.properties.MEGY_NEV +
                '</b><br/>' + (percentage * 100).toFixed(3) + '%');
            } else {
              layer.bindPopup('<b>' + feature.properties.MEGY_NEV +
                '</b><br/>' + (language == 'en' ? 'Voters: ' : 'Szavazók: ') + countCounty[r_county] + ' (' + Math.abs((countCounty[r_county] / count) * 100).toFixed(3) + '%)');
            }
            return;
          }
        }
      }
    }
    if (type == 'click') {
      if (countyCalculationType == 'avg') {
        layer.bindPopup('<b>' + (feature.properties.OEVK_ID == null ? feature.properties.MEGY_NEV : feature.properties.OEVK_NAME) +
          '</b><br/>0%');
      } else {
        layer.bindPopup('<b>' + (feature.properties.OEVK_ID == null ? feature.properties.MEGY_NEV : feature.properties.OEVK_NAME) +
          '</b><br/>' + (language == 'en' ? 'Voters: ' : 'Szavazók: ') + '0 (0%)');
      }
    }
    return getColor(0);
  }
}

function loadKor(foreign_city) {
  if (hunLayer) {
    hun.removeLayer(hunLayer);
  }
  hunLayer = L.geoJSON(currentYear.includes("2026") ? SZAVAZOKOR26 : SZAVAZOKOR, { style: handler('color', foreign_city), onEachFeature: handler('click', foreign_city) });
  hunLayer.addTo(hun);

  if (countyLayer) {
    county.removeLayer(countyLayer);
  }
  countyLayer = L.geoJSON(MEGYE, { style: handler('color', foreign_city), onEachFeature: handler('click', foreign_city) });
  countyLayer.addTo(county);


  if (foreign_city == '') {
    document.getElementById('data').innerHTML = language == 'en' ? 'Global emigration map' : 'Nemzetközi emigrációs térkép';
  } else {
    document.getElementById('data').innerHTML = (language == 'en' ? 'Selected city: ' : 'Kiválasztott város: ') + foreign_city;
  }

  let timeDiff = false;
  if (timeCalculationType == 'diff' && currentYear.split("-").length == 2) {
    timeDiff = true;
  }

  let count = 0;
  for (let i = 0; i < REGISZTRALTAK[currentYear].length; i++) {
    let r = REGISZTRALTAK[currentYear][i];
    let r_city = r[2];
    let r_count = r[3];

    if (timeDiff)
      r_count = r[4];

    if (r_city == foreign_city) {
      count += r_count;
    }
  }
  document.getElementById('data').innerHTML += '<br>' + (language == 'en' ? 'Total voters: ' : 'Összes szavazó: ') + Math.round(count * 100) / 100;

}

function fillNationalData() {
  for (let year in REGISZTRALTAK) {
    let result = {};
    for (let i = 0; i < REGISZTRALTAK[year].length; i++) {
      let r = REGISZTRALTAK[year][i];

      let r_county = r[0];
      let r_code = r[1];
      let r_count = r[3];

      result[r_county] = result[r_county] || {};
      result[r_county][r_code] = result[r_county][r_code] || [r_county, r_code, '', 0];
      result[r_county][r_code][3] += r_count;
    }

    for (let m in result) {
      for (let n in result[m]) {
        REGISZTRALTAK[year].push(result[m][n]);
      }
    }
  }
}

function fillYearDiffStats() {
  const allYears = ["2018", "2022", "2026"];

  for (let fromYear of allYears) {
    foreignCityVoters[fromYear] = {}
    for (let i = 0; i < REGISZTRALTAK[fromYear].length; i++) {
      let r = REGISZTRALTAK[fromYear][i];
      let r_city = r[2];
      let r_count = r[3];

      foreignCityVoters[fromYear][r_city] = foreignCityVoters[fromYear][r_city] || 0;
      foreignCityVoters[fromYear][r_city] += r_count;
    }
  }

  for (let fromYear of allYears) {
    for (let toYear of allYears) {
      if (fromYear >= toYear) continue;
      let year = fromYear + "-" + toYear;

      let result = {};
      for (let i = 0; i < REGISZTRALTAK[fromYear].length; i++) {
        let r = REGISZTRALTAK[fromYear][i];

        let r_county = r[0];
        let r_code = r[1];
        let r_city = r[2];
        let r_count = r[3];

        result[r_county] = result[r_county] || {};
        result[r_county][r_code] = result[r_county][r_code] || {};
        result[r_county][r_code][r_city] = [r_county, r_code, r_city, -r_count, -Math.round(r_count * (foreignCityVoters[toYear][''] / foreignCityVoters[fromYear]['']) * 100) / 100];
      }

      for (let i = 0; i < REGISZTRALTAK[toYear].length; i++) {
        let r = REGISZTRALTAK[toYear][i];

        let r_county = r[0];
        let r_code = r[1];
        let r_city = r[2];
        let r_count = r[3];

        result[r_county] = result[r_county] || {};
        result[r_county][r_code] = result[r_county][r_code] || {};
        if (!result[r_county][r_code][r_city]) {
          result[r_county][r_code][r_city] = [r_county, r_code, r_city, 0, Math.round(r_count * (foreignCityVoters[fromYear][''] / foreignCityVoters[toYear]['']) * 100) / 100];
        }

        result[r_county][r_code][r_city][3] += r_count;
        result[r_county][r_code][r_city][4] += r_count;
      }

      REGISZTRALTAK[year] = [];

      for (let m in result) {
        for (let n in result[m]) {
          for (let o in result[m][n]) {
            REGISZTRALTAK[year].push(result[m][n][o]);
          }
        }
      }

      MEGYE_LAKOSOK[year] = []

      for (let megyeYear of [fromYear, toYear]) {
        for (let county in MEGYE_LAKOSOK[megyeYear]) {
          if (county == 0) continue;
          for (let oevks in MEGYE_LAKOSOK[megyeYear][county]) {
            if (MEGYE_LAKOSOK[megyeYear][county][oevks]) {
              MEGYE_LAKOSOK[year][county] = MEGYE_LAKOSOK[year][county] || [];
              MEGYE_LAKOSOK[year][county][oevks] = Math.max(MEGYE_LAKOSOK[year][county][oevks] || 0, MEGYE_LAKOSOK[megyeYear][county][oevks]);
            }
          }
        }
      }
    }
  }
}

function swapColors() {
  colorScheme = colorScheme == 'normal' ? 'grayscale' : 'normal';
  loadKor(currentCity);
}

fillNationalData();
fillYearDiffStats();
calculateCountyData();
loadMarkers();

const allYears = ["2018", "2022", "2026", "2018-2026", "2018-2022", "2022-2026"];

for (let year of allYears) {
  document.getElementById('year_' + year).onclick = function () {
    currentYear = year;
    loadKor(currentCity);
    for (let year2 of allYears) {
      document.getElementById('year_' + year2).classList.remove("selected");
    }
    document.getElementById('year_' + year).classList.add("selected");
  };
}

document.getElementById('data').onclick = function () {
  currentCity = '';
  loadKor(currentCity);
};

document.getElementById('time_type').onclick = function () {
  timeCalculationType = (timeCalculationType == 'diff') ? 'normal' : 'diff';
  document.getElementById('time_type').innerHTML = timeCalculationType == 'normal' ? (language == 'en' ? 'Normal' : 'Normál') : (language == 'en' ? 'Time-Proportional' : 'Időarányos');
  loadKor(currentCity);
};

document.getElementById('type').onclick = function () {
  countyCalculationType = (countyCalculationType == 'total') ? 'avg' : 'total';
  document.getElementById('type').innerHTML = countyCalculationType == 'total' ? (language == 'en' ? 'Linear' : 'Egyéni') : (language == 'en' ? 'Proportional' : 'Lakosságarányos');
  loadKor(currentCity);
};


document.getElementById('data').onclick();
