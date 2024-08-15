import Phaser, { Physics } from 'phaser'

export default class EnemyPrefab extends Phaser.Physics.Arcade.Sprite
{
	public health: number;
	public lastFired: number;
	public prefabBody: Physics.Arcade.Body;
	enemyType: number;

	constructor(scene: Phaser.Scene, x: number, y: number, image: string)
	{
		super(scene, x, y, image)
		this.SetupEnemy();
	}

	SetupEnemy(){

		this.lastFired = 0;
		this.health = this.enemyType;
		
		this.scene.add.existing(this);

		this.scene.physics.world.enable(this);
		this.prefabBody = this.body as Physics.Arcade.Body;

	}

	public GetHP(){
		return this.health;
	}


	public EnemyHit(){
		this.health -= 1;
		if(this.health = 0) this.KillEnemy();
	}

	public KillEnemy(){
		this.destroy();
	}
}

Phaser.GameObjects.GameObjectFactory.register(
	'enemyprefab',
	function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, image: string) {
		const playerprefab = new EnemyPrefab(this.scene, x, y, image);
		this.displayList.add(playerprefab);
		this.updateList.add(playerprefab);

		return playerprefab;
	}
)
