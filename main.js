document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("searchForm");
    const addressInput = document.getElementById("addressInput");
    const addressDisplay = document.getElementById("addressDisplay");
    const cinemaList = document.getElementById("cinemaList");
    const geolocateButton = document.getElementById("geolocateButton");

    const getGeolocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
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
        
        // Appeler une fonction pour obtenir les coordonnées GPS à partir de l'adresse
        // Utilisez une API similaire à l'API Adresse
        // Ensuite, appelez une fonction pour obtenir la liste des cinémas en fonction des coordonnées
        // Remarque : ceci est une étape complexe et dépend de l'API que vous utilisez
        // Vous devez gérer les erreurs et les détails de l'API réelle ici.
    });
});
