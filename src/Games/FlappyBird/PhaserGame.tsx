import { forwardRef, useEffect, useLayoutEffect, useRef, useState, useContext } from 'react';
import StartGame from '../Game/main';
import { EventBus } from './EventBus';
import GameOver from './scenes/GameOver';
import { Screen } from '../App';
import { UserContext } from "./../UserContext"; // Local stored user information

interface Props {
    setScreen: React.Dispatch<React.SetStateAction<Screen>>;
}

const PhaserGame: React.FC<Props> = ({ setScreen }) => 
{
    const game = useRef<Phaser.Game | null>(null!);
    const [gameEnd, setGameEnd] = useState(false);
    const userInfo = useContext(UserContext);

    useLayoutEffect(() =>
    {
        if (game.current === null && gameEnd == false)
        {
            game.current = StartGame("game-container"); // Starts the Phaser Game
            console.log("NewGame");
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

    EventBus.on("gameHasEnded", (data: boolean) => {
        setGameEnd(data);           
    });

    // Subscribe to score updates
    EventBus.on("score", (data: number) => {
        userInfo.score = data.toString();
    });

    // gameHasEnded Event emitted from Phaser Game Scene 
    useEffect(() =>{

    })

    return (
        <>
        {gameEnd? (
            <GameOver onGameOver={() => setScreen("postgame")}/> // If phaser game is over, show Game Over screen
        ):(
            <div id="game-container"></div> // Else show div container for phaser game
        )}
        
        </>
    );

};

export default PhaserGame;
