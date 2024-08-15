import Phaser, { Physics } from 'phaser'

export default class PlayerPrefab extends Phaser.Physics.Arcade.Sprite
{
	public health: number;
	public lastFired: number;
	public prefabBody: Physics.Arcade.Body;

	invincible: boolean;
	missiles: number;

	constructor(scene: Phaser.Scene, x: number, y: number, image: string)
	{
		super(scene, x, y, image)
		this.SetupPlayer();
	}

	SetupPlayer(){

		this.missiles = 0;
		this.lastFired = 0;

		this.scene.add.existing(this);

		this.scene.physics.world.enable(this);
		this.prefabBody = this.body as Physics.Arcade.Body;

		this.invincible = false;
	}


	// Called from game when player has been hit, deducted one HP and sets a post damage invincibility state for 3 seconds
	PlayerHit(){
		this.health -= 1
		this.PlayerInvincibility();
	}

	PlayerInvincibility(){
        this.SetStateInvincible();																	// Set Invincibility boolean to the opposet of what it currently is																	
        this.PlayerBlink();																			// Initial blink
        this.scene.time.addEvent({delay: 500, callback: this.PlayerBlink, repeat: 6}) 				// Makes the player blink during the duration of the invincibility state
        this.scene.time.addEvent({delay: 3000, callback: this.SetStateInvincible.bind(this)})		// Sets the invincibility state to false after 3 seconds
    }

	SetStateInvincible = () => {
		this.invincible = !this.invincible;
	}

    PlayerBlink = () => {
        this.setVisible(!this.visible);
    }

}





