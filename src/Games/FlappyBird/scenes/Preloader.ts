import { Scene } from 'phaser';
import {pathRef} from '../../../assetData';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        //this.add.image(512, 384, 'background');

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

        this.load.image('Bird', 'Bird_124x100_1.png');
        this.load.image('Flap', 'Bird_124x100_5.png');
        this.load.image('PipeTop', 'Pipe_Top_128x1024.png');
        this.load.image('PipeBot', 'Pipe_Bottom_128x1024.png');
        this.load.image('PipeSpawnInterval', 'invisible.png');
        this.load.image('Floor', 'ParallaxFloor_1920x288.png');
        this.load.image('Killline', 'verticalKilLine.png');
        this.load.image('Spritesheet', 'Bird_1_spritesheet.png');

        // // Spritesheet preload for animation
        // this.load.spritesheet('Flappy', 'Spritesheet', { frameWidth: 124, frameHeight: 100});

    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('Game');
    }
}
