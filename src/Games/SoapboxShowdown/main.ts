import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { pathSelector } from '../../assetData';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainGame,
    ],
    physics: {
        default: 'arcade',
    },
};

const StartGame = (parent: string, customAssets: boolean) => {

    pathSelector(customAssets);
    return new Game({ ...config, parent });
    
}

export {StartGame as StartFlappy};
