import Phaser from 'phaser';
import { EventBus } from '../EventBus';

export class GameCountdown extends Phaser.Scene {
    private countdownText!: Phaser.GameObjects.Text;
    private countdownValue: number = 4;
    private countDownEnded: boolean = false;

    constructor() {
        super('GameCountdown');
    }

    preload() {
        // this.load.audio('countdownbeep', CountdownBeep);
        // this.load.audio('countdownbeep_high', CountdownBeep_High);
    }

    create() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        // Display the countdown text
        this.countdownText = this.add.text(screenCenterX, screenCenterY, '').setColor('#8FE3CF');

        // Set up a repeating event to update the countdown every second
        this.time.addEvent({
            delay: 1000,
            callback: this.updateCountdown,
            callbackScope: this,
            repeat: this.countdownValue - 1
        });

        this.countDownEnded = false;
    }

    update() {
        // Your game logic goes here
    }

    updateCountdown() {
        if (!this.countdownText) return;

        this.countdownText.setOrigin(0.5, 0.5).setFontSize(82);
        // const countdownBeep = this.sound.add('countdownbeep');
        // const countdownBeep_high = this.sound.add('countdownbeep_high');
        this.countdownValue--;

        if (this.countdownValue === 3) {
            // Update the countdown text
            // countdownBeep.play();
            this.countdownText.setText("KLAR");
        } else if (this.countdownValue === 2) {
            // countdownBeep.play();
            // Update the countdown text
            this.countdownText.setText("PARAT");
        } else if(this.countdownValue === 1) {
            // countdownBeep_high.play();
            // Update the countdown text
            this.countdownText.setText("START").setColor('white');
        } else {
            this.countdownText.destroy();

            this.countDownEnded = true;
            
            EventBus.emit('introCountdown_HasRun', true);
            
            console.log("countdown ended: GameCountdown!");
            this.countdownValue = 4;
            this.scene.stop();
        }
    }
}
