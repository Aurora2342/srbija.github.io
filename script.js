// MAPA
const map = L.map('map').setView([44.0165, 21.0059], 7);

// TILE LAYER
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// DRAW LAYER
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// LOAD SAVED MAP
const saved = localStorage.getItem('mapData');
if (saved) {
    const geo = JSON.parse(saved);
    L.geoJSON(geo).eachLayer(layer => drawnItems.addLayer(layer));
}

// DRAW CONTROL
const drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polygon: true,
        polyline: true,
        rectangle: true,
        circle: false,
        marker: true,
        circlemarker: false
    }
});
map.addControl(drawControl);

// CREATE NEW SHAPE
map.on(L.Draw.Event.CREATED, function (e) {
    drawnItems.addLayer(e.layer);
});

// SAVE
function saveMap() {
    const data = drawnItems.toGeoJSON();
    localStorage.setItem('mapData', JSON.stringify(data));
    alert("Sačuvano!");
}

// EXPORT
function exportMap() {
    const data = drawnItems.toGeoJSON();
    const blob = new Blob([JSON.stringify(data)], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'map.geojson';
    a.click();
}

// RESET
function resetMap() {
    drawnItems.clearLayers();
    localStorage.removeItem('mapData');
}

// OKRUZI SRBIJE
fetch('https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/serbia-districts.geojson')
.then(res => res.json())
.then(data => {

    const districts = L.geoJSON(data, {
        style: {
            color: "#0066ff",
            weight: 2,
            fillColor: "#3399ff",
            fillOpacity: 0.25
        },

        onEachFeature: function(feature, layer) {
            layer.bindPopup(feature.properties.name);

            // klik = sakrij okrug
            layer.on('click', function () {
                map.removeLayer(layer);
            });
        }
    }).addTo(map);

    map.fitBounds(districts.getBounds());
});