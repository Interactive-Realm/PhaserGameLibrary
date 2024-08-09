import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { Game } from './scenes/Game';
import { pathSelector } from '../../assetData';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scene: [
        Boot,
        Preloader,
        Game,
    ],
    physics: {
        default: 'arcade',
        //arcade: {debug: true}
    },
    scale: {
        mode: Phaser.Scale.FIT,
        //autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    }, 
    backgroundColor: 0x7699c6
};

const _StartGameFlappy = (parent: string, customAssets: boolean) => {

    pathSelector(customAssets);
    return new Phaser.Game({ ...config, parent });

}

export { _StartGameFlappy };
