// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"lib/webgl.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getContext = getContext;
exports.createProgram = createProgram;
exports.createShader = createShader;
exports.createTexture = createTexture;
exports.createUniform = createUniform;
exports.activeTexture = activeTexture;
exports.updateTexture = updateTexture;
exports.setRectangle = setRectangle;

function getContext(canvas) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var contexts = ["webgl", "experimental-webgl"];
  var context = null;
  contexts.some(function (name) {
    try {
      context = canvas.getContext(name, options);
    } catch (e) {}

    ;
    return context != null;
  });

  if (context == null) {
    document.body.classList.add("no-webgl");
  }

  return context;
}

function createProgram(gl, vertexScript, fragScript) {
  var vertexShader = createShader(gl, vertexScript, gl.VERTEX_SHADER);
  var fragShader = createShader(gl, fragScript, gl.FRAGMENT_SHADER);
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (!linked) {
    var lastError = gl.getProgramInfoLog(program);
    error("Error in program linking: " + lastError);
    gl.deleteProgram(program);
    return null;
  }

  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
  var texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0); // Create a buffer for the position of the rectangle corners.

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  return program;
}

function createShader(gl, script, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, script);
  gl.compileShader(shader);
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!compiled) {
    var lastError = gl.getShaderInfoLog(shader);
    error("Error compiling shader '" + shader + "':" + lastError);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createTexture(gl, source, i) {
  var texture = gl.createTexture();
  activeTexture(gl, i);
  gl.bindTexture(gl.TEXTURE_2D, texture); // Set the parameters so we can render any size image.

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  if (source == null) {
    return texture;
  } else {
    updateTexture(gl, source);
  }

  return texture;
}

function createUniform(gl, program, type, name) {
  var location = gl.getUniformLocation(program, "u_" + name);

  for (var _len = arguments.length, args = new Array(_len > 4 ? _len - 4 : 0), _key = 4; _key < _len; _key++) {
    args[_key - 4] = arguments[_key];
  }

  gl["uniform" + type].apply(gl, [location].concat(args));
}

function activeTexture(gl, i) {
  gl.activeTexture(gl["TEXTURE" + i]);
}

function updateTexture(gl, source) {
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
}

function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]), gl.STATIC_DRAW);
}

function error(msg) {
  console.error(msg);
}
},{}],"lib/gl-obj.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var WebGL = _interopRequireWildcard(require("./webgl"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function GL(canvas, options, vert, frag) {
  this.init(canvas, options, vert, frag);
}

GL.prototype = {
  canvas: null,
  gl: null,
  program: null,
  width: 0,
  height: 0,
  init: function init(canvas, options, vert, frag) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.gl = WebGL.getContext(canvas, options);
    this.program = this.createProgram(vert, frag);
    this.useProgram(this.program);
  },
  createProgram: function createProgram(vert, frag) {
    var program = WebGL.createProgram(this.gl, vert, frag);
    return program;
  },
  useProgram: function useProgram(program) {
    this.program = program;
    this.gl.useProgram(program);
  },
  createTexture: function createTexture(source, i) {
    return WebGL.createTexture(this.gl, source, i);
  },
  createUniform: function createUniform(type, name) {
    for (var _len = arguments.length, v = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      v[_key - 2] = arguments[_key];
    }

    WebGL.createUniform.apply(WebGL, [this.gl, this.program, type, name].concat(v));
  },
  activeTexture: function activeTexture(i) {
    WebGL.activeTexture(this.gl, i);
  },
  updateTexture: function updateTexture(source) {
    WebGL.updateTexture(this.gl, source);
  },
  draw: function draw() {
    WebGL.setRectangle(this.gl, -1, -1, 2, 2);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }
};
var _default = GL;
exports.default = _default;
},{"./webgl":"lib/webgl.js"}],"lib/create-canvas.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createCanvas;

