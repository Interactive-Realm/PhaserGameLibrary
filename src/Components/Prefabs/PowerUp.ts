import PlayerPrefab from "./AS_Player";

export default class PowerUp extends Phaser.GameObjects.Sprite
{
    speed: number;
    born: number;
    direction: number;
    xSpeed: number;
    ySpeed: number;

    constructor (scene: Phaser.Scene, x: number, y: number, texture: string)
    {
        super(scene, x, y, texture);
        this.speed = 0.5;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.scene.add.existing(this);
        
		this.scene.physics.world.enable(this);
    }

    ActivatePowerUp(powerUpType: string, playerRef: PlayerPrefab){
        
        switch(powerUpType){
            case "Missile":
                playerRef.missiles += 1;
                break;
                
            case "GunType1":
                break;

            case "GunType2":
                break;

            case "HP":
                playerRef.health += 1;
                break;
            
            case "Shield":
                break;
        }

        this.destroy();
    }

    
    update (time: number, delta: number)
    {

    }
}