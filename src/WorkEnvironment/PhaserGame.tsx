import { forwardRef, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {StartSoapbox} from '../Games/SoapboxShowdown/main';
import { StartFlappy } from '../Games/FlappyBird/main';
import { StartOcean } from '../Games/SaveTheOcean/main';
import { EventBus } from '../EventBus';
import GameOver from '../GameOver';
import { Screen } from '@interactive-realm/basepatternutilities';

interface Props {
    setScreen: React.Dispatch<React.SetStateAction<Screen>>;
}

const PhaserGame: React.FC<Props> = ({ setScreen }) =>
{
    const game = useRef<Phaser.Game | null>(null!);
    const [gameEnd, setGameEnd] = useState(false);

    useLayoutEffect(() =>
    {
        if (game.current === null && gameEnd == false)
        {

            game.current = StartFlappy("game-container", true);
        }


        return () =>
        {
            if (game.current && gameEnd == true)
            {
                console.log("Game Current return: " + game.current)
                game.current.destroy(true);
                if (game.current !== null)
                {
                    game.current = null;
                    console.log("Game Current destroyed return: " + game.current)
                }
            }
        }
    });

    // Subscribe to gameHasEnded updates
    EventBus.on("gameHasEnded", (data: boolean) => {
        console.log("GameHasEnded Event is triggered")
        setGameEnd(data);           
    });

    return (
        <>
        {gameEnd? (
            <GameOver onGameOver={() => setScreen("game")}/> // If phaser game is over, show Game Over screen
        ):(
            <div id="game-container"></div> // Else show div container for phaser game
        )}
        </>
    );

};

export default PhaserGame;
