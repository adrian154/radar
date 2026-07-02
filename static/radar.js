
const digestItems = (items) => {
    for(const item of items) {

    }
};

// fetch items
fetch("/items")
    .then(resp => {
        if(!resp.ok) {
            console.error("HTTP error " + resp.status);
        } else {
            return resp.json();
        }
    })
    .then(digestItems)
    .catch(console.error);

// keep big date updated
const updateDate = () => {
    document.getElementById("date").textContent = new Date().toLocaleDateString([], {weekday: "long", year: "numeric", day: "numeric", month: "long"});
};

updateDate();
setInterval(updateDate, 1000);