export const preloadFont = (url, name) => {
	return new Promise((resolve, reject) => {
		const font = new FontFace(name, `url(${url})`);
		font.load().then((loadedFont) => {
			document.fonts.add(loadedFont);
			resolve(loadedFont);
		});
	});
};
export const preloadImage = (url) => {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.src = url;
		image.onload = () => {
			resolve(image);
		};
		image.onerror = reject;
	});
};
