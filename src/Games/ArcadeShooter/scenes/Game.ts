import { EventBus } from '../../../EventBus';
import { Scene, GameObjects, Sound } from 'phaser';

export class Game extends Scene
{
    // Generic Phaser Objects
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    // Screen Definitions
    private screenCenterX: number;
    private screenCenterY: number;
    private screenWidth: number;
    private screenHeight: number;

    constructor ()
    {
        super('Game');
    }

    preload() {
        
    }

    create(){

    }
    
    endGame = () => {
        this.cameras.main.fadeOut(1500, 0, 0, 0);

        //console.log("game ended! Your Score: " + this.score);
        //EventBus.emit('score', this.score);

        this.time.addEvent({
            delay: 2000, 
            callback: function() {
                EventBus.emit('gameHasEnded', true);
            },
            callbackScope: this,
            loop: false
        });
        
    }


        

}
