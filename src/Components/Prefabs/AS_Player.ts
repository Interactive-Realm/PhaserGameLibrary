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

	public SetInvicible = () => {
		this.invincible = !this.invincible;
	}

	PlayerInvincibility(){
        this.SetInvicible();
        this.setVisible(false);
        this.scene.time.addEvent({delay: 500, callback: this.PlayerBlink, repeat: 6})
        this.scene.time.addEvent({delay: 3000, callback: this.SetInvicible.bind(this)})

    }

    PlayerBlink = () => {
        this.setVisible(!this.visible);
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




