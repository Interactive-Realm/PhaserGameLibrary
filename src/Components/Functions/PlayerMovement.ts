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
}