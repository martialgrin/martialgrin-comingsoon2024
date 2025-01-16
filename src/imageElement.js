export const imageElement = (images, ctx, x, y, w, h, imageNum) => {
	let image = images[imageNum];
	let opacity = 100;

	const updateImage = () => {
		imageNum = (imageNum + 1) % images.length;
	};

	const loop = (frame) => {
		// opacity -= 0.5;
		ctx.save();
		// ctx.globalAlpha = opacity / 100;
		ctx.translate(x, y);
		ctx.rotate(frame / 1000);
		ctx.drawImage(image, -w / 2, -h / 2, w, h);
		ctx.restore();
	};

	return {
		updateImage,
		loop,
	};
};
