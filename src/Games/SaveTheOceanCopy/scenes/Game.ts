import { EventBus } from '../../../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    private gameStarted: boolean;
    private lastTrashSpawnTime: number;
    private trashSpawnInterval: number;
    private lastBubbleSpawnTime: number;
    private bubbleSpawnInterval: number;
    private timer: Phaser.Time.TimerEvent;
    private initialTime: number;
    private timerLabel: Phaser.GameObjects.Text;
    private scoreLabel: Phaser.GameObjects.Text;
    private screenCenterX: number;
    private screenCenterY: number;
    private screenWidth: number;
    private screenHeight: number;
    private score: number;
    private timeLeft_SideMargin: number;
    private timeLeft_TopMargin: number;
    private score_SideMargin: number;
    private score_TopMargin: number;
    private introCountdownEnabler: boolean;

    constructor ()
    {
        super('Game');

        // Booleans
        this.gameStarted = false;

        // Spawnvariables
        this.lastTrashSpawnTime = 0;
        this.trashSpawnInterval = 200; // in milliseconds
        this.lastBubbleSpawnTime = 0;
        this.bubbleSpawnInterval = 400;

        // Timer variables
        this.timer;
        this.initialTime = 5; // in seconds
        this.timerLabel;

        // UI variables
        this.scoreLabel;
        this.timeLeft_SideMargin = 200;
        this.score_SideMargin = 150;
        this.timeLeft_TopMargin = 100;
        this.score_TopMargin = 100;

        // Set true to enable intro countdown
        this.introCountdownEnabler = true;
    }

    preload() {
        // Center of screen
        this.screenCenterX = (this.sys.game.config.width as number) / 2;
        this.screenCenterY = (this.sys.game.config.height as number) / 2;
        this.screenWidth = this.sys.game.config.width as number;
        this.screenHeight = this.sys.game.config.height as number;
    }
    
    init(data: any) {
        // Score variable
        this.score = 0;
    }

    create()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x002B5B);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.2);
        this.background.flipY=true;

        this.scoreLabel = this.add.text(this.screenWidth - this.score_SideMargin, 0 + this.score_TopMargin, 'SCORE: ' + this.score)
        .setFontSize(40).setColor('black').setOrigin(0.5, 0.5).setVisible(false);
        
        this.timerLabel = this.add.text(0 + this.timeLeft_SideMargin, 0 + this.timeLeft_TopMargin, 'TIME LEFT: ' + this.formatTime(this.initialTime))
        .setFontSize(40).setColor('black').setOrigin(0.5, 0.5).setVisible(false);

         // Tutorial text objects
         const tutorialText1 = this.add.text(this.screenCenterX, 510, 'This is how you play:', {
            fontFamily: 'DIN',
            color: '#97FEED',
            fontSize: '40px',
            fontStyle: 'bold'
        }).setDepth(1).setOrigin(0.5, 0.5);

        const tutorialText2 = this.add.text(this.screenCenterX, 560, 'Click on the falling trash, to remove it from the ocean.', {
            fontFamily: 'DIN',
            color: '#97FEED',
            fontSize: '30px',
            fontStyle: 'normal'
        }).setDepth(1).setOrigin(0.5, 0.5);

        // Start game button
        const startButton = this.add.text(this.screenCenterX, this.screenCenterY, 'Start game', {
            fontFamily: 'DIN',
            color: 'black',
            fontSize: '40px',
            fontStyle: 'bold'
        }).setDepth(1).setOrigin(0.5, 0.5);

        startButton.setInteractive().on('pointerdown', () => {
            tutorialText1.destroy();
            tutorialText2.destroy();
            startButton.destroy();
            //this.scene.launch('gamecountdown');
            if(this.introCountdownEnabler === false) {
            this.gameStarted = true;
            this.scoreLabel.setVisible(true);
            this.startCountdown();
            }
            else {
                this.scene.launch('GameCountdown')
            }
        });


        // Enable fullscreen button
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-F', () => {
                if (this.scale && this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                } else if (this.scale) {
                    this.scale.startFullscreen();
                }
            }, this);
        }
        
        EventBus.on('introCountdown_HasRun', (data: boolean) => {
            console.log("GameScene: countdown ended!");
            if (data === true) {
                this.gameStarted = true;
                this.scoreLabel.setVisible(true);
                this.startCountdown();
            }
        });
        //EventBus.emit('current-scene-ready', this);
    }

    // Receive data from game countdown, then start the game
    // receiveData(data: boolean) {
    //     console.log("countdown ended!");
    //     if (data === true) {
    //         this.gameStarted = true;
    //         this.scoreLabel = this.add.text(this.screenWidth - this.score_SideMargin, 0 + this.score_TopMargin, 'SCORE: ' + this.score)
    //         .setFontSize(40).setColor('black').setOrigin(0.5, 0.5);
    //         this.startCountdown();
    //     }
    // }

    update(time: number, delta: number) {
        if (this.gameStarted === true) {
            // Spawn trash, if game has started
            if (time - this.lastTrashSpawnTime > this.trashSpawnInterval) {
                this.spawnTrashObject();
                this.lastTrashSpawnTime = time;
            }
        }

        // Spawn bubbles
        if (time - this.lastBubbleSpawnTime > this.bubbleSpawnInterval) {
            this.spawnBubbleObject();
            this.lastBubbleSpawnTime = time;
        }
    }

    // Bubble spawner
    spawnBubbleObject() {
        const bubbleObject = this.add.image(
            Phaser.Math.Between(0, this.screenWidth),
            this.sys.game.config.height as number + 120, // spawner lige under spilvinduet
            'bubble'
        ).setDepth(0).setScale(this.FloatBetween(0.05, 0.2));

        this.physics.add.existing(bubbleObject);
        const bubbleBody = bubbleObject.body as Phaser.Physics.Arcade.Body;

    bubbleBody.setVelocity(0, 100);

    bubbleBody.setVelocityY(Phaser.Math.Between(-50, -200)); // Vertical velocity

    // Optional: Add damping to gradually slow down rotation and movement
    bubbleBody.angularDrag = 0.95;
    bubbleBody.drag.set(0.95);

    // Set opacity (e.g., 0.5 for half-transparent)
    bubbleObject.setAlpha(0.4);

    // Define the movement range
    const moveDistance = 20; // Distance the object will move
    const moveDuration = 2000; // Duration of each movement (in milliseconds)

    // Create the tween
    const tweenRight = this.tweens.add({
        targets: bubbleObject,
        x: bubbleObject.x + moveDistance,
        duration: moveDuration,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1 // -1 means repeat indefinitely
    });
    }

    private FloatBetween(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
    // Trash spawner
    spawnTrashObject() {
        
        // Array containing filenames of the images
        const trashImages = ['knife', 'fork', 'bottle'];


        // Randomly select an image filename from the array
        const randomImage = Phaser.Math.RND.pick(trashImages);

        // Create and position the trash item
        const trashObject = this.add.image(
            Phaser.Math.Between(0, this.screenWidth),
            0 - 64, // spawner lige over browser vinduet
            randomImage
        ).setDepth(4).setScale(1);

        this.physics.add.existing(trashObject);

        const balloonBody = trashObject.body as Phaser.Physics.Arcade.Body;
        // Move the trash down
        balloonBody.setVelocity(0, Phaser.Math.Between(+175, +215));

        trashObject.setInteractive();
        let Bundesen = trashObject.texture.key;
        if(Bundesen === "fork") {
            console.log("Bundesen in the House!")
            trashObject.setScale(0.2);
        }

        // Listen for the pointerdown event
        trashObject.on('pointerdown', () => {
            trashObject.destroy();
            // Increment the score
            this.score += 1;
            // Update the score label
            this.scoreLabel.setText('SCORE: ' + this.score);
        });
    }

    startCountdown() {
        console.log("starting countdown!");
        // Display the initial time
        
        this.timerLabel.setVisible(true);
        // Create a countdown timer
        this.timer = this.time.addEvent({
            delay: 1000, // 1 second
            repeat: this.initialTime - 1, // Repeat the event `initialTime` times (initialTime - 1 because we're already displaying the initial time)
            callback: this.onTimerTick,
            callbackScope: this,
        });
    }

    onTimerTick() {
        // Update the displayed time
        this.timerLabel.setText('TIME LEFT: ' + this.formatTime(this.timer.repeatCount));

        // Check if the timer has reached 0
        if (this.timer.repeatCount === 0) {
            this.gameStarted = false;
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                // Add delay before end screen
                this.time.addEvent({
                    delay: 500,
                    callback: () =>{
                        this.endGame();
                    },
                    loop: false
                })
                
            })
        }
    }

    endGame = () => {
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

    formatTime(seconds: number): string {
        // Format the time as mm:ss
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
}
