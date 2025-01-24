import { imageElement } from "./imageElement";
import { preloadFont, preloadImage } from "./loader";
import { Application, Assets, Sprite } from "pixi.js";

import "./style.css";
import { spriteElement } from "./sprite";
import { inject } from "@vercel/analytics";

const MAX_IMAGES = 200;
const IMAGE_SIZE_MIN = 300;
const IMAGE_SIZE_MAX = 900;
const LERP_AMOUNT = 0.05;
const DELTA_MAP_MIN = 0.1;
const DELTA_MAP_MAX = 1;
const DELTA_THRESHOLD = 1000;
let R1 = Math.random() * 300;
let R2 = Math.random() * 300;
const main = async () => {
	let context,
		canvas,
		image,
		images,
		font,
		charactersSize,
		interval,
		timeoutAutomatic;
	const imagesArray = [];
	const spritesArray = [];
	let imageNum = 0;

	const app = new Application({
		width: window.innerWidth,
		height: window.innerHeight,
		resolution: window.devicePixelRatio || 1,
	});
	await app.init({ background: "#f0f0f0", resizeTo: window });
	document.body.appendChild(app.canvas);

	const pixelRatio = window.devicePixelRatio || 1;
	let width = window.innerWidth * pixelRatio;
	let height = window.innerHeight * pixelRatio;
	const startingPoint = { x: width / 2, y: height / 2 };
	let position = {
		mouse: { x: startingPoint.x, y: startingPoint.y },
		last: { x: startingPoint.x, y: startingPoint.y },
		current: { x: startingPoint.x, y: startingPoint.y },
	};

	const srcArray = [
		"/martial_7.png",
		"/martial.png",
		"/martial3.png",
		"/martial_6.png",
	];

	let delta = {
		current: 0,
		last: 0,
		mapped: 0,
		lerped: 0,
	};

	const preloadImages = async () => {
		const preload = srcArray.map((src) => preloadImage(src));
		return Promise.all([...preload]);
	};

	const updateNumImage = () => {
		console.log("updateNumImage");
		imageNum = (imageNum + 1) % images.length;
	};

	const init = async () => {
		images = await preloadImages();
		image = images[0];
		font = await preloadFont("/metrabold.otf", "metrabold");

		// Move the sprite to the center of the screen
		setInterval(() => {
			updateNumImage();
		}, 10000);

		window.addEventListener("pointerup", (ev) => {
			updateNumImage();
			mouseMove(ev);
		});
		window.addEventListener("pointermove", throttle(mouseMove, 50));
		// window.addEventListener("resize", onresizeHandler);
		changePositionHandler();
		loop();
	};

	const changePositionHandler = () => {
		position.mouse = changePositionTarget(width, height);
		interval = setInterval(() => {
			position.mouse = changePositionTarget(width, height);
		}, 2000);
	};

	const mouseMove = (event) => {
		const mouseX = event.clientX * pixelRatio;
		const mouseY = event.clientY * pixelRatio;
		position.mouse.x = mouseX;
		position.mouse.y = mouseY;
		clearInterval(interval);
		clearTimeout(timeoutAutomatic);
		timeoutAutomatic = setTimeout(changePositionHandler, 5000);
	};

	const loop = () => {
		app.ticker.add((time) => {
			if (spritesArray.length > MAX_IMAGES) {
				app.stage.removeChild(spritesArray[0].sprite);
				spritesArray.shift();
			}
			const sprite = spriteElement(
				images,
				position.current.x / 2,
				position.current.y / 2,
				map(delta.lerped, 0, 1, 0.3, 0.9),

				imageNum
			);
			app.stage.addChild(sprite.sprite);
			spritesArray.push(sprite);

			for (let i = 0; i < spritesArray.length; i++) {
				spritesArray[i].loop(performance.now() + i * 20);
			}
			updatePositionAndDelta();

			// console.log(time);
			// Just for fun, let's rotate mr rabbit a little.
			// * Delta is 1 if running at 100% performance *
			// * Creates frame-independent transformation *
		});
	};

	const updatePositionAndDelta = () => {
		position.last.x = position.current.x;
		position.last.y = position.current.y;
		delta.last = delta.current;
		delta.current =
			Math.abs(position.mouse.x - position.current.x) +
			Math.abs(position.mouse.y - position.current.y);

		delta.last = delta.mapped;
		delta.mapped = map(
			delta.current,
			0,
			DELTA_THRESHOLD,
			DELTA_MAP_MIN,
			DELTA_MAP_MAX
		);
		delta.lerped = lerp(delta.lerped, delta.mapped, 0.01);
		position.current.x = lerp(
			position.current.x,
			position.mouse.x,
			LERP_AMOUNT
		);
		position.current.y = lerp(
			position.current.y,
			position.mouse.y,
			LERP_AMOUNT
		);
	};

	const addImageElement = () => {
		imagesArray.push(
			imageElement(
				images,
				context,
				position.current.x,
				position.current.y,
				map(delta.lerped, 0, 1, IMAGE_SIZE_MIN, IMAGE_SIZE_MAX),
				map(delta.lerped, 0, 1, IMAGE_SIZE_MIN, IMAGE_SIZE_MAX),
				imageNum
			)
		);
		if (imagesArray.length > MAX_IMAGES) {
			imagesArray.shift();
		}
	};

	const onresizeHandler = () => {
		canvas.width = window.innerWidth * pixelRatio;
		canvas.height = window.innerHeight * pixelRatio;
		canvas.style.width = `${window.innerWidth}px`;
		canvas.style.height = `${window.innerHeight}px`;
		width = window.innerWidth * pixelRatio;
		height = window.innerHeight * pixelRatio;
	};

	const createCanvas = () => {
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		document.body.appendChild(canvas);
		canvas.style.width = `${window.innerWidth}px`;
		canvas.style.height = `${window.innerHeight}px`;
		return canvas;
	};

	init();
};

function lerp(start, stop, amount) {
	return amount * (stop - start) + start;
}

function changePositionTarget(w, h) {
	const x = map(Math.random(), 0, 1, IMAGE_SIZE_MAX, w - IMAGE_SIZE_MAX);
	const y = Math.random() * h;

	return { x, y };
}

function map(num, start1, stop1, start2, stop2) {
	return ((num - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

const automaticPositionHandler = (t, width, height) => {
	t = t / 10;
	const xVal = Math.sin(t / R1) + Math.sin(t / R2);
	const x = map(xVal, -2, 2, IMAGE_SIZE_MAX / 2, width - IMAGE_SIZE_MAX / 2);
	const yVal = Math.cos(t / R2) + Math.cos(t / R1);
	const y = map(yVal, -2, 2, IMAGE_SIZE_MAX / 2, height - IMAGE_SIZE_MAX / 2);
	return { x, y };
};

const throttle = (func, limit) => {
	let lastFunc;
	let lastRan;
	return function () {
		const context = this;
		const args = arguments;
		if (!lastRan) {
			func.apply(context, args);
			lastRan = Date.now();
		} else {
			clearTimeout(lastFunc);
			lastFunc = setTimeout(function () {
				if (Date.now() - lastRan >= limit) {
					func.apply(context, args);
					lastRan = Date.now();
				}
			}, limit - (Date.now() - lastRan));
		}
	};
};

inject();

window.onload = main;

// window.onresize = () => {
// 	location.reload();
// };
