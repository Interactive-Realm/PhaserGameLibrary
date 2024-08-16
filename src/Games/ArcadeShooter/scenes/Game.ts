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
    playerMoveSpeed: number;
    playerBullets: Physics.Arcade.Group;

    // Enemy Variables
    enemy: EnemyPrefab;
    enemyMoveSpeed: number;
    enemyBullets: Physics.Arcade.Group;
    enemies: Physics.Arcade.Group;

    // PowerUps Variables
    powerups: Physics.Arcade.Group; // All current active power ups

    // UI References
    hp1: Phaser.GameObjects.Image; // Left most HP Icon
    hp2: Phaser.GameObjects.Image; // Middle HP Icon
    hp3: Phaser.GameObjects.Image; // Right most HP Icon

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

        // Set Player Speed
        this.playerMoveSpeed = 200;
        
        // Set Enemy Speed
        this.enemyMoveSpeed = 200;

    }

    create(){

        // Setup Player
        this.SpawnPlayer();

        // Spawn test enemy
        this.SpawnEnemy(2);

        // Setup UI
        this.SetupUI();
        
        // Spawn Test Power Up
        this.SpawnPowerUp();

        //this.WaveIntro(1);
    }

    SetupUI(){

        // Setup Player HP UI
        this.hp1 = this.add.image(50, 100, 'hp').setScale(0.1);
        this.hp2 = this.add.image(100, 100, 'hp').setScale(0.1);
        this.hp3 = this.add.image(150, 100, 'hp').setScale(0.1);

        // Setup Scoreboard UI

        // Setup Missile Count UI
    }

    UpdateUI(playerHit:PlayerPrefab){

        // Kill hp sprites and kill player if health <= 0
        if (playerHit.health === 3)
        {
            this.hp3.setVisible(true);
        }
        else if (playerHit.health === 2)
        {
            this.hp3.setVisible(false);
        }
        else if (playerHit.health === 1)
        {
            this.hp2.setVisible(false);
        }
        else
        {
            this.hp1.setVisible(false);

             // Game over state should NOT execute here
             
        }  
        if(playerHit.health == 0) this.endGame();             
            

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

    // Setup Player Controls
    SetupPlayerControls(){

        // Setup Player Movement
        const movementType = new PlayerMovement(this.player, this);
        movementType.MovementMouseXYDrag();

        // Setup Shoot Button
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, time: number, lastFired: any) =>
            {
                if (this.player.active === false) { return; }

                // Get bullet from bullets group
                const bullet = this.playerBullets.get(0,0,'bullet').setActive(true).setVisible(true);
                const bulletImg = bullet as GameObjects.Image
                bulletImg.setTexture('bullet').setScale(3);

                if (bullet)
                {
                    bullet.fire_straight(this.player,-1);
                    this.physics.add.collider(this.enemies, bullet, (enemyHit, bulletHit) => this.enemyHitCallback(enemyHit, bulletHit));
                }
            });

        // Setup Missile Button
    }

    // Spawns enemy
    SpawnEnemy(enemyType: number){
        
        console.log("Spawned enemy type " + enemyType)
        let img;       
        switch (enemyType) {

            case 1: 
                img='enemy1'
                break;
    
            case 2:
                img='enemy2'
                break;

            case 3:
                img='enemy3'
                break;
        }
            
        //Create new enemy from PlayerPefab class and add to scene
        this.enemy = new EnemyPrefab(this, this.screenWidth/2, 400, img as string).setScale(0.1);

        this.enemy.enemyType = enemyType;

        // Add physics and collision
        this.enemies = this.physics.add.group(this.enemy);
        // Add function to kill enemy on player collision
        this.physics.add.collider(this.player, this.enemy, (playerHit, enemyHit) => this.playerCollisionCallback(this.enemy));       

        // Create group for all enemy bullets (to ensure they only damage the player)
        this.enemyBullets = this.physics.add.group({ key: 'bullet', classType: Bullet, runChildUpdate: true });

        return this.enemy;
    }

    // Spawns a power up 
    // Still needs power up type scope in function call
    SpawnPowerUp(){

        const powerUp = new PowerUp(this,  this.screenCenterX, this.screenCenterY, "shield").setScale(0.25);
        this.physics.add.collider(this.player, powerUp, (playerHit) => powerUp.ActivatePowerUp("missle", playerHit as PlayerPrefab));
    }

    WaveIntro(waveNumber: number){

        let waveIntroText = this.add.text(this.screenCenterX,this.screenCenterY,"Wave " + waveNumber,{
            fontSize: '60px',
            align: 'center',
        }).setOrigin(0.5, 0.5).setDepth(2).setStroke('black', 10).setFontFamily('bulkypix');  


        this.time.addEvent({delay:3000, callback: () =>{
            waveIntroText.setVisible(false);
            this.ExecuteWave(waveNumber);
            
        }})

    }

    ExecuteWave(waveNumber: number){

        for(let i = 0; i <= 10; i++)
        {
            this.SpawnEnemy(Phaser.Math.Between(1,3))
        }
        
    }

    // Callback function for when player has been hit by bullet
    playerHitCallback (playerHit: any, bulletHit: any)
    {
        // Reduce health of player
        if (bulletHit.active === true && playerHit.active === true)
        {
            this.player.PlayerHit(); // Removed HP and puts player in invicible state for 3 seconds

            this.UpdateUI(playerHit);           

            // Destroy bullet
            bulletHit.destroy();
        }
    }

    // Callback function for when enemy has been hit by bullet
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

            // // Call enemy hit function on enemyPrefab
            // const enemyPrefab = enemyHit as EnemyPrefab;            
            // enemyPrefab.EnemyHit();

            // Destroy bullet
            bulletHit.destroy();
        }
    }

    // Callback function for when player collide with enemy
    playerCollisionCallback(collisionObject: EnemyPrefab){
        this.player.PlayerHit();
        this.UpdateUI(this.player);

        collisionObject.KillEnemy();
    }

    // Enemy Attack function, checks enemy type to determine attack type
    enemyFire (enemy: EnemyPrefab, time: number)
    {

        // Ensure it doesn't call error in update if enemy is gone        
        if (!enemy.active) return; 
        
        // Checks if 1 second has passed
        if ((time - enemy.lastFired) > 1000) 
        {
            enemy.lastFired = time;

            // Get bullet from bullets group
            const bullet = this.enemyBullets.get(0,0, 'bullet').setActive(true).setVisible(true);

            if (bullet)
            {
                
                if(enemy.enemyType === 3) bullet.fire_homing(enemy, this.player);
                else if (enemy.enemyType === 2) bullet.fire_straight(enemy, 1);
                else this.physics.moveToObject(this.enemy, this.player, 400, 2000);

                // Add collider between bullet and player
                this.physics.add.overlap(this.player, bullet, (playerHit, bulletHit) => this.playerHitCallback(playerHit, bulletHit));
            }
        }
    }

    
    // THIS IS ONLY TEMPORARY 
    // REMOVE THIS
    MoveEnemy(enemy: EnemyPrefab, direction: number) {

        //if(enemy.enemyType === 1) return;
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

        //this.MoveEnemy(this.enemy, -1);

        // Make enemy fire
        //this.enemyFire(this.enemy,time);            
    }

    // End game function with fade out and call to refresh page (restart application)
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
