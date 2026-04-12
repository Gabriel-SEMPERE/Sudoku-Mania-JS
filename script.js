let celluleSelectionnee = null;
let donneesJeu = null;
let tempsEcoule = 0;
let intervalleChrono = null;

document.addEventListener("DOMContentLoaded", () => {
    const selectDiff = document.getElementById("difficulte");
    const diffStockee = localStorage.getItem("sudokuDiff");
    if (diffStockee) selectDiff.value = diffStockee;
    selectDiff.onchange = () => localStorage.setItem("sudokuDiff", selectDiff.value);

    const sauvegarde = localStorage.getItem("sudokuSave");
    if (sauvegarde) {
        const data = JSON.parse(sauvegarde);
        donneesJeu = { puzzle: data.puzzle, solution: data.solution };
        tempsEcoule = data.tempsEcoule || 0;
        afficherGrille(data.puzzle, data.grilleJoueur);
        demarrerChrono();
    } else nouvellePartie();
});

function afficherPopup(message, confirmation = false, action = null) {
    const fond = document.createElement("div");
    fond.className = "fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200";
    const modale = document.createElement("div");
    modale.className = "bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-slate-100";
    const contenu = document.createElement("div");
    contenu.className = "text-slate-800 text-lg font-bold mb-8";
    contenu.innerHTML = message;
    const zoneBoutons = document.createElement("div");
    zoneBoutons.className = "flex flex-col gap-2";
    const btnOk = document.createElement("button");
    btnOk.className = "w-full bg-[#6992f0] text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all";
    btnOk.textContent = confirmation ? "Confirmer" : "Continuer";
    btnOk.onclick = () => { document.body.removeChild(fond); if (action) action(); };
    if (confirmation) {
        const btnNon = document.createElement("button");
        btnNon.className = "w-full bg-slate-100 text-slate-500 py-3 rounded-xl font-bold hover:bg-slate-200";
        btnNon.textContent = "Annuler";
        btnNon.onclick = () => document.body.removeChild(fond);
        zoneBoutons.appendChild(btnNon);
    }
    zoneBoutons.prepend(btnOk);
    modale.append(contenu, zoneBoutons);
    fond.appendChild(modale);
    document.body.appendChild(fond);
}

function enregistrerScore(temps, diff) {
    let scores = JSON.parse(localStorage.getItem("sudokuScores")) || {};
    if (!scores[diff]) scores[diff] = [];
    scores[diff].push({ temps, date: new Date().toLocaleDateString() });
    scores[diff].sort((a, b) => a.temps - b.temps);
    scores[diff] = scores[diff].slice(0, 5);
    localStorage.setItem("sudokuScores", JSON.stringify(scores));
}

function voirScores() {
    let scores = JSON.parse(localStorage.getItem("sudokuScores")) || {};
    const labels = { easy: "Facile", medium: "Moyen", hard: "Difficile" };
    let html = `<h2 class="text-2xl font-black mb-6 text-slate-800">CLASSEMENT</h2>`;
    for (let k in labels) {
        html += `<div class="mb-5 text-left bg-slate-50 p-4 rounded-2xl"><h3 class="font-black text-[#6992f0] text-xs uppercase tracking-widest mb-3">${labels[k]}</h3>`;
        if (scores[k] && scores[k].length > 0) {
            scores[k].forEach((s, i) => {
                html += `<div class="flex justify-between text-sm mb-1"><span>#${i + 1} - <b>${formaterTemps(s.temps)}</b></span><span class="text-slate-400 text-xs">${s.date}</span></div>`;
            });
        } else html += `<p class="text-xs text-slate-400 italic text-center">Aucun record</p>`;
        html += `</div>`;
    }
    afficherPopup(html);
}

function genererGrilleComplete() {
    let g = Array.from({ length: 9 }, () => Array(9).fill(null));
    for (let i = 0; i < 9; i += 3) {
        let n = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        let p = 0;
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g[i + r][i + c] = n[p++];
    }
    resoudreAlgo(g);
    return g;
}

function nouvellePartie() {
    const diff = document.getElementById("difficulte").value;
    let complete = genererGrilleComplete();
    let puzzle = JSON.parse(JSON.stringify(complete));
    let vides = diff === "easy" ? 35 : diff === "medium" ? 45 : 55;
    while (vides > 0) {
        let r = Math.floor(Math.random() * 9), c = Math.floor(Math.random() * 9);
        if (puzzle[r][c] !== null) { puzzle[r][c] = null; vides--; }
    }
    donneesJeu = { puzzle, solution: complete };
    tempsEcoule = 0;
    afficherGrille(puzzle);
    demarrerChrono();
    sauvegarder();
}

function sauvegarder() {
    if (!donneesJeu) return;
    let joueur = [];
    const cells = document.querySelectorAll("#sudoku-grid div[data-row]");
    let idx = 0;
    for (let i = 0; i < 9; i++) {
        let l = [];
        for (let j = 0; j < 9; j++) {
            let v = cells[idx++].textContent;
            l.push(v === "" ? null : parseInt(v));
        }
        joueur.push(l);
    }
    localStorage.setItem("sudokuSave", JSON.stringify({ puzzle: donneesJeu.puzzle, solution: donneesJeu.solution, grilleJoueur: joueur, tempsEcoule }));
}

