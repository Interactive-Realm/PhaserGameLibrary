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

    private enemy: PlayerPrefab;
    enemyBody: Phaser.Physics.Arcade.Body;
    private enemyMoveSpeed: number;

    private direction: number;
    playerbullet: Physics.Arcade.Body;

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
        
        this.enemyMoveSpeed = 200;
        this.direction = 1;
        this.target = Phaser.Math.Vector2;

    }

    create(){
        // Setup Player
        this.player = new PlayerPrefab(this, this.screenWidth/2, this.screenHeight/1.2, 'player').setScale(0.20);
        this.add.existing(this.player);

        this.physics.world.enable(this.player);
        this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;

        this.playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

        // const movementType = new PlayerMovement(this.player, this);
        // movementType.MovePlayerXYDrag(this.playerSpeed, this.game);

        // Setup Player Movement
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) =>
            {
                console.log("test");
                this.target.x = pointer.worldX;
                this.target.y = pointer.worldY;
    
                // Move at 200 px/s:
                this.physics.moveToObject(this.player, this.target, 200);
    
                
            });

        // Fires bullet from player on left click of mouse
        this.input.on('pointerdown', (pointer, time, lastFired) =>
            {
                if (this.player.active === false) { return; }

                // Get bullet from bullets group
                const bullet = this.playerBullets.get().setActive(true).setVisible(true);

                if (bullet)
                {
                    bullet.fire(this.player, this.reticle);
                    this.physics.add.collider(this.enemy, bullet, (enemyHit, bulletHit) => this.enemyHitCallback(enemyHit, bulletHit));
                }
            });
        
        
        
        const enemy = new EnemyPrefab(this, this.screenWidth/2, 400, 'enemy1').setScale(0.1);
        this.physics.add.existing(enemy);
        this.add.existing(enemy);
        this.enemy = enemy;
        this.enemyBody = this.enemy.body as Phaser.Physics.Arcade.Body;
        
    }

    MoveEnemy() {


        //console.log(this.enemy.x);

        if(this.enemy.x >= this.screenWidth) {
            this.direction = -1;
        }
        else if(this.enemy.x <= 0) {
            this.direction = 1;
        }

        this.enemyBody.setVelocityX(this.direction * this.enemyMoveSpeed);
    }
    
    update(time: number, delta: number): void {

        this.MoveEnemy();

        const tolerance = 4;

        const distance = Phaser.Math.Distance.Between(this.player.x,this.player.y,this.target.x,this.target.y)
    
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