function createCanvas(width, height) {
  var canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
},{}],"lib/shaders/simple.vert":[function(require,module,exports) {
module.exports = "precision mediump float;\n#define GLSLIFY 1\n\nattribute vec2 a_position;\n\nvoid main() {\n   gl_Position = vec4(a_position,0.0,1.0);\n}\n";
},{}],"lib/shaders/water.frag":[function(require,module,exports) {
module.exports = "precision mediump float;\n#define GLSLIFY 1\n\n// textures\nuniform sampler2D u_waterMap;\nuniform sampler2D u_textureShine;\nuniform sampler2D u_textureFg;\nuniform sampler2D u_textureBg;\n\n// the texCoords passed in from the vertex shader.\nvarying vec2 v_texCoord;\nuniform vec2 u_resolution;\nuniform vec2 u_parallax;\nuniform float u_parallaxFg;\nuniform float u_parallaxBg;\nuniform float u_textureRatio;\nuniform bool u_renderShine;\nuniform bool u_renderShadow;\nuniform float u_minRefraction;\nuniform float u_refractionDelta;\nuniform float u_brightness;\nuniform float u_alphaMultiply;\nuniform float u_alphaSubtract;\n\n// alpha-blends two colors\nvec4 blend(vec4 bg,vec4 fg){\n  vec3 bgm=bg.rgb*bg.a;\n  vec3 fgm=fg.rgb*fg.a;\n  float ia=1.0-fg.a;\n  float a=(fg.a + bg.a * ia);\n  vec3 rgb;\n  if(a!=0.0){\n    rgb=(fgm + bgm * ia) / a;\n  }else{\n    rgb=vec3(0.0,0.0,0.0);\n  }\n  return vec4(rgb,a);\n}\n\nvec2 pixel(){\n  return vec2(1.0,1.0)/u_resolution;\n}\n\nvec2 parallax(float v){\n  return u_parallax*pixel()*v;\n}\n\nvec2 texCoord(){\n  return vec2(gl_FragCoord.x, u_resolution.y-gl_FragCoord.y)/u_resolution;\n}\n\n// scales the bg up and proportionally to fill the container\nvec2 scaledTexCoord(){\n  float ratio=u_resolution.x/u_resolution.y;\n  vec2 scale=vec2(1.0,1.0);\n  vec2 offset=vec2(0.0,0.0);\n  float ratioDelta=ratio-u_textureRatio;\n  if(ratioDelta>=0.0){\n    scale.y=(1.0+ratioDelta);\n    offset.y=ratioDelta/2.0;\n  }else{\n    scale.x=(1.0-ratioDelta);\n    offset.x=-ratioDelta/2.0;\n  }\n  return (texCoord()+offset)/scale;\n}\n\n// get color from fg\nvec4 fgColor(float x, float y){\n  float p2=u_parallaxFg*2.0;\n  vec2 scale=vec2(\n    (u_resolution.x+p2)/u_resolution.x,\n    (u_resolution.y+p2)/u_resolution.y\n  );\n\n  vec2 scaledTexCoord=texCoord()/scale;\n  vec2 offset=vec2(\n    (1.0-(1.0/scale.x))/2.0,\n    (1.0-(1.0/scale.y))/2.0\n  );\n\n  return texture2D(u_waterMap,\n    (scaledTexCoord+offset)+(pixel()*vec2(x,y))+parallax(u_parallaxFg)\n  );\n}\n\nvoid main() {\n  vec4 bg=texture2D(u_textureBg,scaledTexCoord()+parallax(u_parallaxBg));\n\n  vec4 cur = fgColor(0.0,0.0);\n\n  float d=cur.b; // \"thickness\"\n  float x=cur.g;\n  float y=cur.r;\n\n  float a=clamp(cur.a*u_alphaMultiply-u_alphaSubtract, 0.0,1.0);\n\n  vec2 refraction = (vec2(x,y)-0.5)*2.0;\n  vec2 refractionParallax=parallax(u_parallaxBg-u_parallaxFg);\n  vec2 refractionPos = scaledTexCoord()\n    + (pixel()*refraction*(u_minRefraction+(d*u_refractionDelta)))\n    + refractionParallax;\n\n  vec4 tex=texture2D(u_textureFg,refractionPos);\n\n  if(u_renderShine){\n    float maxShine=490.0;\n    float minShine=maxShine*0.18;\n    vec2 shinePos=vec2(0.5,0.5) + ((1.0/512.0)*refraction)* -(minShine+((maxShine-minShine)*d));\n    vec4 shine=texture2D(u_textureShine,shinePos);\n    tex=blend(tex,shine);\n  }\n\n  vec4 fg=vec4(tex.rgb*u_brightness,a);\n\n  if(u_renderShadow){\n    float borderAlpha = fgColor(0.,0.-(d*6.0)).a;\n    borderAlpha=borderAlpha*u_alphaMultiply-(u_alphaSubtract+0.5);\n    borderAlpha=clamp(borderAlpha,0.,1.);\n    borderAlpha*=0.2;\n    vec4 border=vec4(0.,0.,0.,borderAlpha);\n    fg=blend(border,fg);\n  }\n\n  gl_FragColor = blend(bg,fg);\n}\n";
},{}],"lib/rain-renderer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var WebGL = _interopRequireWildcard(require("./webgl"));

