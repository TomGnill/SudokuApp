export const GRID_SIZE = 9;
export const BOX_SIZE = 3;
export const DIFFICULTIES = new Map().set('🥰',43).set('😁',51).set('🤔',56).set('🤯',58).set('👹',64);

export function convertIndexToPosition(index) {
    return {
        row: Math.floor(index / GRID_SIZE),
        column: index % GRID_SIZE
    }
}

export function  convertPositionToIndex(row, column){
    return row * GRID_SIZE + column;
}
