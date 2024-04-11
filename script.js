import { Sudoku } from "./sudoku.js";
import { Stopwatch } from "./stopwatch.js";
import { BOX_SIZE, GRID_SIZE, DIFFICULTIES, convertIndexToPosition, convertPositionToIndex } from "./utilities.js";

let cells;
let mistakes = 0;
let elapsedTime = 0;
let noteMode = false;
let selectedCellIndex = null;
let selectedCell = null;
let selectedDifficulty = 51;
let sudoku = new Sudoku(selectedDifficulty);
let stopwatch = new Stopwatch();

init();

function init() {
    initDifficulties();
    initNode();
    initCells();
    initNumbers();
    initRemover();
    initKeyEvent();
    timer();
}

function reload() {
    mistakes = 0;
    document.querySelector('.mistakes_cnt').innerHTML = 0;
    sudoku = new Sudoku(selectedDifficulty);
    stopwatch = new Stopwatch();
    cells.forEach(cell => {
        cell.innerHTML = null;
        cell.classList.remove('filled', 'zoom', 'shake', 'selected', 'note')
    });
    initCells();
}

function initCells() {
    cells = document.querySelectorAll('.cell');
    elapsedTime = 0;
    fillCells();
    initCellsEvent();
}

function fillCells() {
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const { row, column } = convertIndexToPosition(i);
        if (sudoku.grid[row][column] !== null) {
            cells[i].classList.add('filled');
            cells[i].innerHTML = sudoku.grid[row][column];
        }
    }
}

function initCellsEvent() {
    cells.forEach((cell, index) => {
        cell.addEventListener('click', () => onCellClick(cell, index));
    });
}

function onCellClick(clickedCell, index) {
    cells.forEach(cell => cell.classList.remove('selected', 'highlighted'));
    if (clickedCell.classList.contains('filled')) {
        selectedCellIndex = null;
        selectedCell = null;
    } else {
        selectedCellIndex = index;
        selectedCell = clickedCell;
        clickedCell.classList.add('selected');
        highlightCellBy(index);
    }

    if (clickedCell.innerHTML === '') return;
    cells.forEach(cell => {
        if (cell.innerHTML === clickedCell.innerHTML) cell.classList.add('selected');
    });
}

function highlightCellBy(index) {
    highlightColumnBy(index);
    highlightRowBy(index);
    highlightBoxBy(index);
}

function highlightColumnBy(index) {
    const column = index % GRID_SIZE;
    for (let row = 0; row < GRID_SIZE; row++) {
        const cellIndex = convertPositionToIndex(row, column);
        cells[cellIndex].classList.add('highlighted')
    }
}

function highlightRowBy(index) {
    const row = Math.floor(index / GRID_SIZE);
    for (let column = 0; column < GRID_SIZE; column++) {
        const cellIndex = convertPositionToIndex(row, column);
        cells[cellIndex].classList.add('highlighted');
    }
}

function highlightBoxBy(index) {
    const column = index % GRID_SIZE;
    const row = Math.floor(index / GRID_SIZE);
    const firstRowInBox = row - row % BOX_SIZE;
    const firstColumnInBox = column - column % BOX_SIZE;

    for (let iRow = firstRowInBox; iRow < firstRowInBox + BOX_SIZE; iRow++) {
        for (let iColumn = firstColumnInBox; iColumn < firstColumnInBox + BOX_SIZE; iColumn++) {
            const cellIndex = convertPositionToIndex(iRow, iColumn);
            cells[cellIndex].classList.add('highlighted');
        }
    }
}

function initNumbers() {
    const numbers = document.querySelectorAll('.number');
    numbers.forEach(number => {
        number.addEventListener('click', () => onNumberClick(parseInt(number.innerHTML)));
    });
}

function onNumberClick(number) {
    if (!selectedCell) return;
    if (selectedCell.classList.contains('filled')) return;
    cells.forEach(cell => cell.classList.remove('error', 'zoom', 'shake', 'selected'));
    selectedCell.classList.add('selected');
    if(noteMode){
        setNoteInSelectedCell(number);
    }
    else{
        selectedCell.classList.remove('note');
        setValueInSelectedCell(number);
    }

    if (!sudoku.hasEmptyCells()) {
        setTimeout(() => winAnimation(), 500)
    }
}