var _glObj = _interopRequireDefault(require("./gl-obj"));

var _createCanvas = _interopRequireDefault(require("./create-canvas"));

var _simple = _interopRequireDefault(require("./shaders/simple.vert"));

var _water = _interopRequireDefault(require("./shaders/water.frag"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var defaultOptions = {
  renderShadow: false,
  minRefraction: 256,
  maxRefraction: 512,
  brightness: 1,
  alphaMultiply: 20,
  alphaSubtract: 5,
  parallaxBg: 5,
  parallaxFg: 20
};

function RainRenderer(canvas, canvasLiquid, imageFg, imageBg) {
  var imageShine = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
  this.canvas = canvas;
  this.canvasLiquid = canvasLiquid;
  this.imageShine = imageShine;
  this.imageFg = imageFg;
  this.imageBg = imageBg;
  this.options = Object.assign({}, defaultOptions, options);
  this.init();
}

RainRenderer.prototype = {
  canvas: null,
  gl: null,
  canvasLiquid: null,
  width: 0,
  height: 0,
  imageShine: "",
  imageFg: "",
  imageBg: "",
  textures: null,
  programWater: null,
  programBlurX: null,
  programBlurY: null,
  parallaxX: 0,
  parallaxY: 0,
  renderShadow: false,
  options: null,
  init: function init() {
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.gl = new _glObj.default(this.canvas, {
      alpha: false
    }, _simple.default, _water.default);
    var gl = this.gl;
    this.programWater = gl.program;
    gl.createUniform("2f", "resolution", this.width, this.height);
    gl.createUniform("1f", "textureRatio", this.imageBg.width / this.imageBg.height);
    gl.createUniform("1i", "renderShine", this.imageShine == null ? false : true);
    gl.createUniform("1i", "renderShadow", this.options.renderShadow);
    gl.createUniform("1f", "minRefraction", this.options.minRefraction);
    gl.createUniform("1f", "refractionDelta", this.options.maxRefraction - this.options.minRefraction);
    gl.createUniform("1f", "brightness", this.options.brightness);
    gl.createUniform("1f", "alphaMultiply", this.options.alphaMultiply);
    gl.createUniform("1f", "alphaSubtract", this.options.alphaSubtract);
    gl.createUniform("1f", "parallaxBg", this.options.parallaxBg);
    gl.createUniform("1f", "parallaxFg", this.options.parallaxFg);
    gl.createTexture(null, 0);
    this.textures = [{
      name: 'textureShine',
      img: this.imageShine == null ? (0, _createCanvas.default)(2, 2) : this.imageShine
    }, {
      name: 'textureFg',
      img: this.imageFg
    }, {
      name: 'textureBg',
      img: this.imageBg
    }];
    this.textures.forEach(function (texture, i) {
      gl.createTexture(texture.img, i + 1);
      gl.createUniform("1i", texture.name, i + 1);
    });
    this.draw();
  },
  draw: function draw() {
    this.gl.useProgram(this.programWater);
    this.gl.createUniform("2f", "parallax", this.parallaxX, this.parallaxY);
    this.updateTexture();
    this.gl.draw();
    requestAnimationFrame(this.draw.bind(this));
  },
  updateTextures: function updateTextures() {
    var _this = this;

    this.textures.forEach(function (texture, i) {
      _this.gl.activeTexture(i + 1);

      _this.gl.updateTexture(texture.img);
    });
  },
  updateTexture: function updateTexture() {
    this.gl.activeTexture(0);
    this.gl.updateTexture(this.canvasLiquid);
  },
  resize: function resize() {},

  get overlayTexture() {},

  set overlayTexture(v) {}

};
var _default = RainRenderer;
exports.default = _default;
},{"./webgl":"lib/webgl.js","./gl-obj":"lib/gl-obj.js","./create-canvas":"lib/create-canvas.js","./shaders/simple.vert":"lib/shaders/simple.vert","./shaders/water.frag":"lib/shaders/water.frag"}],"../../node_modules/@babel/runtime/helpers/arrayWithoutHoles.js":[function(require,module,exports) {
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }
}

