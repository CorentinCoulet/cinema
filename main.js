document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("searchForm");
    const addressInput = document.getElementById("addressInput");
    const addressDisplay = document.getElementById("addressDisplay");
    const cinemaList = document.getElementById("cinemaList");
    const geolocateButton = document.getElementById("geolocateButton");
    let latitude;
    let longitude;


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

    const cineUrl = `/api/explore/v2.1/catalog/datasets/etablissements-cinematographiques/records?where=within_distance(geolocalisation%2C%20geom'${coordinates}'%2C%20${radius}km)&limit=20`;

    fetch(cineUrl)
    .then((response) => response.json())
    .then((data) => {
        cinemaList.innerHTML = "";
        data.records.forEach((cinema) => {
            const cinemaName = cinema.results.nom;
            const cinemaAddress = cinema.results.adresse;
            const cinemaCity = cinema.results.commune;
            const cinemaElement = document.createElement("div");
            cinemaElement.textContent = `Nom : ${cinemaName}, Adresse : ${cinemaAddress}, Ville : ${cinemaCity}`;
            cinemaList.appendChild(cinemaElement);
    });
  })
  .catch((error) => {
    console.error("Erreur lors de la récupération des cinémas :", error);
  });
    });
});
