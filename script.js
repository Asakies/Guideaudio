let pois = [];

// Charger les points d'intérêt depuis le JSON
fetch("pois.json")
    .then(response => response.json())
    .then(data => {
        pois = data;
        startGPS();
    })
    .catch(error => {
        console.error("Erreur de chargement du JSON:", error);
        document.getElementById("status").textContent = "Erreur chargement POIs.";
    });

function startGPS() {
    navigator.geolocation.watchPosition(position => {
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;

        document.getElementById("lat").textContent = lat.toFixed(6);
        document.getElementById("lng").textContent = lng.toFixed(6);

        let closestPOI = findClosestPOI(lat, lng);
        if (closestPOI) {
            document.getElementById("status").textContent = `Proche de : ${closestPOI.name}`;
            playAudio(closestPOI.audio);
        } else {
            document.getElementById("status").textContent = "Aucun POI à proximité.";
            stopAudio();
        }
    }, error => {
        document.getElementById("status").textContent = "Erreur GPS: " + error.message;
    }, { enableHighAccuracy: true });
}

// Trouver le POI le plus proche
function findClosestPOI(lat, lng) {
    for (let poi of pois) {
        let distance = getDistance(lat, lng, poi.lat, poi.lng);
        if (distance < 50) { // Déclenche à moins de 50m
            return poi;
        }
    }
    return null;
}

// Jouer un audio
let currentAudio = null;
function playAudio(src) {
    if (currentAudio && currentAudio.src.includes(src)) return;

    stopAudio();
    currentAudio = new Audio(src);
    currentAudio.play().catch(err => console.error("Erreur lecture audio:", err));
}

// Arrêter l'audio
function stopAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

// Calculer la distance entre deux points GPS
function getDistance(lat1, lon1, lat2, lon2) {
    let R = 6371e3; // Rayon de la Terre en mètres
    let φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
    let Δφ = (lat2 - lat1) * Math.PI / 180;
    let Δλ = (lon2 - lon1) * Math.PI / 180;

    let a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
}
