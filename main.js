document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("searchForm");
    const addressInput = document.getElementById("addressInput");
    const addressDisplay = document.getElementById("addressDisplay");
    const cinemaList = document.getElementById("cinemaList");
    const geolocateButton = document.getElementById("geolocateButton");
    let latitude;
    let longitude;
    let map;

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance.toFixed(2);
    }

    const getGeolocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                const coordinates = `${latitude}, ${longitude}`;
                addressInput.value = coordinates;
                getAddressFromCoordinates(longitude, latitude);
            });
        } else {
            addressDisplay.textContent = "La géolocalisation n'est pas prise en charge par votre navigateur.";
        }
    };

    const getAddressFromCoordinates = (longitude, latitude) => {
        const apiUrl = `https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`;
        
        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                const address = data.features[0].properties.label;
                addressInput.value = address;
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération de l'adresse :", error);
            });
    };

    geolocateButton.addEventListener("click", getGeolocation);
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const radius = 10;
        const coordinates = `POINT(${longitude}%20${latitude})`;

        const cineUrl = `https://data.culture.gouv.fr/api/explore/v2.1/catalog/datasets/etablissements-cinematographiques/records?where=within_distance(geolocalisation%2C%20geom'${coordinates}'%2C%20${radius}km)&limit=20`;

        fetch(cineUrl)
        .then((response) => response.json())
        .then((data) => {
            cinemaList.innerHTML = "";
            data.results.sort((cinemaA, cinemaB) => {
                const distanceA = calculateDistance(latitude, longitude, cinemaA.latitude, cinemaA.longitude);
                const distanceB = calculateDistance(latitude, longitude, cinemaB.latitude, cinemaB.longitude);
                return distanceA - distanceB;
            });
            data.results.forEach((cinema) => {
                const cinemaName = cinema.nom;
                const cinemaAddress = cinema.adresse;
                const cinemaCity = cinema.commune;
                const distance = calculateDistance(latitude, longitude, cinema.latitude, cinema.longitude);
                const cinemaElement = document.createElement("div");
                cinemaElement.textContent = `Nom : ${cinemaName}, Adresse : ${cinemaAddress}, Ville : ${cinemaCity}, Distance : ${distance} km`;
                cinemaList.appendChild(cinemaElement);
            });

            map = L.map('map').setView([latitude, longitude], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);

            data.results.forEach((cinema) => {
                const cinemaName = cinema.nom;
                const cinemaAddress = cinema.adresse;
                const cinemaCity = cinema.commune;
                const distance = calculateDistance(latitude, longitude, cinema.latitude, cinema.longitude);
                L.marker([cinema.latitude, cinema.longitude])
                    .addTo(map)
                    .bindPopup(`Nom : ${cinemaName}<br>Adresse : ${cinemaAddress}<br>Ville : ${cinemaCity}<br>Distance : ${distance} km`);
            });
        })
        .catch((error) => {
            console.error("Erreur lors de la récupération des cinémas :", error);
        });
    });
});
