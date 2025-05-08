let filmovi = [];
const kosarica = [];

fetch('filmtv_movies.csv')
    .then(response => response.text())
    .then(csvText => {
        const rezultat = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        filmovi = rezultat.data.map(film => ({
            title: film.title,
            year: Number(film.year),
            genre: film.genre,
            duration: Number(film.duration),
            country: film.country?.split(',').map(c => c.trim()) || [],
            avg_vote: Number(film.avg_vote)
        }));
        displayTable(filmovi);
    })
    .catch(error => console.error('Error loading CSV:', error));

function displayTable(data) {
    const tableBody = document.querySelector('#filmTable tbody');
    tableBody.innerHTML = '';

    data.forEach(film => {
        const row = document.createElement('tr');

        ['title', 'year', 'genre', 'duration', 'country', 'avg_vote'].forEach(key => {
            const cell = document.createElement('td');
            cell.textContent = key === 'country' ? film.country.join(', ') : film[key];
            row.appendChild(cell);
        });

        const addBtn = document.createElement('button');
        addBtn.textContent = "Dodaj";
        addBtn.className = "btn btn-sm btn-primary";
        addBtn.onclick = () => dodajUKosaricu(film);

        const actionCell = document.createElement('td');
        actionCell.appendChild(addBtn);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}

document.getElementById("filter-rating").addEventListener("input", function () {
    document.getElementById("rating-value").textContent = this.value;
});

document.getElementById("primijeni-filtere").addEventListener('click', () => {
    const zanr = document.getElementById("filter-genre").value.trim().toLowerCase();
    const godina = Number(document.getElementById("filter-year").value);
    const država = document.getElementById("filter-country").value.trim().toLowerCase();
    const ocjena = Number(document.getElementById("filter-rating").value);

    let filtrirani = filmovi;

    if (zanr) filtrirani = filtrirani.filter(f => f.genre.toLowerCase().includes(zanr));
    if (godina) filtrirani = filtrirani.filter(f => f.year >= godina);
    if (država) filtrirani = filtrirani.filter(f => f.country.some(c => c.toLowerCase().includes(država)));
    if (ocjena) filtrirani = filtrirani.filter(f => f.avg_vote>= ocjena);

    displayTable(filtrirani);
});

document.getElementById("sort-select").addEventListener('change', function () {
    const kriterij = this.value;
    let sortirani = [...filmovi];

    if (kriterij === "year") sortirani.sort((a, b) => a.year - b.year);
    else if (kriterij === "votes") sortirani.sort((a, b) => b.total_votes - a.total_votes);

    displayTable(sortirani);
});

function dodajUKosaricu(film) {
    if (!kosarica.includes(film)) {
        kosarica.push(film);
        prikaziKosaricu();
    }
}

function prikaziKosaricu() {
    const ul = document.getElementById("kosarica");
    ul.innerHTML = '';
    kosarica.forEach((film, index) => {
        const li = document.createElement('li');
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.textContent = `${film.title} (${film.year})`;

        const btn = document.createElement('button');
        btn.className = "btn btn-sm btn-danger";
        btn.textContent = "Ukloni";
        btn.onclick = () => {
            kosarica.splice(index, 1);
            prikaziKosaricu();
        };

        li.appendChild(btn);
        ul.appendChild(li);
    });
}

document.getElementById("potvrdi-posudbu").addEventListener("click", () => {
    if (kosarica.length > 0) {
        kosarica.length = 0;
        prikaziKosaricu();
        const obavijest = document.getElementById("obavijest");
        obavijest.style.display = "block";
        setTimeout(() => obavijest.style.display = "none", 3000);
    }
});