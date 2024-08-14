import { EventBus } from '../../../EventBus';
import { Scene, GameObjects, Sound, Physics } from 'phaser';
import PlayerPrefab from '../../../Components/Prefabs/AS_Player.ts'
import PlayerMovement from '../../../Components/Functions/PlayerMovement.ts';
import EnemyPrefab from '../../../Components/Prefabs/AS_Enemy.ts';
import Bullet from '../../../Components/Prefabs/Bullet.ts'

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
    playerBullets: Physics.Arcade.Group;
    enemyBullets: Physics.Arcade.Group;

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
        this.SetupPlayer();

        // Setup Enemy
        this.SpawnEnemy();

        // Setup Player Movement
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) =>
            {
                this.target.x = pointer.worldX;
                this.target.y = pointer.worldY;
    
                // Move at 200 px/s:
                this.physics.moveToObject(this.player, this.target, 200, 300);
                
            });

        // Fires bullet from player on left click of mouse
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, time: number, lastFired: any) =>
            {
                if (this.player.active === false) { return; }

                // Get bullet from bullets group
                const bullet = this.playerBullets.get().setActive(true).setVisible(true);

                if (bullet)
                {
                    bullet.fire_straight(this.player, this.enemy);
                    this.physics.add.collider(this.enemy, bullet, (enemyHit, bulletHit) => this.enemyHitCallback(enemyHit, bulletHit));
                }
            });
            
    }

    SetupPlayer(){
        // Create new player from PlayerPrefab class and add to scene
        this.player = new PlayerPrefab(this, this.screenWidth/2, this.screenHeight/1.2, 'player').setScale(0.20);        
        
        // Set player HP to 3
        this.player.health = 3;

        // Create group for all player bullets (to ensure they only damage the enemies)
        this.playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    }

    SpawnEnemy(){
        //Create new enemy from PlayerPefab class and add to scene
        this.enemy = new PlayerPrefab(this, this.screenWidth/2, 400, 'enemy1').setScale(0.1);

        // Set enemy HP
        this.enemy.health = 3;

        // Create group for all enemy bullets (to ensure they only damage the player)
        this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    }

    playerHitCallback (playerHit: any, bulletHit: any)
    {
        // Reduce health of player
        if (bulletHit.active === true && playerHit.active === true)
        {
            
            playerHit.health = playerHit.health - 1;
            if(playerHit.health == 0) playerHit.destroy();
            console.log('Player hp: ', playerHit.health);

            // // Kill hp sprites and kill player if health <= 0
            // if (playerHit.health === 2)
            // {
            //     this.hp3.destroy();
            // }
            // else if (playerHit.health === 1)
            // {
            //     this.hp2.destroy();
            // }
            // else
            // {
            //     this.hp1.destroy();

            //     // Game over state should execute here
            // }

            // Destroy bullet
            bulletHit.setActive(false).setVisible(false);
        }
    }

    enemyFire (time: number)
    {
        if (this.enemy.active === false)
        {
            return;
        }

        if ((time - this.enemy.lastFired) > 1000)
        {
            this.enemy.lastFired = time;

            // Get bullet from bullets group
            const bullet = this.enemyBullets.get().setActive(true).setVisible(true);

            if (bullet)
            {
                bullet.fire_homing(this.enemy, this.player);

                // Add collider between bullet and player
                this.physics.add.collider(this.player, bullet, (playerHit, bulletHit) => this.playerHitCallback(playerHit, bulletHit));
            }
        }
    }

    enemyHitCallback (enemyHit: any, bulletHit: any)
    {
        // Reduce health of enemy
        if (bulletHit.active === true && enemyHit.active === true)
        {
            enemyHit.health = enemyHit.health - 1;
            console.log('Enemy hp: ', enemyHit.health);

            // Kill enemy if health <= 0
            if (enemyHit.health <= 0)
            {
                enemyHit.setActive(false).setVisible(false);
            }

            // Destroy bullet
            bulletHit.setActive(false).setVisible(false);
        }
    }

    MoveEnemy() {


        //console.log(this.enemy.x);

        if(this.enemy.x >= this.screenWidth) {
            this.direction = -1;
        }
        else if(this.enemy.x <= 0) {
            this.direction = 1;
        }

        this.enemy.prefabBody.setVelocityX(this.direction * this.enemyMoveSpeed);
    }
    
    update(time: number, delta: number){

        this.MoveEnemy();

        // Make enemy fire
        this.enemyFire(time);

        const tolerance = 4;

        const distance = Phaser.Math.Distance.Between(this.player.x,this.player.y,this.target.x,this.target.y)
    
                if (distance < tolerance)
                {
                    
                    this.player.prefabBody.reset(this.target.x, this.target.y);
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