module.exports = _arrayWithoutHoles;
},{}],"../../node_modules/@babel/runtime/helpers/iterableToArray.js":[function(require,module,exports) {
function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

module.exports = _iterableToArray;
},{}],"../../node_modules/@babel/runtime/helpers/nonIterableSpread.js":[function(require,module,exports) {
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

module.exports = _nonIterableSpread;
},{}],"../../node_modules/@babel/runtime/helpers/toConsumableArray.js":[function(require,module,exports) {
var arrayWithoutHoles = require("./arrayWithoutHoles");

var iterableToArray = require("./iterableToArray");

var nonIterableSpread = require("./nonIterableSpread");

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray;
},{"./arrayWithoutHoles":"../../node_modules/@babel/runtime/helpers/arrayWithoutHoles.js","./iterableToArray":"../../node_modules/@babel/runtime/helpers/iterableToArray.js","./nonIterableSpread":"../../node_modules/@babel/runtime/helpers/nonIterableSpread.js"}],"lib/times.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = times;

function times(n, f) {
  for (var i = 0; i < n; i++) {
    f.call(this, i);
  }
}
},{}],"lib/random.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.random = random;
exports.chance = chance;

function random() {
  var from = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var to = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var interpolation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (from == null) {
    from = 0;
    to = 1;
  } else if (from != null && to == null) {
    to = from;
    from = 0;
  }

  var delta = to - from;

  if (interpolation == null) {
    interpolation = function interpolation(n) {
      return n;
    };
  }

  return from + interpolation(Math.random()) * delta;
}

function chance(c) {
  return random() <= c;
}
},{}],"lib/raindrops.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _times = _interopRequireDefault(require("./times.js"));

var _createCanvas = _interopRequireDefault(require("./create-canvas.js"));

var _random = require("./random");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dropSize = 64;
var Drop = {
  x: 0,
  y: 0,
  r: 0,
  spreadX: 0,
  spreadY: 0,
  momentum: 0,
  momentumX: 0,
  lastSpawn: 0,
  nextSpawn: 0,
  parent: null,
  isNew: true,
  killed: false,
  shrink: 0
};
var defaultOptions = {
  minR: 10,
  maxR: 40,
  maxDrops: 900,
  rainChance: 0.3,
  rainLimit: 3,
  dropletsRate: 50,
  dropletsSize: [2, 4],
  dropletsCleaningRadiusMultiplier: 0.43,
  raining: true,
  globalTimeScale: 1,
  trailRate: 1,
  autoShrink: true,
  spawnArea: [-0.1, 0.95],
  trailScaleRange: [0.2, 0.5],
  collisionRadius: 0.65,
  collisionRadiusIncrease: 0.01,
  dropFallMultiplier: 1,
  collisionBoostMultiplier: 0.05,
  collisionBoost: 1
};

function Raindrops(width, height, scale, dropAlpha, dropColor) {
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
  this.width = width;
  this.height = height;
  this.scale = scale;
  this.dropAlpha = dropAlpha;
  this.dropColor = dropColor;
  this.options = Object.assign({}, defaultOptions, options);
  this.init();
}