function afficherGrille(initiale, joueur = null) {
    const conteneur = document.getElementById("sudoku-grid");
    conteneur.innerHTML = "";
    celluleSelectionnee = null;
    for (let i = 0; i < 9; i++) {
        const ligne = document.createElement("div");
        ligne.className = "flex w-full flex-1";
        for (let j = 0; j < 9; j++) {
            const v = initiale[i][j];
            const div = document.createElement("div");
            let cls = "flex-1 flex items-center justify-center border border-slate-200 text-xl font-bold cursor-pointer select-none transition-all";
            if (j % 3 === 2 && j !== 8) cls += " border-r-2 border-r-slate-800";
            if (i % 3 === 2 && i !== 8) cls += " border-b-2 border-b-slate-800";
            div.className = cls;
            div.dataset.row = i; div.dataset.col = j;
            if (v !== null) {
                div.textContent = v; div.dataset.fixe = "true";
                div.classList.add("text-slate-800", "bg-slate-100/50");
            } else {
                div.dataset.fixe = "false"; div.classList.add("text-[#6992f0]");
                if (joueur && joueur[i][j]) div.textContent = joueur[i][j];
                div.onclick = () => {
                    if (celluleSelectionnee) celluleSelectionnee.classList.remove("bg-blue-100", "ring-2", "ring-inset", "ring-blue-400");
                    celluleSelectionnee = div; div.classList.add("bg-blue-100", "ring-2", "ring-inset", "ring-blue-400");
                };
            }
            ligne.appendChild(div);
        }
        conteneur.appendChild(ligne);
    }
}

document.querySelectorAll("#pave-numerique button").forEach(b => {
    b.onclick = () => {
        if (celluleSelectionnee && celluleSelectionnee.dataset.fixe === "false") {
            celluleSelectionnee.textContent = b.textContent;
            celluleSelectionnee.classList.remove("text-red-500", "text-green-500");
            celluleSelectionnee.classList.add("text-[#6992f0]");
            sauvegarder();
        }
    };
});

document.getElementById("btn-annuler").onclick = () => {
    if (celluleSelectionnee && celluleSelectionnee.dataset.fixe === "false") {
        celluleSelectionnee.textContent = "";
        celluleSelectionnee.classList.remove("text-red-500", "text-green-500");
        sauvegarder();
    }
};

document.getElementById("btn-verifier").onclick = () => {
    if (!donneesJeu) return;
    let plein = true, faux = false, dom = [];
    const cells = document.querySelectorAll("#sudoku-grid div[data-row]");
    let idx = 0;
    for (let i = 0; i < 9; i++) {
        let l = [];
        for (let j = 0; j < 9; j++) {
            let v = cells[idx++].textContent;
            if (v === "") plein = false;
            l.push(v === "" ? 0 : parseInt(v));
        }
        dom.push(l);
    }
    if (!plein) return afficherPopup("La grille n'est pas encore finie !");
    cells.forEach(c => {
        const r = parseInt(c.dataset.row), col = parseInt(c.dataset.col), n = parseInt(c.textContent);
        let ok = true;
        for (let i = 0; i < 9; i++) {
            if ((i !== col && dom[r][i] === n) || (i !== r && dom[i][col] === n)) ok = false;
            let bl = 3 * Math.floor(r / 3) + Math.floor(i / 3), bc = 3 * Math.floor(col / 3) + i % 3;
            if ((bl !== r || bc !== col) && dom[bl][bc] === n) ok = false;
        }
        if (!ok) {
            faux = true;
            if (c.dataset.fixe === "false") { c.classList.remove("text-[#6992f0]", "text-green-500"); c.classList.add("text-red-500"); }
        } else if (c.dataset.fixe === "false") { c.classList.remove("text-[#6992f0]", "text-red-500"); c.classList.add("text-green-500"); }
    });
    if (!faux) {
        clearInterval(intervalleChrono);
        enregistrerScore(tempsEcoule, document.getElementById("difficulte").value);
        afficherPopup(`<b>Sudoku réussi !</b><br>Temps : ${formaterTemps(tempsEcoule)}`);
        localStorage.removeItem("sudokuSave");
    } else afficherPopup("La grille contient des erreurs.");
};

function formaterTemps(t) {
    let m = Math.floor(t / 60), s = t % 60;
    return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
}

function demarrerChrono() {
    clearInterval(intervalleChrono);
    const div = document.getElementById("chrono");
    const maj = () => { div.textContent = formaterTemps(tempsEcoule); };
    maj();
    intervalleChrono = setInterval(() => { tempsEcoule++; maj(); sauvegarder(); }, 1000);
}

document.getElementById("btn-nouvelle-partie").onclick = () => afficherPopup("Démarrer une nouvelle grille ?", true, nouvellePartie);
document.getElementById("btn-supprimer").onclick = () => afficherPopup("Réinitialiser la grille ?", true, () => { localStorage.removeItem("sudokuSave"); nouvellePartie(); });
document.getElementById("btn-ouvrir-scores").onclick = voirScores;

document.getElementById("btn-resoudre").onclick = () => {
    afficherPopup("Voulez-vous que l'algorithme trouve la solution ?", true, () => {
        if (!donneesJeu) return;
        let g = JSON.parse(JSON.stringify(donneesJeu.puzzle));
        if (resoudreAlgo(g)) { 
            afficherGrille(donneesJeu.puzzle, g); 
            clearInterval(intervalleChrono); 
        }
    });
};

function resoudreAlgo(g) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (g[r][c] == null || g[r][c] === 0) {
                let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                for (let n of nums) {
                    let v = true;
                    for (let i = 0; i < 9; i++) {
                        if (g[r][i] == n || g[i][c] == n) { v = false; break; }
                        let bl = 3 * Math.floor(r / 3) + Math.floor(i / 3), bc = 3 * Math.floor(c / 3) + i % 3;
                        if (g[bl][bc] == n) { v = false; break; }
                    }
                    if (v) {
                        g[r][c] = n;
                        if (resoudreAlgo(g)) return true;
                        g[r][c] = null;
                    }
                }
                return false;
            }
        }
    }
    return true;
}