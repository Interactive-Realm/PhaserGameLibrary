import { EventBus } from '../../../EventBus';
import { Scene, GameObjects, Sound, Physics } from 'phaser';
import PlayerPrefab from '../../../Components/Prefabs/AS_Player.ts'
import PlayerMovement from '../../../Components/Functions/PlayerMovement.ts';
import EnemyPrefab from '../../../Components/Prefabs/AS_Enemy.ts';
import Bullet from '../../../Components/Prefabs/Bullet.ts'
import PowerUp from '../../../Components/Prefabs/PowerUp.ts';

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

    // Player Variables
    player: PlayerPrefab;
    playerBody: Phaser.Physics.Arcade.Body;
    playerMoveSpeed: number;
    playerBullets: Physics.Arcade.Group;

    // Enemy Variables
    enemy: PlayerPrefab;
    enemyBody: Phaser.Physics.Arcade.Body;
    enemyMoveSpeed: number;
    enemyBullets: Physics.Arcade.Group;
    enemies: Physics.Arcade.Group;

    // PowerUps Variables
    powerups: Physics.Arcade.Group; // All current active power ups

    // UI References
    hp1: any; // Left most HP Icon
    hp2: any; // Middle HP Icon
    hp3: any; // Right most HP Icon

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

        this.playerMoveSpeed = 200;
        
        this.enemyMoveSpeed = 200;

    }

    create(){

        // Setup Player
        this.SpawnPlayer();

        // Spawn test enemy
        this.SpawnEnemy("2");

        // Setup UI
        this.SetupUI();
        
        this.SpawnPowerUp();
    }

    SetupUI(){

        // Setup Player HP UI
        this.hp1 = this.add.image(50, 100, 'hp').setScale(0.1);
        this.hp2 = this.add.image(100, 100, 'hp').setScale(0.1);
        this.hp3 = this.add.image(150, 100, 'hp').setScale(0.1);

        // Setup Scoreboard UI

        // Setup Missile Count UI
    }

    SpawnPlayer(){
        // Create new player from PlayerPrefab class and add to scene
        this.player = new PlayerPrefab(this, this.screenWidth/2, this.screenHeight/1.2, 'player').setScale(0.20);        
        
        // Set player HP to 3
        this.player.health = 3;

        // Setup Player Controls
        this.SetupPlayerControls();

        // Create group for all player bullets (to ensure they only damage the enemies)
        this.playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    }

    SetupPlayerControls(){

        // Setup Player Movement
        const movementType = new PlayerMovement(this.player, this);
        movementType.MovementMouseXYDrag();

        // Setup Shoot Button
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, time: number, lastFired: any) =>
            {
                if (this.player.active === false) { return; }

                // Get bullet from bullets group
                const bullet = this.playerBullets.get().setActive(true).setVisible(true);

                if (bullet)
                {
                    bullet.fire_straight(this.player);
                    this.physics.add.collider(this.enemies, bullet, (enemyHit, bulletHit) => this.enemyHitCallback(enemyHit, bulletHit));
                }
            });

        // Setup Missile Button
    }

    SpawnEnemy(enemyType: string){
        
        let img;
        let enemyHP;
        switch (enemyType) {

            case "1":
                enemyHP = 1
                img='enemy1'
                break;
    
            case "2":
                enemyHP = 2
                img='enemy2'
                break;

            case "3":
                enemyHP = 3
                img='enemy3'
                break;
        }
            
        //Create new enemy from PlayerPefab class and add to scene
        this.enemy = new PlayerPrefab(this, this.screenWidth/2, 400, img as string).setScale(0.1);

        // Add physics and collision
        this.enemies = this.physics.add.group(this.enemy);
        this.physics.add.collider(this.player, this.enemy, (playerHit) => this.enemy.kill);

        // Set enemy HP
        this.enemy.health = enemyHP as number;
        

        // Create group for all enemy bullets (to ensure they only damage the player)
        this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

        return this.enemy;
    }

    SpawnPowerUp(){

        const powerUp = new PowerUp(this,  this.screenCenterX, this.screenCenterY, "shield").setScale(0.25);
        this.physics.add.collider(this.player, powerUp, (playerHit) => powerUp.ActivatePowerUp("missle", playerHit as PlayerPrefab));
    }

    // Callback function for when player has been hit
    playerHitCallback (playerHit: any, bulletHit: any)
    {
        // Reduce health of player
        if (bulletHit.active === true && playerHit.active === true && this.player.invincible == false)
        {
            this.player.PlayerHit(); // Removed HP and puts player in invicible state for 3 seconds

            if(playerHit.health == 0) playerHit.destroy();

            // Kill hp sprites and kill player if health <= 0
            if (playerHit.health === 2)
            {
                this.hp3.destroy();
            }
            else if (playerHit.health === 1)
            {
                this.hp2.destroy();
            }
            else
            {
                this.hp1.destroy();
                this.endGame(); // Game over state should execute here
            }

            // Destroy bullet
            bulletHit.destroy();
        }
    }

    // Callback function for when enemy has been hit
    enemyHitCallback (enemyHit: any, bulletHit: any)
    {
        // Reduce health of enemy
        if (bulletHit.active === true && enemyHit.active === true)
        {
            enemyHit.health -= 1;

            // Kill enemy if health <= 0
            if (enemyHit.health <= 0)
            {
                enemyHit.destroy();
            }

            // Destroy bullet
            bulletHit.setActive(false).setVisible(false);
        }
    }



    enemyFire (time: number)
    {
        if (this.enemy == null) return;

        if ((time - this.enemy.lastFired) > 1000)
        {
            this.enemy.lastFired = time;

            // Get bullet from bullets group
            const bullet = this.enemyBullets.get().setActive(true).setVisible(true);

            if (bullet)
            {
                bullet.fire_homing(this.enemy, this.player);

                // Add collider between bullet and player
                this.physics.add.overlap(this.player, bullet, (playerHit, bulletHit) => this.playerHitCallback(playerHit, bulletHit));
            }
        }
    }

    

    MoveEnemy(enemy: PlayerPrefab, direction: number) {

        //console.log(this.enemy.x);
        if(enemy == null) return;
        if(enemy.x >= this.screenWidth) {
            direction = -1;
        }
        else if(enemy.x <= 0) {
            direction = 1;
        }

        enemy.prefabBody.setVelocityX(direction * this.enemyMoveSpeed);
    }
    
    update(time: number, delta: number){

        this.MoveEnemy(this.enemy, -1);

        // Make enemy fire
        this.enemyFire(time);            
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
