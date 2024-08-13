import Phaser, { GameObjects } from "phaser";

export default class PlayerMovement {

    private playerObject: GameObjects.Sprite;
    private scene: Phaser.Scene;
    private cursorHeld: boolean;
    updatePlayerPosition: Function;
    
    constructor(gameObject: GameObjects.Sprite, scene: Phaser.Scene) {
        this.playerObject = gameObject;
        this.scene = scene;
    }

    SetCursorHoldTrue = () => {
        this.cursorHeld = true;
        console.log(this.cursorHeld);
    }

    SetCursorHoldFalse = () =>{
        this.cursorHeld = false;
        console.log(this.cursorHeld);
    }

    MovePlayerXY() {
        this.scene.input.on('pointerdown', this.SetCursorHoldTrue);
        this.scene.input.on('pointerup', this.SetCursorHoldFalse);
        //this.scene.input.on('pointerdown', this.StartGame);

        this.updatePlayerPosition = function(pointer: Phaser.Input.Pointer) {
            this.playerObject.x = pointer.x;
            this.playerObject.y = pointer.y;
            


            // Call this function recursively to keep updating player position until pointer is released
            if (this.cursorHeld) {
                requestAnimationFrame(() => {
                    this.updatePlayerPosition(pointer);
                });
            }
        }
        // Add pointer down event to keep moving the player towards the pointer even when the pointer is still
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Call the update function to start moving the player towards the pointer
            this.updatePlayerPosition(pointer);
        }, this);

    }

    MovePlayerX() {
        this.scene.input.on('pointerdown', this.SetCursorHoldTrue);
        this.scene.input.on('pointerup', this.SetCursorHoldFalse);
        //this.scene.input.on('pointerdown', this.StartGame);

        this.updatePlayerPosition = function(pointer: Phaser.Input.Pointer) {
            this.playerObject.x = pointer.x;
            // Call this function recursively to keep updating player position until pointer is released
            if (this.cursorHeld) {
                requestAnimationFrame(() => {
                    this.updatePlayerPosition(pointer);
                });
            }
        }
        // Add pointer down event to keep moving the player towards the pointer even when the pointer is still
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Call the update function to start moving the player towards the pointer
            this.updatePlayerPosition(pointer);
        }, this);

    }

    MovePlayerXYDrag(playerSpeed: number, game: Phaser.Game){        
        this.scene.input.on('pointerdown', this.SetCursorHoldTrue);
        this.scene.input.on('pointerup', this.SetCursorHoldFalse);

        
        

        this.updatePlayerPosition = function(pointer: Phaser.Input.Pointer) {
            // Calculate the angle towards the pointer
            const distanceX = pointer.x - this.playerObject.x;
            const distanceY = pointer.y - this.playerObject.y;
            const angle = Math.atan2(distanceY, distanceX);
        
            // Calculate the velocity components
            const velocityX = Math.cos(angle) * playerSpeed;
            const velocityY = Math.sin(angle) * playerSpeed;
        
            // Update the player's position based on velocity
            this.playerObject.x += velocityX * game.loop.delta / 1000; // Delta time for smooth movement
            this.playerObject.y += velocityY * game.loop.delta / 1000;


            //const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
            // Call this function recursively to keep updating player position until pointer is released
            if (this.cursorHeld) {
                requestAnimationFrame(() => {
                    this.updatePlayerPosition(pointer);
                });
            }
        }
        //this.scene.physics.moveTo(this.playerObject,pointer)
        // Add pointer down event to keep moving the player towards the pointer even when the pointer is still
        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            
            // Call the update function to start moving the player towards the pointer
            this.scene.physics.moveToObject(this.playerObject,pointer,240);
            
        }, this);
        

    }
}