Raindrops.prototype = {
  dropColor: null,
  dropAlpha: null,
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  scale: 0,
  dropletsPixelDensity: 1,
  droplets: null,
  dropletsCtx: null,
  dropletsCounter: 0,
  drops: null,
  dropsGfx: null,
  clearDropletsGfx: null,
  textureCleaningIterations: 0,
  lastRender: null,
  options: null,
  init: function init() {
    this.canvas = (0, _createCanvas.default)(this.width, this.height);
    this.ctx = this.canvas.getContext('2d');
    this.droplets = (0, _createCanvas.default)(this.width * this.dropletsPixelDensity, this.height * this.dropletsPixelDensity);
    this.dropletsCtx = this.droplets.getContext('2d');
    this.drops = [];
    this.dropsGfx = [];
    this.renderDropsGfx();
    this.update();
  },

  get deltaR() {
    return this.options.maxR - this.options.minR;
  },

  get area() {
    return this.width * this.height / this.scale;
  },

  get areaMultiplier() {
    return Math.sqrt(this.area / (1024 * 768));
  },

  drawDroplet: function drawDroplet(x, y, r) {
    this.drawDrop(this.dropletsCtx, Object.assign(Object.create(Drop), {
      x: x * this.dropletsPixelDensity,
      y: y * this.dropletsPixelDensity,
      r: r * this.dropletsPixelDensity
    }));
  },
  renderDropsGfx: function renderDropsGfx() {
    var _this = this;

    var dropBuffer = (0, _createCanvas.default)(dropSize, dropSize);
    var dropBufferCtx = dropBuffer.getContext('2d');
    this.dropsGfx = Array.apply(null, Array(255)).map(function (cur, i) {
      var drop = (0, _createCanvas.default)(dropSize, dropSize);
      var dropCtx = drop.getContext('2d');
      dropBufferCtx.clearRect(0, 0, dropSize, dropSize); // color

      dropBufferCtx.globalCompositeOperation = "source-over";
      dropBufferCtx.drawImage(_this.dropColor, 0, 0, dropSize, dropSize); // blue overlay, for depth

      dropBufferCtx.globalCompositeOperation = "screen";
      dropBufferCtx.fillStyle = "rgba(0,0," + i + ",1)";
      dropBufferCtx.fillRect(0, 0, dropSize, dropSize); // alpha

      dropCtx.globalCompositeOperation = "source-over";
      dropCtx.drawImage(_this.dropAlpha, 0, 0, dropSize, dropSize);
      dropCtx.globalCompositeOperation = "source-in";
      dropCtx.drawImage(dropBuffer, 0, 0, dropSize, dropSize);
      return drop;
    }); // create circle that will be used as a brush to remove droplets

    this.clearDropletsGfx = (0, _createCanvas.default)(128, 128);
    var clearDropletsCtx = this.clearDropletsGfx.getContext("2d");
    clearDropletsCtx.fillStyle = "#000";
    clearDropletsCtx.beginPath();
    clearDropletsCtx.arc(64, 64, 64, 0, Math.PI * 2);
    clearDropletsCtx.fill();
  },
  drawDrop: function drawDrop(ctx, drop) {
    if (this.dropsGfx.length > 0) {
      var x = drop.x;
      var y = drop.y;
      var r = drop.r;
      var spreadX = drop.spreadX;
      var spreadY = drop.spreadY;
      var scaleX = 1;
      var scaleY = 1.5;
      var d = Math.max(0, Math.min(1, (r - this.options.minR) / this.deltaR * 0.9));
      d *= 1 / ((drop.spreadX + drop.spreadY) * 0.5 + 1);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      d = Math.floor(d * (this.dropsGfx.length - 1));
      ctx.drawImage(this.dropsGfx[d], (x - r * scaleX * (spreadX + 1)) * this.scale, (y - r * scaleY * (spreadY + 1)) * this.scale, r * 2 * scaleX * (spreadX + 1) * this.scale, r * 2 * scaleY * (spreadY + 1) * this.scale);
    }
  },
  clearDroplets: function clearDroplets(x, y) {
    var r = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 30;
    var ctx = this.dropletsCtx;
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(this.clearDropletsGfx, (x - r) * this.dropletsPixelDensity * this.scale, (y - r) * this.dropletsPixelDensity * this.scale, r * 2 * this.dropletsPixelDensity * this.scale, r * 2 * this.dropletsPixelDensity * this.scale * 1.5);
  },
  clearCanvas: function clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  },
  createDrop: function createDrop(options) {
    if (this.drops.length >= this.options.maxDrops * this.areaMultiplier) return null;
    return Object.assign(Object.create(Drop), options);
  },
  addDrop: function addDrop(drop) {
    if (this.drops.length >= this.options.maxDrops * this.areaMultiplier || drop == null) return false;
    this.drops.push(drop);
    return true;
  },
  updateRain: function updateRain(timeScale) {
    var rainDrops = [];

    if (this.options.raining) {
      var limit = this.options.rainLimit * timeScale * this.areaMultiplier;
      var count = 0;

      while ((0, _random.chance)(this.options.rainChance * timeScale * this.areaMultiplier) && count < limit) {
        count++;
        var r = (0, _random.random)(this.options.minR, this.options.maxR, function (n) {
          return Math.pow(n, 3);
        });
        var rainDrop = this.createDrop({
          x: (0, _random.random)(this.width / this.scale),
          y: (0, _random.random)(this.height / this.scale * this.options.spawnArea[0], this.height / this.scale * this.options.spawnArea[1]),
          r: r,
          momentum: 1 + (r - this.options.minR) * 0.1 + (0, _random.random)(2),
          spreadX: 1.5,
          spreadY: 1.5
        });

        if (rainDrop != null) {
          rainDrops.push(rainDrop);
        }
      }
    }

    return rainDrops;
  },
  clearDrops: function clearDrops() {
    this.drops.forEach(function (drop) {
      setTimeout(function () {
        drop.shrink = 0.1 + (0, _random.random)(0.5);
      }, (0, _random.random)(1200));
    });
    this.clearTexture();
  },
  clearTexture: function clearTexture() {
    this.textureCleaningIterations = 50;
  },
  updateDroplets: function updateDroplets(timeScale) {
    var _this2 = this;

    if (this.textureCleaningIterations > 0) {
      this.textureCleaningIterations -= 1 * timeScale;
      this.dropletsCtx.globalCompositeOperation = "destination-out";
      this.dropletsCtx.fillStyle = "rgba(0,0,0," + 0.05 * timeScale + ")";
      this.dropletsCtx.fillRect(0, 0, this.width * this.dropletsPixelDensity, this.height * this.dropletsPixelDensity);
    }

    if (this.options.raining) {
      this.dropletsCounter += this.options.dropletsRate * timeScale * this.areaMultiplier;
      (0, _times.default)(this.dropletsCounter, function (i) {
        _this2.dropletsCounter--;

        _this2.drawDroplet((0, _random.random)(_this2.width / _this2.scale), (0, _random.random)(_this2.height / _this2.scale), _random.random.apply(void 0, (0, _toConsumableArray2.default)(_this2.options.dropletsSize).concat([function (n) {
          return n * n;
        }])));
      });
    }

    this.ctx.drawImage(this.droplets, 0, 0, this.width, this.height);
  },
  updateDrops: function updateDrops(timeScale) {
    var _this3 = this;

    var newDrops = [];
    this.updateDroplets(timeScale);
    var rainDrops = this.updateRain(timeScale);
    newDrops = newDrops.concat(rainDrops);
    this.drops.sort(function (a, b) {
      var va = a.y * (_this3.width / _this3.scale) + a.x;
      var vb = b.y * (_this3.width / _this3.scale) + b.x;
      return va > vb ? 1 : va == vb ? 0 : -1;
    });
    this.drops.forEach(function (drop, i) {
      var _this4 = this;

      if (!drop.killed) {
        // update gravity
        // (chance of drops "creeping down")
        if ((0, _random.chance)((drop.r - this.options.minR * this.options.dropFallMultiplier) * (0.1 / this.deltaR) * timeScale)) {
          drop.momentum += (0, _random.random)(drop.r / this.options.maxR * 4);
        } // clean small drops


        if (this.options.autoShrink && drop.r <= this.options.minR && (0, _random.chance)(0.05 * timeScale)) {
          drop.shrink += 0.01;
        } //update shrinkage


        drop.r -= drop.shrink * timeScale;
        if (drop.r <= 0) drop.killed = true; // update trails

        if (this.options.raining) {
          drop.lastSpawn += drop.momentum * timeScale * this.options.trailRate;

          if (drop.lastSpawn > drop.nextSpawn) {
            var trailDrop = this.createDrop({
              x: drop.x + (0, _random.random)(-drop.r, drop.r) * 0.1,
              y: drop.y - drop.r * 0.01,
              r: drop.r * _random.random.apply(void 0, (0, _toConsumableArray2.default)(this.options.trailScaleRange)),
              spreadY: drop.momentum * 0.1,
              parent: drop
            });

            if (trailDrop != null) {
              newDrops.push(trailDrop);
              drop.r *= Math.pow(0.97, timeScale);
              drop.lastSpawn = 0;
              drop.nextSpawn = (0, _random.random)(this.options.minR, this.options.maxR) - drop.momentum * 2 * this.options.trailRate + (this.options.maxR - drop.r);
            }
          }
        } //normalize spread


        drop.spreadX *= Math.pow(0.4, timeScale);
        drop.spreadY *= Math.pow(0.7, timeScale); //update position

        var moved = drop.momentum > 0;

        if (moved && !drop.killed) {
          drop.y += drop.momentum * this.options.globalTimeScale;
          drop.x += drop.momentumX * this.options.globalTimeScale;

          if (drop.y > this.height / this.scale + drop.r) {
            drop.killed = true;
          }
        } // collision


        var checkCollision = (moved || drop.isNew) && !drop.killed;
        drop.isNew = false;

        if (checkCollision) {
          this.drops.slice(i + 1, i + 70).forEach(function (drop2) {
            //basic check
            if (drop != drop2 && drop.r > drop2.r && drop.parent != drop2 && drop2.parent != drop && !drop2.killed) {
              var dx = drop2.x - drop.x;
              var dy = drop2.y - drop.y;
              var d = Math.sqrt(dx * dx + dy * dy); //if it's within acceptable distance

              if (d < (drop.r + drop2.r) * (_this4.options.collisionRadius + drop.momentum * _this4.options.collisionRadiusIncrease * timeScale)) {
                var pi = Math.PI;
                var r1 = drop.r;
                var r2 = drop2.r;
                var a1 = pi * (r1 * r1);
                var a2 = pi * (r2 * r2);
                var targetR = Math.sqrt((a1 + a2 * 0.8) / pi);

                if (targetR > _this4.maxR) {
                  targetR = _this4.maxR;
                }

                drop.r = targetR;
                drop.momentumX += dx * 0.1;
                drop.spreadX = 0;
                drop.spreadY = 0;
                drop2.killed = true;
                drop.momentum = Math.max(drop2.momentum, Math.min(40, drop.momentum + targetR * _this4.options.collisionBoostMultiplier + _this4.options.collisionBoost));
              }
            }
          });
        } //slowdown momentum


        drop.momentum -= Math.max(1, this.options.minR * 0.5 - drop.momentum) * 0.1 * timeScale;
        if (drop.momentum < 0) drop.momentum = 0;
        drop.momentumX *= Math.pow(0.7, timeScale);

        if (!drop.killed) {
          newDrops.push(drop);
          if (moved && this.options.dropletsRate > 0) this.clearDroplets(drop.x, drop.y, drop.r * this.options.dropletsCleaningRadiusMultiplier);
          this.drawDrop(this.ctx, drop);
        }
      }
    }, this);
    this.drops = newDrops;
  },
  update: function update() {
    this.clearCanvas();
    var now = Date.now();
    if (this.lastRender == null) this.lastRender = now;
    var deltaT = now - this.lastRender;
    var timeScale = deltaT / (1 / 60 * 1000);
    if (timeScale > 1.1) timeScale = 1.1;
    timeScale *= this.options.globalTimeScale;
    this.lastRender = now;
    this.updateDrops(timeScale);
    requestAnimationFrame(this.update.bind(this));
  }
};
var _default = Raindrops;
exports.default = _default;
},{"@babel/runtime/helpers/toConsumableArray":"../../node_modules/@babel/runtime/helpers/toConsumableArray.js","./times.js":"lib/times.js","./create-canvas.js":"lib/create-canvas.js","./random":"lib/random.js"}],"../../node_modules/regenerator-runtime/runtime.js":[function(require,module,exports) {
var global = arguments[3];
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() {
    return this || (typeof self === "object" && self);
  })() || Function("return this")()
);

},{}],"../../node_modules/regenerator-runtime/runtime-module.js":[function(require,module,exports) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g = (function() {
  return this || (typeof self === "object" && self);
})() || Function("return this")();

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = require("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}

},{"./runtime":"../../node_modules/regenerator-runtime/runtime.js"}],"../../node_modules/@babel/runtime/regenerator/index.js":[function(require,module,exports) {
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":"../../node_modules/regenerator-runtime/runtime-module.js"}],"../../node_modules/@babel/runtime/helpers/asyncToGenerator.js":[function(require,module,exports) {
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
},{}],"lib/image-loader.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ImageLoader;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function loadImage(src, i, onLoad) {
  return new Promise(function (resolve, reject) {
    if (typeof src == "string") {
      src = {
        name: "image" + i,
        src: src
      };
    }

    var img = new Image();
    img.crossOrigin = "anonymous";
    src.img = img;
    img.src = src.src;
    img.addEventListener("load", function (event) {
      if (typeof onLoad == "function") {
        onLoad.call(null, img, i);
      }

      resolve(src);
    });
  });
}

