import { Scene } from 'phaser';
import {pathRef} from '../../../assetData';

export class Preloader extends Scene
{
    constructor (customAssets: boolean)
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    

    preload ()
    {
        
        
         //  Load the assets for the game - Replace with your own assets
        this.load.setPath(pathRef);

        this.load.image('player', 'spaceship.png');

        this.load.image('enemy1', 'scout-ship.png');
        this.load.image('enemy2', 'mars-pathfinder.png');
        this.load.image('enemy3', 'lunar-module.png');

        this.load.image('rocket', 'rocket.png');
        this.load.image('shield', 'bubble-field.png');
        this.load.image('weapon1', 'bullets.png');
        this.load.image('weapon2', 'sinusoidal-beam.png');

        this.load.image('haybale', 'haybale.png');
        this.load.image('tire', 'cartire.png');
        this.load.image('roadline', 'roadline.png');
        this.load.image('spawnline', 'spawnline.png');
        this.load.image('instructions', 'instructions.png');
        this.load.image('cone', 'trafficcone.png');
        this.load.audio('music', 'night-ride-mountaineer.mp3');
        this.load.audio('crash', 'crash.mp3');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('Game');
        
    }
}
