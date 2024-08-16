import { EventBus } from '../../../EventBus';
import { Scene, GameObjects, Sound, Physics } from 'phaser';
import PlayerPrefab from '../../../Components/Prefabs/AS_Player.ts'
import PlayerMovement from '../../../Components/Functions/PlayerMovement.ts';
import EnemyPrefab from '../../../Components/Prefabs/AS_Enemy.ts';
import Bullet from '../../../Components/Prefabs/Bullet.ts'
import PowerUp from '../../../Components/Prefabs/PowerUp.ts';
import { useCallback } from 'react';

export class Game extends Scene
{
    // Generic Phaser Objects
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    // Screen Definitions
    private screenCenter: Phaser.Math.Vector2;
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

    curPath: Phaser.Curves.Path;

    constructor ()
    {
        super('Game');
    }

    preload() {
        
        // Center of screen
        this.screenCenter =  new Phaser.Math.Vector2;
        this.screenCenterX = (this.sys.game.config.width as number) / 2;
        this.screenCenterY = (this.sys.game.config.height as number) / 2;
        this.screenCenter.x = this.screenCenterX;
        this.screenCenter.y = this.screenCenterY;

        // Screen edges, right and bottom
        this.screenWidth = this.sys.game.config.width as number;
        this.screenHeight = this.sys.game.config.height as number;

        // Set Player Speed
        this.playerMoveSpeed = 200;
        
        // Set Enemy Speed
        this.enemyMoveSpeed = 200;

        // Define enemy array
        this.enemies = this.physics.add.group();

        this.curPath;

    }

    create(){

        // Setup Player
        this.SpawnPlayer();

        // Spawn test enemy
        //this.SpawnEnemy(2, this.screenCenter);

        // Setup UI
        this.SetupUI();
        
        // Spawn Test Power Up
        //this.SpawnPowerUp();

        this.WaveIntro(1);

        this.curPath = this.createZigZagPath();
        
    }

    EnemyFollowPath(enemy: EnemyPrefab, path: Phaser.Curves.Path){

        const graphics = this.add.graphics({
            fillStyle: { color: 0xffff00, alpha: 0.6 },
            lineStyle: { width: 2, color: 0x0000ff, alpha: 0.6 }
        });

        const start = path.getStartPoint();
        const distance = path.getLength();
        const duration = 35000;
        const speed = distance / duration;
        const speedSec = 1000 * speed;
        const tSpeed = 1 / duration;
        const tSpeedSec = 1000 * tSpeed;

        let t = 0;
        

        // const follower = this.add.follower(path,0,0,enemy.texture)
        // follower.startFollow({
        //     positionOnPath: true,
        // duration: 3000,
        // yoyo: false,
        // repeat: 0,
        // rotateToPath: false

        // })
        
        this.physics.world.on('worldstep', (delta: number) =>
            {

                t += delta * tSpeedSec;

                if (t > 1)
                    {
                        t -= 1;
                        enemy.prefabBody.reset(start.x, start.y);
                        graphics.clear();
                        path.draw(graphics);
                        console.log("Test")
                    }
                
                path.getTangent(t, enemy.prefabBody.velocity);
                enemy.prefabBody.velocity.scale(speedSec);
                //this.enemy.setRotation(this.enemy.prefabBody.velocity.angle());
                graphics.fillPointShape(this.enemy.prefabBody.center, 2);
            });

        


    }

    SetupUI(){

        // Setup Player HP UI
        const hpRef = [];
        this.hp1 = this.add.image(50, 100, 'hp').setScale(0.1).setSize(50,50);
        this.hp2 = this.add.image(0, 0, 'hp').setScale(0.1).setSize(50,50);
        this.hp3 = this.add.image(0, 0, 'hp').setScale(0.1).setSize(50,50);

        hpRef.push(this.hp1);
        hpRef.push(this.hp2);
        hpRef.push(this.hp3);

        Phaser.Actions.AlignTo(hpRef, Phaser.Display.Align.RIGHT_CENTER)

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
                const bullet = this.playerBullets.get(0,0,'bullet','bullet').setActive(true).setVisible(true);

                if (bullet)
                {
                    bullet.fire_straight(this.player,-1);
                    this.physics.add.collider(this.enemies, bullet, (bulletHit, enemyHit) => this.enemyHitCallback(enemyHit as EnemyPrefab, bulletHit  ));
                }
            });

        // Setup Missile Button
    }

    // Spawns enemy
    SpawnEnemy(enemyType: number, location: Phaser.Math.Vector2){
        
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
        this.enemy = new EnemyPrefab(this, location.x, location.y, img as string, enemyType).setScale(0.1);

        // Add physics and collision
        this.enemies = this.physics.add.group(this.enemy);

        // Add function to kill enemy on player collision
        this.physics.add.overlap(this.player, this.enemy, (playerHit, enemyHit) => this.playerCollisionCallback(this.enemy));       

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

        let curEnemy: EnemyPrefab;
        console.log(this.curPath.getStartPoint())
        this.time.addEvent({delay: 3000, callback: () => {
            curEnemy = this.SpawnEnemy(Phaser.Math.Between(1,3), new Phaser.Math.Vector2(this.curPath.getStartPoint()));
            this.EnemyFollowPath(curEnemy, this.curPath)
        },repeat: 10})
        
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
    enemyHitCallback (enemyHit: EnemyPrefab,bulletHit: any )
    {
        // Reduce health of enemy
        if (bulletHit.active === true && enemyHit.active === true)
        {
            enemyHit.EnemyHit();

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

    createZigZagPath ()
    {
        const path = new Phaser.Curves.Path(this.screenWidth-100, this.screenHeight-1000);

        //path.lineTo(this.screenWidth-500, this.screenHeight-500);
        const graphics = this.add.graphics({
            fillStyle: { color: 0xffff00, alpha: 0.6 },
            lineStyle: { width: 2, color: 0x0000ff, alpha: 0.6 }
        });
        const max = 8;
        const h = 500 / max;

        for (let i = 0; i < max; i++)
        {
            if (i % 2 === 0)
            {
                path.lineTo(this.screenWidth-100, 50 + h * (i + 1));
            }
            else
            {
                path.lineTo(100, 50 + h * (i + 1));
            }
        }

        path.lineTo(this.screenCenterX, 650);

        
        path.draw(graphics);

        return path;
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
