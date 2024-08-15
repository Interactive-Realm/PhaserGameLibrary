import Phaser, { Game, GameObjects, Physics } from "phaser";

export default class PlayerMovement {

    private playerObject: Physics.Arcade.Sprite;
    private scene: Phaser.Scene;
    private cursorHeld: boolean;
    updatePlayerPosition: Function;
    private pointerRef: any;
    
    constructor(gameObject: Physics.Arcade.Sprite, scene: Phaser.Scene) {
        this.playerObject = gameObject;
        this.scene = scene;
        this.pointerRef = Phaser.Math.Vector2;
    }

    SetCursorHoldTrue = () => {
        this.cursorHeld = true;
        console.log(this.cursorHeld);
    }

    SetCursorHoldFalse = () =>{
        this.cursorHeld = false;
        console.log(this.cursorHeld);
    }

    MovementMouseXY(inputtype: string) {
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
        this.scene.input.on(inputtype, (pointer: Phaser.Input.Pointer) => {
            // Call the update function to start moving the player towards the pointer
            this.updatePlayerPosition(pointer);
        }, this);

    }

    MovementMouseX() {
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


    MovementMouseXYDrag(){
        
        // Add pointer down event to keep moving the player towards the pointer even when the pointer is still
        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {

            this.pointerRef.x = pointer.worldX;
            this.pointerRef.y = pointer.worldY;
            
            // Call the update function to start moving the player towards the pointer
            this.scene.physics.moveToObject(this.playerObject, this.pointerRef, 200, 300);
            
        }, this);        
 
    }

    update(time: number, delta: number){

        const tolerance = 4;

        const distance = Phaser.Math.Distance.Between(this.playerObject.x,this.playerObject.y,this.pointerRef.x,this.pointerRef.y)
    
                if (distance < tolerance)
                {
                    this.playerObject.body?.reset(this.pointerRef.x, this.pointerRef.y);
                }

        
            
    }
}