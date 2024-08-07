import { GameObjects, Scene, Physics, Animations, Input } from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    parallaxFloorReferenceSize: GameObjects.Image;
    gameWidth: number;
    gameHeight: number;
    floorPlacement: number;

    player: Physics.Arcade.Sprite;

    scoreLabel: GameObjects.Text;

    gravity: number; // Player gravity
    pipeSpeed: number; // Pipe movement speed
    flappingPower: number; // Increase minus number for harder flapping
    pipeDistance: number; // Higher number = shorter distance
    upwardsRotation: number; // Player rotation when flapping
    downwardsRotation: number; // End rotation when falling
    pipeSpawnDistance: number; // lower number = shorter distance
    paraFloor: GameObjects.TileSprite;

    tutorialText: GameObjects.Text;
    tutorialTextHeight: number;
    tutorialTextWidth: number;

    spacebar: Input.Keyboard.Key;

    pipes: Physics.Arcade.Group;
    pointTriggers: Physics.Arcade.Group;
    vertKillLines: Physics.Arcade.Group;

    // Booleans
    gameStarted: boolean;
    gravitySet: boolean;
    loadedFont: boolean;

    score: number;

    pipeRemovalLine: GameObjects.Image;

    constructor ()
    {
        super('Game');
    }

    preload()
    {
        this.floorPlacement = 1;

        // Gameplay variables
        this.gravity = 3800; // Player gravity
        this.pipeSpeed = -380; // Pipe movement speed
        this.flappingPower = -1100; // Increase minus number for harder flapping
        this.pipeDistance = 0.685; // Higher number = shorter distance
        this.upwardsRotation = -0.0; // Player rotation when flapping
        this.downwardsRotation = 0; // End rotation when falling
        this.pipeSpawnDistance = 1.4; // lower number = shorter distance

        this.gameHeight = this.sys.game.config.height as number;
        this.gameWidth = this.sys.game.config.width as number;

        this.tutorialTextHeight = 300;
        this.tutorialTextWidth = 780;
        this.score = 0;

        

        // Booleans
        this.gameStarted = false; 
        this.gravitySet = false;
        this.loadedFont = false;
        this.gameStarted = false;
    }

    create ()
    {

        // Added this picture outside of screen view, to reference size of the parafloor tilesprite
        
        this.SetupUI();

        this.SetupTutorial();

        this.SetupFloor();

        this.SetupPipes();

        this.SetupPlayer();     

    }

    update(delta: number)
    {
        // calculate parallax movement over time
        let parallaxMovement = this.pipeSpeed * (delta / 1000);

        // Move floor in a way that creates the parallax effect
        this.paraFloor.tilePositionX = -parallaxMovement;



        //Check player velocity to determine direction
        if (this.player.body?.velocity.y! < 0) { // moving up
            this.player.rotation += this.upwardsRotation;
            this.player.setFrame(5); // Setting player sprite to animation frame #5 
        } else if (this.player.body?.velocity.y! > 0) { // moving down
            let startRotation = this.player.rotation; // Start rotation for lerp
            let endRotation = this.downwardsRotation; // Endrotation for lerp
            this.player.setFrame(0); // Setting player sprite to animation frame #0 
            if(this.player.body?.velocity.y! < 0) {
                startRotation = this.upwardsRotation; // Resetting rotation when going from moving up, to moving down
            }
            this.player.rotation = this.lerp(startRotation, endRotation, delta / 500); // Lerping downward rotation over time
        }
    }

    

    SetupFloor(){
        // Added this picture outside of screen view, to reference size of the parafloor tilesprite
        this.parallaxFloorReferenceSize = this.add.image(-400,-400, 'Floor');

        // Floor tilesprite
        this.paraFloor = this.add.tileSprite(0,0,this.parallaxFloorReferenceSize.width, this.parallaxFloorReferenceSize.height, "Floor");
        this.paraFloor.setOrigin(0.5, 0.5).setPosition(this.gameWidth/2,(this.sys.game.config.height as number) / this.floorPlacement).setDepth(1);
        this.physics.add.existing(this.paraFloor);
    }

    SetupPlayer(){
        // Add player
        this.player = this.physics.add.sprite(this.sys.game.config.width as number / 4, this.sys.game.config.height as number / 2, 'Bird');
        this.player.setScale(1).setOrigin(0.5, 0.5).setGravityY(0);

        // Player animation setup
        this.anims.create({
            key: 'introFlap',
            frames: this.anims.generateFrameNumbers('Spritesheet', { start: 0, end: 7}),
            frameRate: 9
        });

        // Play player intro animation
        this.player.anims.play({ key: 'introFlap', repeat: Infinity });

        // PLAYER CONTROLS

        // On screen point click to flap (touch on mobile, mouse click on PC)
        this.input.on('pointerdown', this.flap.bind(this));

        // PLAYER COLLISION

        // Player and pipe collision
        this.physics.add.overlap(this.player, this.pipes, this.endGame);
        // Player and vertical kill line collision
        this.physics.add.overlap(this.player, this.vertKillLines, this.endGame);
        // Player and floor collision
        this.physics.add.overlap(this.player, this.paraFloor, this.endGame);
        // Player and point trigger collision
        this.physics.add.overlap(this.player, this.pointTriggers, this.pointTriggerCollision.bind(this));
    }

    SetupUI(){
        // Score label
        this.scoreLabel = this.add.text(this.gameWidth /2 , this.gameHeight/ 8, this.score.toString(), {
            fontSize: '60px',
            align: 'center',
        }).setOrigin(0.5, 0.5).setDepth(2).setStroke('black', 10).setFontFamily('bulkypix');   

        console.log(this.scoreLabel.text)
        this.pointTriggerCollision
    }

    SetupTutorial(){
        this.tutorialText = this.add.text(this.gameWidth/2, this.gameHeight/2.5, 'Klik på skærmen for at flagre. \n Undgå at ramme tuberne. \n Se hvor mange point du kan opnå.',
        { 
            fixedWidth: this.tutorialTextWidth, 
            fixedHeight: this.tutorialTextHeight, 
            wordWrap: { width: this.gameWidth/2, useAdvancedWrap: true } 
        }
        ).setFontSize(40).setFontStyle('bold').setColor('#12372A').setDepth(3).setOrigin(0.5, 0.5).setStroke('#FBFADA', 3);
    }

    SetupPipes(){
        // Pipe array
        this.pipes = this.physics.add.group();
        // Point trigger array
        this.pointTriggers = this.physics.add.group();
        this.vertKillLines = this.physics.add.group();

        // Vertical line to remove redundant pipes
        this.pipeRemovalLine = this.add.image(-150, this.sys.game.config.height as number / 2, 'PipeSpawnInterval').setOrigin(0.5, 0.5);
        this.physics.add.existing(this.pipeRemovalLine);
        this.physics.add.overlap(this.pipeRemovalLine, this.pipes, this.removeUsedPipes);
    }

    // Bird flap upwards
    flap() {
        // Start game upon first flap
        if(this.gameStarted == false) { 
        this.pipespawner(); // Spawn pipes - pipes are added to the pipe array in pipespawner() function
        this.tutorialText.destroy();
        }
        this.gameStarted = true; // gameStarted boolean makes sure pipespawner() is only called once
        this.player.setVelocityY(this.flappingPower); // Flap motion
        this.player.stop(); // Stop intro animation
        this.player.setFrame(0); // Set player sprite to first frame in animation

        // Booleans for activating gameplay and setting player gravity
        if( this.gameStarted == true && this.gravitySet == false) {
            this.player.setGravityY(this.gravity);
            this.gravitySet = true;
            console.log("Setting gravity");
        }
    }
    
    // Lerp over time function
    lerp(start: number, end: number, t: number) {
        return start * (1 - t) + end * t;
    }

     // Spawn the pipes
     pipespawner() {

        // A vertical invisible line that determines the pipe spawn interval
        const pipeDistance = this.physics.add.image(this.gameWidth / this.pipeSpawnDistance, this.gameHeight / 2, 'PipeSpawnInterval');
        
        // Set top pipe position at random y coordinate
        const pipeTop = this.add.image(this.gameWidth + 64, Phaser.Math.Between(64, this.gameHeight-600), 'PipeTop');
        pipeTop.setOrigin(0.5, 1);
        console.log(pipeTop);
        
        // Set bottom pipe position, according to top pipe y coordinate
        const pipeBot = this.add.image(this.gameWidth + 64, pipeTop.y + pipeTop.displayHeight, 'PipeBot');
        pipeBot.setOrigin(0.5, this.pipeDistance);

        // Point trigger vertical line object
        const pointTrigger = this.add.image(this.gameWidth + 64, this.gameHeight / 2, 'PipeSpawnInterval');

        // Vertical kill line above top pipes
        const vertKillLine = this.add.image(this.gameWidth + 64, 0, 'Killline').setOrigin(0.5, 1);

        // Adding pipes to array 'pipes'
        this.pipes.add(pipeTop);
        this.pipes.add(pipeBot);
        this.pointTriggers.add(pointTrigger);
        this.vertKillLines.add(vertKillLine);

        // Add physics
        this.physics.add.existing(pipeTop);
        this.physics.add.existing(pipeBot);
        this.physics.add.existing(pointTrigger);
        this.physics.add.existing(vertKillLine);

        const pipeTopBody = pipeTop.body as Physics.Arcade.Body;
        const pipeBotBody = pipeBot.body as Physics.Arcade.Body;
        const pointTriggerBody = pointTrigger.body as Physics.Arcade.Body;
        //const vertKillLine = pipeBot.body as Physics.Arcade.Body;

        // Move pipes
        pipeTopBody.setVelocityX(this.pipeSpeed);
        pipeBotBody.setVelocityX(this.pipeSpeed);
        // Move point trigger
        pointTriggerBody.setVelocityX(this.pipeSpeed);
        // Move vertical kill line
        //vertKillLine.body.setVelocityX(this.pipeSpeed);

        // Recall pipespawner from the callback function pipeSpawn, which is called once the toppipe collides with the invisible pipedistance-line.
        this.physics.add.overlap(pipeDistance, pipeTop, this.pipeSpawn, null, this);
    }

    // Callback function that calls pipespawner(), thus spawning more pipes.
    pipeSpawn(pipeDistanceLine) {
        console.log("pipespawn")
        pipeDistanceLine.destroy(); // Removes invisible pipe distance line
        this.pipespawner(); // Creates a new pipe
    }

        // Callback function that handles player / pipe collision detection
    pointTriggerCollision(player, pointTrigger){
        
        player;
        pointTrigger.destroy(); // Removes point trigger
        this.score++; // Incrementing score        
        this.scoreLabel.setText(this.score.toString()); // Showcasing score
        
    }

    // Callback function for removing redundant pipes outside of screen
    removeUsedPipes(pipes) {
        pipes.destroy();
        console.log("removed pipes");
    }

    // Game end
    endGame = () => {
        console.log("Game Start: " + this.gameStarted);
        if(this.gameStarted){
            this.gameStarted = false; // Resetting boolean for new game
            this.gravitySet = false; // Resetting boolean for new game
            console.log("Game Start: " + this.gameStarted);
    
            this.cameras.main.fadeOut(1500, 0, 0, 0);
    
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
        }
       
    

}
