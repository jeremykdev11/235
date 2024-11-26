class Ship extends PIXI.Sprite {
    constructor(texture, x = 0, y = 0 ) {
        super(texture);
        this.anchor.set(0.5, 0.5); // position, scaling, rotating etc are now from center of sprite
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
    }
}