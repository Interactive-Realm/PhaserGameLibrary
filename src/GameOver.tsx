import React from 'react';
import { useContext } from 'react';
import { UserContext } from "@interactive-realm/basepatternutilities";


interface FrontPageProps {
    onGameOver: (isClicked: boolean) => void; // Callback function type
}

const GameOver: React.FC<FrontPageProps> = ({ onGameOver }) => {
    
    const userInfo = useContext(UserContext);

    const handleButtonClick = () => {

        onGameOver(true)

    };


    return (
        <div>
                <div id="gameover">
                    <h2 id="subtitle3">GAME OVER</h2>
                        <div>
                            <p id="highscore_element" className="scoreTitle">Your Score</p>
                            <p className="scoreText">{userInfo.score}</p>
                        </div>
                        <div className='container'>
                            <button className='buttonwhite mainfont' onClick={handleButtonClick}>{userInfo.userExist ? (<>Leaderboard</>):(<>Sign-Up</>)}</button>
                        </div>
                </div>
                    
        </div>
    );
}

export default GameOver;
