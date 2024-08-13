import { EventBus } from '../../../EventBus';
import { Scene, GameObjects, Sound } from 'phaser';
import PlayerPrefab from '../../../Components/Prefabs/AS_Player.ts'
import PlayerMovement from '../../../Components/Functions/PlayerMovement.ts';

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

    player: PlayerPrefab;
    playerBody: Phaser.Physics.Arcade.Body;
    playerSpeed: number;

    pointer: any;

    constructor ()
    {
        super('Game');
    }

    preload() {
        
        // Center of screen
        this.screenCenterX = (this.sys.game.config.width as number) / 2;
        this.screenCenterY = (this.sys.game.config.height as number) / 2;

        // Screen edges, right and bottom
        this.screenWidth = this.sys.game.config.width as number;
        this.screenHeight = this.sys.game.config.height as number;

        this.playerSpeed = 200;
    }

    create(){
        console.log(this.screenWidth);
        this.player = new PlayerPrefab(this, this.screenWidth/2, this.screenHeight/1.2, 'player');
        this.add.existing(this.player);
        this.physics.world.enable(this.player);
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

        const movementType = new PlayerMovement(this.player, this);
        movementType.MovePlayerXYDrag(this.playerSpeed, this.game);

        this.pointer = this.game.input.activePointer;
        

        
        
    }
    
    update(time: number, delta: number): void {

        const tolerance = 4;

        const distance = Phaser.Math.Distance.Between(this.pointer.x,this.pointer.y,this.player.x,this.player.y)

        console.log(distance);
    
                if (distance < tolerance)
                {
                    
                    this.playerBody.reset(this.pointer.x, this.pointer.y);
                }
            

    }

    endGame = () => {
        this.cameras.main.fadeOut(1500, 0, 0, 0);

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
