import React from 'react';

interface GameStatusProps {
    currentPlayer: string;
    stonesRemaining: number;
}

const GameStatus = (props: { currentPlayer, stonesRemaining }) => {
    return (
        <div>
            <h2>Game Status</h2>
            <p>Current Player: {currentPlayer}</p>
            <p>Stones Remaining: {stonesRemaining}</p>
        </div>
    );
};

export default GameStatus;