import Phaser from 'phaser'

export default class EnemyPrefab extends Phaser.Physics.Arcade.Sprite
{
	constructor(scene: Phaser.Scene, x: number, y: number, image: string)
	{
		super(scene, x, y, image)
	}
}

// SetupPlayer() {
//     this.player = this.add.tileSprite(this.screenCenterX, this.playerPositionY, 128, 128, 'player').setDepth(4);
//     this.physics.add.existing(this.player, false);
//     this.physics.world.enable(this.player);
//     const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
//     playerBody.setSize(98, 98, true); // Set smaller body size for collision
//     this.player.body = playerBody;
//     this.player.setVisible(false);
// }
