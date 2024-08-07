import { Boot } from './scenes/Boot';
import { GameCountdown } from './scenes/GameCountdown';
import { Game as MainGame } from './scenes/Game';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { pathSelector } from '../../assetData';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    parent: 'game-container',
    scene: [
        Boot,
        Preloader,
        MainGame,
        GameCountdown
    ],
    physics: {
        default: 'arcade',
    },
    scale: {
        mode: Phaser.Scale.FIT,
        //autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    }, 
    backgroundColor: 0x7699c6,
};

const StartGame = (parent: string, customAssets: boolean) => {

    pathSelector(customAssets);
    return new Game({ ...config, parent });

}

export {StartGame as StartOcean};
