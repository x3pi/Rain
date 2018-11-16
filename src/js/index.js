import RainRenderer from "./lib/rain-renderer";
import Raindrops from "./lib/raindrops";
import loadImages from "./lib/image-loader";
import createCanvas from "./lib/create-canvas";

let textureRainFg, textureRainBg,
  textureStormLightningFg, textureStormLightningBg,
  textureFalloutFg, textureFalloutBg,
  textureSunFg, textureSunBg,
  textureDrizzleFg, textureDrizzleBg,
  dropColor, dropAlpha;

let textureFg,
  textureFgCtx,
  textureBg,
  textureBgCtx;

let textureBgSize = {
  width: 384,
  height: 256
}
let textureFgSize = {
  width: 96,
  height: 64
}

let raindrops,
  renderer,
  canvas;

let parallax = { x: 0, y: 0 };

let weatherData = null;
let curWeatherData = null;
let blend = { v: 0 };

function loadTextures() {
  loadImages([
    { name: "dropAlpha", src: "img/drop-alpha.png" },
    { name: "dropColor", src: "img/drop-color.png" },

    { name: "textureRainFg", src: "img/weather/texture-rain-fg.png" },
    { name: "textureRainBg", src: "img/weather/texture-rain-bg.png" },

    { name: "textureStormLightningFg", src: "img/weather/texture-storm-lightning-fg.png" },
    { name: "textureStormLightningBg", src: "img/weather/texture-storm-lightning-bg.png" },

    { name: "textureFalloutFg", src: "img/weather/texture-fallout-fg.png" },
    { name: "textureFalloutBg", src: "img/weather/texture-fallout-bg.png" },

    { name: "textureSunFg", src: "img/weather/texture-sun-fg.png" },
    { name: "textureSunBg", src: "img/weather/texture-sun-bg.png" },

    { name: "textureDrizzleFg", src: "img/weather/texture-drizzle-fg.png" },
    { name: "textureDrizzleBg", src: "img/weather/texture-drizzle-bg.png" },
  ]).then((images) => {
    textureRainFg = images.textureRainFg.img;
    textureRainBg = images.textureRainBg.img;

    textureFalloutFg = images.textureFalloutFg.img;
    textureFalloutBg = images.textureFalloutBg.img;

    textureStormLightningFg = images.textureStormLightningFg.img;
    textureStormLightningBg = images.textureStormLightningBg.img;

    textureSunFg = images.textureSunFg.img;
    textureSunBg = images.textureSunBg.img;

    textureDrizzleFg = images.textureDrizzleFg.img;
    textureDrizzleBg = images.textureDrizzleBg.img;

    dropColor = images.dropColor.img;
    dropAlpha = images.dropAlpha.img;

    init();
  });
}
loadTextures();


////////////


function init() {
  canvas = document.querySelector('#container');

  let dpi = window.devicePixelRatio;

  canvas.width = window.innerWidth * dpi;
  canvas.height = window.innerHeight * dpi;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  raindrops = new Raindrops(
    canvas.width,
    canvas.height,
    dpi,
    dropAlpha,
    dropColor, {
      trailRate: 1,
      trailScaleRange: [0.2, 0.45],
      collisionRadius: 0.45,
      dropletsCleaningRadiusMultiplier: 0.28,
    }
  );

  textureFg = createCanvas(textureFgSize.width, textureFgSize.height);
  textureFgCtx = textureFg.getContext('2d');
  textureBg = createCanvas(textureBgSize.width, textureBgSize.height);
  textureBgCtx = textureBg.getContext('2d');

  generateTextures(textureRainFg, textureRainBg);

  renderer = new RainRenderer(canvas, raindrops.canvas, textureFg, textureBg, null, {
    brightness: 1.04,
    alphaMultiply: 6,
    alphaSubtract: 3,
    // minRefraction:256,
    // maxRefraction:512
  });

}




function generateTextures(fg, bg, alpha = 1) {
  textureFgCtx.globalAlpha = alpha;
  textureFgCtx.drawImage(fg, 0, 0, textureFgSize.width, textureFgSize.height);

  textureBgCtx.globalAlpha = alpha;
  textureBgCtx.drawImage(bg, 0, 0, textureBgSize.width, textureBgSize.height);
}
