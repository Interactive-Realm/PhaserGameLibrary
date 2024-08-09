import { forwardRef, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {StartGameSoapbox} from '../Games/SoapboxShowdown/main';
import { _StartGameFlappy } from '../Games/FlappyBird/main';
// import { StartGameOcean } from '../Games/SaveTheOcean/main';
import { StartGameOcean } from '../Games/SaveTheOceanCopy/main';
import { EventBus } from '../EventBus';
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

            game.current = StartGameOcean("game-container", true);
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
        console.log("GameHasEnded Event is triggered");
        setGameEnd(data);      
        window.location.reload();     
    });

    return (      
        <div id="game-container"></div> // Else show div container for phaser game
    );

};

export default PhaserGame;
