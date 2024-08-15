import Phaser, { Physics } from 'phaser'

export default class PlayerPrefab extends Phaser.Physics.Arcade.Sprite
{
	public health: number;
	public lastFired: number;
	public prefabBody: Physics.Arcade.Body;
	public invincible: boolean;
	constructor(scene: Phaser.Scene, x: number, y: number, image: string)
	{
		super(scene, x, y, image)
		this.lastFired = 0;
		this.scene.add.existing(this);
		this.scene.physics.world.enable(this);
		this.prefabBody = this.body as Physics.Arcade.Body;
		this.invincible = false;
	}


	// Called from game when player has been hit, deducted one HP and sets a post damage invincibility state for 3 seconds
	PlayerHit(){
		this.health -= 1
		if(this.health == 0) {
			
			//this.setVisible(false)
			this.destroy();
			return;
		};
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
		console.log(this.invincible);
	}

	// SetupPlayer() {
    // this.player = this.add.tileSprite(this.screenCenterX, this.playerPositionY, 128, 128, 'player').setDepth(4);
    // this.physics.add.existing(this.player, false);
    // this.physics.world.enable(this.player);
    // const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    // playerBody.setSize(98, 98, true); // Set smaller body size for collision
    // this.player.body = playerBody;
    // this.player.setVisible(false);
	// }
}

Phaser.GameObjects.GameObjectFactory.register(
	'playerprefab',
	function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, image: string) {
		const playerprefab = new PlayerPrefab(this.scene, x, y, image);
		this.displayList.add(playerprefab);
		this.updateList.add(playerprefab);

		return playerprefab;
	}
)




