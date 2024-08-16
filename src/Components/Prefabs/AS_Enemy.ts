import Phaser, { Physics } from 'phaser'

export default class EnemyPrefab extends Phaser.Physics.Arcade.Sprite
{
	public health: number;
	public lastFired: number;
	public prefabBody: Physics.Arcade.Body;
	public enemyType: number;

	constructor(scene: Phaser.Scene, x: number, y: number, image: string, enemyType: number)
	{
		super(scene, x, y, image)
		
		this.enemyType = enemyType;
		this.SetupEnemy();
	}

	SetupEnemy(){

		this.lastFired = 0;
		this.health = this.enemyType;
		console.log(this.health);
		
		this.scene.add.existing(this);

		this.scene.physics.world.enable(this);
		this.prefabBody = this.body as Physics.Arcade.Body;

	}

	public GetHP(){
		return this.health;
	}


	public EnemyHit(){
		this.health -= 1;
		console.log("Enemy HP: " + this.health)
		if(this.health <= 0) this.KillEnemy();
	}

	public KillEnemy(){
		console.log("Enemy Destroyed")
		this.destroy();

	}
}

// Phaser.GameObjects.GameObjectFactory.register(
// 	'enemyprefab',
// 	function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, image: string) {
// 		const playerprefab = new EnemyPrefab(this.scene, x, y, image);
// 		this.displayList.add(playerprefab);
// 		this.updateList.add(playerprefab);

// 		return playerprefab;
// 	}
// )
