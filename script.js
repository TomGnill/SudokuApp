import { Sudoku } from "./sudoku.js";
import { BOX_SIZE, GRID_SIZE, DIFFICULTIES, convertIndexToPosition, convertPositionToIndex } from "./utilities.js";

let cells;
let selectedCellIndex = null;
let selectedCell = null;
let selectedDifficulty = 35;
let sudoku = new Sudoku(selectedDifficulty);

init();

function init() {
    initDifficulties();
    initCells();
    initNumbers();
    initRemover();
    initKeyEvent();
}

function reload() {
    sudoku = new Sudoku(selectedDifficulty);
    cells.forEach(cell => {
        cell.innerHTML = null;
        cell.classList.remove('filled', 'zoom', 'shake', 'selected')
    });
    initCells();
}

function initCells() {
    cells = document.querySelectorAll('.cell');
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
    setValueInSelectedCell(number);

    if (!sudoku.hasEmptyCells()) {
        setTimeout(() => winAnimation(), 500)
    }
}

function setValueInSelectedCell(value) {
    const { row, column } = convertIndexToPosition(selectedCellIndex);
    const duplicatesPositions = sudoku.getDuplicatePositions(row, column, value);

    if (duplicatesPositions.length) {
        highlightDublicates(duplicatesPositions)
        return;
    }

    sudoku.grid[row][column] = value;
    selectedCell.innerHTML = value;
    setTimeout(() => selectedCell.classList.add('zoom'), 0);
}

function highlightDublicates(duplicatesPositions) {
    duplicatesPositions.forEach(duplicate => {
        const index = convertPositionToIndex(duplicate.row, duplicate.column);
        setTimeout(() => cells[index].classList.add('error', 'shake'), 0);
    })
}

function initDifficulties() {
    const difficulties = document.querySelectorAll('.difficulty');
    difficulties.forEach(difficuly => {
        difficuly.addEventListener('click', () => onDifficultyClick(difficuly));
    });
}

function onDifficultyClick(difficuly) {
    selectedDifficulty = DIFFICULTIES.get(difficuly.innerHTML); // DIFFICULTIES[difficuly.innerHTML];
    document.querySelectorAll('.difficulty').forEach(difficuly => {
        difficuly.classList.remove('selected');
    });
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

function winAnimation() {
    cells.forEach(cell => cell.classList.remove('error', 'zoom', 'shake', 'selected', 'highlighted'));
    cells.forEach((cell, i) => {
        setTimeout(() => cell.classList.add('highlighted', 'zoom'), i * 15)
    })
    for (let i = 1; i < 10; i++) {
        setTimeout(() => cells.forEach(cell => cell.classList.toggle('highlighted')), 500 + cells.length * 15 + 300 * i);
    }
}