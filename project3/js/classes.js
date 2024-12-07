class Alien extends PIXI.Sprite {
    constructor(texture, x = 0, y = 0) {
        super(texture);
        this.anchor.set(0.5, 0.5);
        this.x = x;
        this.y = y;
        this.fwd = getRandomUnitVector();
        this.speed = 200;
        this.isTarget = false;
    }

    // moves the alien over time in the direction it is facing
    move(dt = 1/60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    // Flips the x direction of the forward vector
    reflectX() {
        this.fwd.x *= -1;
    }

    // flips the y direction of the forward vector
    reflectY() {
        this.fwd.y *= -1;
    }
}