const map = L.map('map').setView([44.0165, 21.0059], 7);

// BASE MAP
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// 🔐 LOGIN (simple lock system)
let isAdmin = false;

const pass = prompt("Unesi ADMIN lozinku (ili OK za gledanje):");

if (pass === "admin123") {
    isAdmin = true;
    alert("ADMIN MODE uključen");
} else {
    alert("GUEST MODE (samo gledanje)");
}

// DRAW LAYER
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// LOAD SAVED DATA
const saved = localStorage.getItem('mapData');
if (saved) {
    const geo = JSON.parse(saved);
    L.geoJSON(geo).eachLayer(layer => drawnItems.addLayer(layer));
}

// DRAW CONTROL (SAMO ADMIN)
if (isAdmin) {
    const drawControl = new L.Control.Draw({
        edit: { featureGroup: drawnItems },
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

    map.on(L.Draw.Event.CREATED, function (e) {
        drawnItems.addLayer(e.layer);
    });
}

// 💾 SAVE
function saveMap() {
    if (!isAdmin) return alert("Nemaš permisiju!");

    const data = drawnItems.toGeoJSON();
    localStorage.setItem('mapData', JSON.stringify(data));
    alert("Sačuvano!");
}

// 📤 EXPORT
function exportMap() {
    const data = drawnItems.toGeoJSON();
    const blob = new Blob([JSON.stringify(data)], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'map.geojson';
    a.click();
}

// 🗑 RESET
function resetMap() {
    if (!isAdmin) return alert("Nemaš permisiju!");

    drawnItems.clearLayers();
    localStorage.removeItem('mapData');
}

// 🗺️ OKRUZI SRBIJE (UVEK SE PRIKAZUJU)
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

            // samo admin može da briše
            layer.on('click', function () {
                if (isAdmin) {
                    map.removeLayer(layer);
                } else {
                    layer.openPopup();
                }
            });
        }
    }).addTo(map);

    map.fitBounds(districts.getBounds());
});
