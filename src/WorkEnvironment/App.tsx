import { useRef, useState } from 'react';
import PhaserGame from './GameHandler';
import { Screen } from '@interactive-realm/basepatternutilities';


function App()
{

    const [screen, setScreen] = useState<Screen>('game');

    let component;
    switch (screen) {

        case "game":
            component = <PhaserGame setScreen={setScreen}/>;
            
            break;

        case "pregame":
            component = <PhaserGame setScreen={setScreen}/>;
            break;
    }

    return (
        <div id="app">
            {component}
        </div>
    )
}

export default App
