import React from 'react';

interface GameStatusProps {
    currentPlayer: string;
    stonesRemaining: number;
}
 
const GameStatus = (props: GameStatusProps) => {
    return (
        <div>
            <h2>Game Status</h2>
            <p>Current Player: {props.currentPlayer}</p>
            <p>Stones Remaining: {props.stonesRemaining}</p>
        </div>
    );
};

export default GameStatus;