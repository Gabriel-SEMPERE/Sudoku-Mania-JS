require('dotenv').config();
const apiKey = process.env.API_KEY;

function newGame(){
    GenerateSudoku(medium);

}



console.log(apiUrl)
async function GenerateSudoku(difficulty) {
    try {
        const apiUrl = `https://api.api-ninjas.com/v1/sudokugenerate?difficulty=${difficulty}&width=3&height=3`;

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