function setValueInSelectedCell(value) {
    const { row, column } = convertIndexToPosition(selectedCellIndex);
    const duplicatesPositions = sudoku.getDuplicatePositions(row, column, value);

    if (duplicatesPositions.length) {
        mistakes++;
        document.querySelector('.mistakes_cnt').innerHTML = mistakes;
        highlightDublicates(duplicatesPositions)
        return;
    }

    sudoku.grid[row][column] = value;
    selectedCell.innerHTML = value;
    setTimeout(() => selectedCell.classList.add('zoom'), 0);
}

function setNoteInSelectedCell(value){
    // let selectedCellValues = selectedCell.innerHTML.split('\n');
    if(!selectedCell.innerHTML.includes(value)){
        selectedCell.innerHTML += value + '\n';
    }
    selectedCell.classList.add('note');
}

function highlightDublicates(duplicatesPositions) {
    duplicatesPositions.forEach(duplicate => {
        const index = convertPositionToIndex(duplicate.row, duplicate.column);
        setTimeout(() => cells[index].classList.add('error', 'shake'), 0);
    })
}

function initDifficulties() {
    const difficulties = document.querySelectorAll('.difficulty');

    const difficultiesPanel = document.querySelector('.difficulities');
    difficultiesPanel.style.display = 'none';
    const difficultyChange = document.querySelector('.difficulty_change');
    difficultyChange.addEventListener('click', () => onDifficultyChangeClick());

    difficulties.forEach(difficuly => {
        difficuly.addEventListener('click', () => onDifficultyClick(difficuly));
    });
}

function onDifficultyChangeClick() {
    const difficulties = document.querySelector('.difficulities');
    const difficultyChange = document.querySelector('.difficulty_change');


    if (difficulties.style.display === 'none') {
        difficulties.style.display = 'grid';
        difficultyChange.classList.add('selected');
    }
    else if (difficulties.style.display === 'grid') {
        difficulties.style.display = 'none';
        difficultyChange.classList.remove('selected');
    }
}

function onDifficultyClick(difficuly) {
    const difficultyChange = document.querySelector('.difficulty_change');

    selectedDifficulty = DIFFICULTIES.get(difficuly.innerHTML); // DIFFICULTIES[difficuly.innerHTML];
    document.querySelectorAll('.difficulty').forEach(difficuly => {
        difficuly.classList.remove('selected');
    });
    difficultyChange.innerHTML = difficuly.innerHTML;
    onDifficultyChangeClick();

    difficuly.classList.add('selected');
    reload();
}

function initRemover() {
    const remover = document.querySelector('.remove');
    remover.addEventListener('click', () => onRemoveClick());
}

function onRemoveClick() {
    if (!selectedCell) return;
    if (selectedCell.classList.contains('filled')) return;

    cells.forEach(cell => cell.classList.remove('error', 'zoom', 'shake', 'selected'));
    selectedCell.classList.add('selected');
    const { row, column } = convertIndexToPosition(selectedCellIndex);
    selectedCell.innerHTML = '';
    sudoku.grid[row][column] = null;

}

function initKeyEvent() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace') {
            onRemoveClick();
        } else if (event.key >= '1' && event.key <= '9') {
            onNumberClick(parseInt(event.key));
        }
    });
}

function timer() {
    // elapsedTime ++;
    stopwatch.increase();
    let test = stopwatch.getTime();
    document.querySelector('.stopwatch_seconds').innerHTML = test;
    setTimeout(timer, 1000);
}

function initNode() {
    const noteModeButton = document.querySelector('.pencil');
    noteModeButton.addEventListener('click', () => onPencilClick(noteModeButton));
}

function onPencilClick(noteModeButton) {
    if(noteMode){
        noteMode = false;
        noteModeButton.classList.remove('selected');
    }else{
        noteMode = true;
        noteModeButton.classList.add('selected');
    }
}
function winAnimation() {
    cells.forEach(cell => cell.classList.remove('error', 'zoom', 'shake', 'selected', 'highlighted'));
    cells.forEach((cell, i) => {
        setTimeout(() => cell.classList.add('highlighted', 'zoom'), i * 15)
    })
    for (let i = 1; i < 10; i++) {
        setTimeout(() => cells.forEach(cell => cell.classList.toggle('highlighted')), 500 + cells.length * 15 + 300 * i);
    }
}