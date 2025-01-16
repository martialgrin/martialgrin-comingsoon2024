import { Sprite } from "pixi.js";

export const spriteElement = (images, x, y, scale, imagesNum) => {
	let imageNum = 0;
	let image = images[imagesNum];
	const sprite = new Sprite({
		texture: image,
		x,
		y,
		width: scale / 2,
		height: scale / 2,
		anchor: 0.5,
	});
	const updateImage = () => {
		imageNum = (imageNum + 1) % images.length;
		sprite.texture = images[imageNum];
	};

	const loop = (time) => {
		sprite.rotation = time * 0.001;
	};

	return {
		sprite,
		updateImage,
		loop,
	};
};
