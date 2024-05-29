import {BoardState, Move } from '../shared/types';

export function alwaysPlay1(gameState:BoardState): Move {
    return 1;
}
export function greedy(gameState:BoardState): Move {
    return Math.min(gameState, 3);
}

// for this, we need client and server to agree on the maxMove,
// which is currently dynamic.  Needs more thought....
// export function crazy(boardState:BoardState): Move {
//     // choose a random number between 1 and maxMove, inclusive
//     const rawMove = Math.floor(Math.random() * this.maxMove) + 1;
//     // truncate to [1,boardState]
//     return Math.max(1, Math.min(rawMove,boardState));