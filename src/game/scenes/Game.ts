import { EventBus } from '../EventBus';
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

    // Game Variables
    private score: number;
    private playerPositionY: number;
    private gameSpeed: number;
    private updateGameSpeed: Phaser.Time.TimerEvent;
    private scoreTimer: Phaser.Time.TimerEvent;
    private initialDelay: number;
    private decreaseAmount: number;
    private gameEnded: boolean;
    

    // Asset variables
    player: GameObjects.TileSprite;
    obstacles: Phaser.Physics.Arcade.Sprite[] = [];
    marginObstacles: Phaser.Physics.Arcade.Sprite[] = [];
    stripes: Phaser.Physics.Arcade.Sprite[] = [];
    instructionsImage: GameObjects.Image;

    //Text variables
    private points: GameObjects.Text;

    // Sound variables
    private nightRide: Phaser.Sound.BaseSound;
    private crash: Phaser.Sound.BaseSound;


    updatePlayerPosition: Function;
    cursorIsBeingHeld: boolean;
    

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
        
        // Player start position
        this.playerPositionY = this.screenHeight * 0.75;
        
        // Speed settings
        this.gameSpeed = 300;

        this.initialDelay = 150;
        this.decreaseAmount = 0.1;

        this.gameEnded = false;
        this.nightRide = this.sound.add('music');
        this.crash = this.sound.add('crash');
    }
    
    init(data: any) {
        // Score variable
        this.score = 0;
    }

    create()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x141729);
        this.SetupPlayer();
        this.MovePlayer();
        this.SetupCollision();
        this.SetupPoints();
        this.SetupInstructions();

        // Create a timed recurring event
        
        console.log("Phaser version: " + Phaser.VERSION);
    }

    SetupInstructions() {
        this.instructionsImage = this.add.image(this.screenCenterX, this.screenCenterY, 'instructions');
    }

    RemoveInstructions() {
        this.instructionsImage.destroy();
    }

    StartGame = () => {
        this.RemoveInstructions();
        this.player.setVisible(true);
        console.log("Starting game");
        //this.SpawnMargin();
        this.SpawnRoad();
        this.SpawnObstacles();

        this.nightRide.play({loop:true});
        this.scoreTimer = this.time.addEvent({
            delay: this.initialDelay, // Increment score every 1000 milliseconds (1 second)
            callback: this.UpdateScore,
            callbackScope: this,
            loop: true
        });

        this.updateGameSpeed = this.time.addEvent({
            delay: 5000, // Increment score every 1000 milliseconds (1 second)
            callback: this.UpdateGameSpeed,
            callbackScope: this,
            loop: true
        });
    }
    SetupPoints() {
        this.points = this.add.text(this.screenCenterX, this.screenHeight/30, "", {
            fontFamily: 'JetBrains Mono',
        }).setDepth(2).setFontSize(28).setOrigin(0.5,0).setColor("#66F0D7").setDepth(10);
        
    }

    UpdateScore() {
        this.score += 1;
        this.updateScoreText();

        // Decrease the delay for the next iteration
        let nextDelay = this.scoreTimer.delay - this.decreaseAmount;
        if (nextDelay > 50) {
            // Recreate the timer with the new delay
            this.scoreTimer.remove(false); // Remove the current timer without clearing the callback
            this.scoreTimer = this.time.addEvent({
                delay: nextDelay,
                callback: this.UpdateScore,
                callbackScope: this,
                loop: true
        });
        }
    }
    update(time: number, delta: number): void {

        if(this.cursorIsBeingHeld === false && this.gameEnded === false) {
            this.triggerEndGame();
        }
    }

    updateScoreText() {
        this.points.setText("Distance: " + this.score + " m");
    }

    UpdateGameSpeed() {
        this.gameSpeed += 40;
        var velocity = this.gameSpeed;
        this.obstacles.forEach(function (obstacle) {
            obstacle.setVelocityY(velocity);
        });
        this.stripes.forEach(function(stripe) {
            stripe.setVelocityY(velocity);
        });
        this.marginObstacles.forEach(function(stripe) {
            stripe.setVelocityY(velocity);
        });
    }

    SpawnRoad(){

            // Create and position the trash item
            const roadLine = this.physics.add.sprite(
                this.screenCenterX,
                - 96, // spawner lige over browser vinduet
                'roadline'
            ).setDepth(1);

            const spawnline = this.physics.add.sprite(this.screenCenterX, 128, 'spawnline').setOrigin(0.5, 0);


        //  // Move the trash down
        roadLine.setVelocity(0, (this.gameSpeed));
        this.stripes.push(roadLine);

        this.physics.add.overlap(roadLine, spawnline, () => {
        this.LoopRoadSpawn(spawnline);
    });
    }

    SpawnMargin() {

        // Create and position the margin item
        const haybaleLeft = this.physics.add.sprite(
            32,
            - 32, // spawner lige over browser vinduet
            'haybale'
        ).setDepth(1);

        const haybaleRight = this.physics.add.sprite(
            this.screenWidth-32,
            - 32, // spawner lige over browser vinduet
            'haybale'
        ).setDepth(1);
        
        haybaleLeft.setVelocity(0, (this.gameSpeed));
        haybaleRight.setVelocity(0, (this.gameSpeed));

        const spawnline = this.physics.add.sprite(this.screenCenterX, 64, 'spawnline').setOrigin(0.5, 0);

        this.marginObstacles.push(haybaleLeft);
        this.marginObstacles.push(haybaleRight);

        this.physics.add.overlap(haybaleRight, spawnline, () => {
            this.LoopMarginSpawn(spawnline);
        });
        
    }

    LoopRoadSpawn(spawnline: Phaser.Physics.Arcade.Sprite) {
        spawnline.destroy(); // Destroy the spawnline sprite
        this.SpawnRoad();
    }

    LoopMarginSpawn(spawnline: Phaser.Physics.Arcade.Sprite) {
        
        spawnline.destroy(); // Destroy the spawnline sprite
        this.SpawnMargin();
    }

    LoopObstacleSpawn(spawnline: Phaser.Physics.Arcade.Sprite) {
        spawnline.destroy(); // Destroy the spawnline sprite
        this.SpawnObstacles();
    }
    
    SpawnObstacles() {
        // Array containing filenames of the images
        const obstacleImages = ['tire', 'haybale', 'cone'];

        // Randomly select an image filename from the array
        const randomImage = Phaser.Math.RND.pick(obstacleImages);

        // Create and position the trash item
        const obstacleObject = this.physics.add.sprite(
            Phaser.Math.Between(32, this.screenWidth-32),
            - 32, // spawner lige over browser vinduet
            randomImage
        ).setDepth(3).setScale(1);

        const spawnline = this.physics.add.sprite(this.screenCenterX, this.screenCenterY, 'spawnline').setOrigin(0.5, 0);

        // Move the trash downwards
        obstacleObject.setVelocity(0, (this.gameSpeed));
        obstacleObject.body.setSize()

        this.obstacles.push(obstacleObject);

        this.physics.add.overlap(obstacleObject, spawnline, () => {
            this.LoopObstacleSpawn(spawnline);
        });
   }

    SetupPlayer() {
        this.player = this.add.tileSprite(this.screenCenterX, this.playerPositionY, 128, 128, 'player').setDepth(4);
        this.physics.add.existing(this.player, false);
        this.physics.world.enable(this.player);
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        playerBody.setSize(98, 98, true); // Set smaller body size for collision
        this.player.body = playerBody;
        this.player.setVisible(false);
    }

    SetupCollision() {
        this.physics.add.overlap(this.player, this.obstacles, this.triggerEndGame);
    }
    
    SetCursorHoldTrue = () => {
        this.cursorIsBeingHeld = true;
        console.log(this.cursorIsBeingHeld);
    }

    SetCursorHoldFalse = () =>{
        this.cursorIsBeingHeld = false;
        console.log(this.cursorIsBeingHeld);
    }

    triggerEndGame = () => {
        if(this.gameEnded === false) {
            this.crash.play();
            console.log("BALLS!");
            this.endGame();
        }
        this.gameEnded = true;
    }

    endGame = () => {
        this.cameras.main.fadeOut(1500, 0, 0, 0);
        this.scoreTimer.remove();
        this.SetCursorHoldFalse();

        console.log("game ended! Your Score: " + this.score);
        EventBus.emit('score', this.score);

        this.time.addEvent({
            delay: 2000, 
            callback: function() {
                EventBus.emit('gameHasEnded', true);
            },
            callbackScope: this,
            loop: false
        });
        
    }


    MovePlayer() {

        
        
        this.input.on('pointerdown', this.SetCursorHoldTrue);
        this.input.on('pointerup', this.SetCursorHoldFalse);
        this.input.on('pointerdown', this.StartGame);

        this.updatePlayerPosition = function(pointer: Phaser.Input.Pointer) {
            this.player.x = pointer.x;
            this.player.y = pointer.y;
            // Call this function recursively to keep updating player position until pointer is released
            if (this.cursorIsBeingHeld) {
                requestAnimationFrame(() => {
                    this.updatePlayerPosition(pointer);
                });
            }
        }
        // Add pointer down event to keep moving the player towards the pointer even when the pointer is still
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Call the update function to start moving the player towards the pointer
            this.updatePlayerPosition(pointer);
        }, this);

    }

}
