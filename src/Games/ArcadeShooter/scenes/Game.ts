import { EventBus } from '../../../EventBus';
import { Scene, GameObjects, Sound, Physics } from 'phaser';
import PlayerPrefab from '../../../Components/Prefabs/AS_Player.ts'
import PlayerMovement from '../../../Components/Functions/PlayerMovement.ts';
import EnemyPrefab from '../../../Components/Prefabs/AS_Enemy.ts';

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

    target: any;

    private enemy: Physics.Arcade.Sprite;
    private enemyMoveSpeed: number;

    private direction: number;

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
        this.target = null;
        this.enemyMoveSpeed = 200;
        this.direction = 1;
    }

    create(){
        console.log(this.screenWidth);
        this.player = new PlayerPrefab(this, this.screenWidth/2, this.screenHeight/1.2, 'player').setScale(0.25,0.25);
        this.add.existing(this.player);

        this.physics.world.enable(this.player);
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

        const movementType = new PlayerMovement(this.player, this);
        movementType.MovePlayerXYDrag(this.playerSpeed, this.game);

        
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) =>
            {
                this.target.x == pointer.x;
                this.target.y == pointer.y;
    
                // Move at 200 px/s:
                this.physics.moveToObject(this.player, this.target, 200);
    
                
            });
        
        
        const enemy = new EnemyPrefab(this, this.screenWidth/2, 400, 'enemy1').setScale(0.5);
        this.physics.add.existing(enemy);

         

        this.enemy = enemy;

    }

    MoveEnemy() {


        console.log(this.enemy.x);

        if(this.enemy.x >= this.screenWidth) {
            this.direction = -1;
        }
        else if(this.enemy.x <= 0) {
            this.direction = 1;
        }

        this.enemy.setVelocityX(this.direction * this.enemyMoveSpeed);
    }

    
    update(time: number, delta: number): void {

        this.MoveEnemy();

        const tolerance = 4;

        const distance = Phaser.Math.Distance.Between(this.player.x,this.player.y,this.target.x,this.target.y)

        console.log(distance);
    
                if (distance < tolerance)
                {
                    
                    this.playerBody.reset(this.target.x, this.target.y);
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
