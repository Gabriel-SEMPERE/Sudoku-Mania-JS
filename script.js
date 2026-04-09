const apiKey = CONFIG.API_KEY;
console.log(apiKey);
async function newGame() {
    const data = await GenerateSudoku("medium");
    afficherGrille(data);
}




async function GenerateSudoku(difficulty) {
    try {
        const apiUrl = `https://api.api-ninjas.com/v1/sudokugenerate?difficulty=${difficulty}&width=3&height=3`;
        console.log(apiUrl)

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const newGenerateSudoku = await response.json();

        console.log("Sudoku genérer", newGenerateSudoku);
        return newGenerateSudoku;

    } catch (error) {
        console.error("Erreur lors de la récupération du Sudoku :");
    }
}


function afficherGrille(data) {
    const container = document.getElementById("sudoku-grid");

    for (let i = 0; i < 9; i++) {  //9 ligne
        const ligne = document.createElement("div");
        ligne.className = "flex";

        for (let j = 0; j < 9; j++) {   // 9 colonnes
            const valeur = data.puzzle[i][j];
            const cellule = document.createElement("div");

            let celluleAspect = "flex-1 aspect-square flex items-center justify-center border border-slate-200 text-[#2c3e6b] font-semibold text-lg";

            if (j % 3 === 2 && j !== 8) classes += " border-r-[3px]"; //bordure droite tout les 3 chiffre
            if (i % 3 === 2 && i !== 8) classes += " border-b-[3px]"; //bordure basse tout les 3 chiffre 

            cellule.className = celluleAspect ;

            if (valeur === null) {

            } else {
                cellule.textContent = valeur;
            }

            ligne.appendChild(cellule);
        }

        container.appendChild(ligne);
    }
}


newGame()