function loadImages(images, onLoad) {
  return Promise.all(images.map(function (src, i) {
    return loadImage(src, i, onLoad);
  }));
}

function ImageLoader(_x, _x2) {
  return _ImageLoader.apply(this, arguments);
}

function _ImageLoader() {
  _ImageLoader = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(images, onLoad) {
    var r;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            r = {};
            _context.next = 3;
            return loadImages(images, onLoad).then(function (loadedImages) {
              loadedImages.forEach(function (curImage) {
                r[curImage.name] = {
                  img: curImage.img,
                  src: curImage.src
                };
              });
            });

          case 3:
            return _context.abrupt("return", r);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _ImageLoader.apply(this, arguments);
}
},{"@babel/runtime/regenerator":"../../node_modules/@babel/runtime/regenerator/index.js","@babel/runtime/helpers/asyncToGenerator":"../../node_modules/@babel/runtime/helpers/asyncToGenerator.js"}],"index.js":[function(require,module,exports) {
"use strict";

var _rainRenderer = _interopRequireDefault(require("./lib/rain-renderer"));

var _raindrops = _interopRequireDefault(require("./lib/raindrops"));

var _imageLoader = _interopRequireDefault(require("./lib/image-loader"));

var _createCanvas = _interopRequireDefault(require("./lib/create-canvas"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var textureRainFg, textureRainBg, textureStormLightningFg, textureStormLightningBg, textureFalloutFg, textureFalloutBg, textureSunFg, textureSunBg, textureDrizzleFg, textureDrizzleBg, dropColor, dropAlpha;
var textureFg, textureFgCtx, textureBg, textureBgCtx;
var textureBgSize = {
  width: 384,
  height: 256
};
var textureFgSize = {
  width: 96,
  height: 64
};
var raindrops, renderer, canvas;
var parallax = {
  x: 0,
  y: 0
};
var weatherData = null;
var curWeatherData = null;
var blend = {
  v: 0
};

function loadTextures() {
  (0, _imageLoader.default)([{
    name: "dropAlpha",
    src: "img/drop-alpha.png"
  }, {
    name: "dropColor",
    src: "img/drop-color.png"
  }, {
    name: "textureRainFg",
    src: "img/weather/texture-rain-fg.png"
  }, {
    name: "textureRainBg",
    src: "img/weather/texture-rain-bg.png"
  }, {
    name: "textureStormLightningFg",
    src: "img/weather/texture-storm-lightning-fg.png"
  }, {
    name: "textureStormLightningBg",
    src: "img/weather/texture-storm-lightning-bg.png"
  }, {
    name: "textureFalloutFg",
    src: "img/weather/texture-fallout-fg.png"
  }, {
    name: "textureFalloutBg",
    src: "img/weather/texture-fallout-bg.png"
  }, {
    name: "textureSunFg",
    src: "img/weather/texture-sun-fg.png"
  }, {
    name: "textureSunBg",
    src: "img/weather/texture-sun-bg.png"
  }, {
    name: "textureDrizzleFg",
    src: "img/weather/texture-drizzle-fg.png"
  }, {
    name: "textureDrizzleBg",
    src: "img/weather/texture-drizzle-bg.png"
  }]).then(function (images) {
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

loadTextures(); ////////////

function init() {
  canvas = document.querySelector('#container');
  var dpi = window.devicePixelRatio;
  canvas.width = window.innerWidth * dpi;
  canvas.height = window.innerHeight * dpi;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  raindrops = new _raindrops.default(canvas.width, canvas.height, dpi, dropAlpha, dropColor, {
    trailRate: 1,
    trailScaleRange: [0.2, 0.45],
    collisionRadius: 0.45,
    dropletsCleaningRadiusMultiplier: 0.28
  });
  textureFg = (0, _createCanvas.default)(textureFgSize.width, textureFgSize.height);
  textureFgCtx = textureFg.getContext('2d');
  textureBg = (0, _createCanvas.default)(textureBgSize.width, textureBgSize.height);
  textureBgCtx = textureBg.getContext('2d');
  generateTextures(textureRainFg, textureRainBg);
  renderer = new _rainRenderer.default(canvas, raindrops.canvas, textureFg, textureBg, null, {
    brightness: 1.04,
    alphaMultiply: 6,
    alphaSubtract: 3 // minRefraction:256,
    // maxRefraction:512

  });
}

function generateTextures(fg, bg) {
  var alpha = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  textureFgCtx.globalAlpha = alpha;
  textureFgCtx.drawImage(fg, 0, 0, textureFgSize.width, textureFgSize.height);
  textureBgCtx.globalAlpha = alpha;
  textureBgCtx.drawImage(bg, 0, 0, textureBgSize.width, textureBgSize.height);
}
},{"./lib/rain-renderer":"lib/rain-renderer.js","./lib/raindrops":"lib/raindrops.js","./lib/image-loader":"lib/image-loader.js","./lib/create-canvas":"lib/create-canvas.js"}],"../../../../../AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63643" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../../../../../AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/index.map