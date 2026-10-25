/* Cheesecake → projector fund: isometric pixel sprites, the begging rooster, the shredding Yak and the progress bar. */
(function () {
	'use strict';

	var fund = document.querySelector('[data-fund]');
	// The live numbers come from Poster through a Cloudflare Worker; the
	// data-* attributes are the fallback if it does not answer.
	var FUND_URL = 'https://mesto-cheesecake-fund.kanevsky.workers.dev/fund';
	var slices = Number(fund.getAttribute('data-slices')) || 0;
	var perSlice = Number(fund.getAttribute('data-per-slice')) || 100;
	var goal = Number(fund.getAttribute('data-goal')) || 1;
	// Other sweets from the same baker (e.g. a lemon tart) add straight baht.
	var extra = Number(fund.getAttribute('data-extra')) || 0;
	var progress = 0;

	var lane = document.querySelector('[data-lane]');
	var cakeButton = document.querySelector('[data-cake]');
	var cakeCanvas = document.querySelector('[data-cake-sprite]');
	var projectorCanvas = document.querySelector('[data-projector-sprite]');
	var raisedLabel = document.querySelector('[data-raised-label]');
	var goalLabel = document.querySelector('[data-goal-label]');
	var projectorButton = document.querySelector('[data-projector]');
	var rooster = document.querySelector('[data-rooster]');
	var roosterCanvas = document.querySelector('[data-rooster-sprite]');
	var guitarist = document.querySelector('[data-guitarist]');
	var guitaristCanvas = document.querySelector('[data-guitarist-sprite]');
	var tapMe = document.querySelector('[data-tap-me]');
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	var PIXEL = 2.5; // CSS pixels per sprite pixel
	var TAU = Math.PI * 2;
	var STEP = 0.3; // sampling step in sprite pixels
	var OUTLINE = [33, 41, 49];

	/* ---------- tiny isometric renderer ----------
	   World: x right, y towards the viewer, z up. Shapes are sampled into
	   points; each point is projected and the nearest one wins its pixel. */

	var ELEVATION = Math.PI / 6; // 30° gives the classic 2:1 pixel-art ellipse
	var SIN_E = Math.sin(ELEVATION);
	var COS_E = Math.cos(ELEVATION);
	var LIGHT = normalise([-0.6, 0.5, 0.75]);

	function normalise(v) {
		var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
		return [v[0] / length, v[1] / length, v[2] / length];
	}

	function rgb(hex) {
		var n = parseInt(hex.slice(1), 16);
		return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
	}

	// Stepped lighting keeps the limited palette of pixel art.
	function shade(colour, normal, ambient) {
		var base = ambient || 0.62;
		var light = Math.max(0, normal[0] * LIGHT[0] + normal[1] * LIGHT[1] + normal[2] * LIGHT[2]);
		var factor = Math.round((base + (1.04 - base) * light) / 0.06) * 0.06;
		return [
			Math.min(255, Math.round(colour[0] * factor)),
			Math.min(255, Math.round(colour[1] * factor)),
			Math.min(255, Math.round(colour[2] * factor))
		];
	}

	// Stable per-pixel noise so textures do not flicker between frames.
	function noise(x, y) {
		var h = Math.imul(Math.floor(x) + 31, 374761393) ^ Math.imul(Math.floor(y) + 17, 668265263);
		h = Math.imul(h ^ (h >>> 13), 1274126177);
		return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
	}

	function project(point) {
		return {
			x: point.x,
			y: point.y * SIN_E - point.z * COS_E,
			depth: point.y * COS_E + point.z * SIN_E
		};
	}

	function boundsOf(points) {
		var box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
		points.forEach(function (point) {
			var p = project(point);
			box.minX = Math.min(box.minX, p.x);
			box.minY = Math.min(box.minY, p.y);
			box.maxX = Math.max(box.maxX, p.x);
			box.maxY = Math.max(box.maxY, p.y);
		});
		box.width = Math.floor(box.maxX) - Math.floor(box.minX) + 3;
		box.height = Math.floor(box.maxY) - Math.floor(box.minY) + 3;
		return box;
	}

	function rasterise(points, box) {
		var width = box.width;
		var height = box.height;
		var colours = new Array(width * height).fill(null);
		var depths = new Float32Array(width * height).fill(-Infinity);

		points.forEach(function (point) {
			var p = project(point);
			var x = Math.floor(p.x) - Math.floor(box.minX) + 1;
			var y = Math.floor(p.y) - Math.floor(box.minY) + 1;
			var i = y * width + x;
			if (p.depth > depths[i]) {
				depths[i] = p.depth;
				colours[i] = point.colour;
			}
		});

		var image = new ImageData(width, height);
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var i = y * width + x;
				var colour = colours[i];
				if (!colour) {
					var touches = (y > 0 && colours[i - width]) || (y < height - 1 && colours[i + width]) || (x > 0 && colours[i - 1]) || (x < width - 1 && colours[i + 1]);
					if (!touches) continue;
					colour = OUTLINE;
				}
				image.data[i * 4] = colour[0];
				image.data[i * 4 + 1] = colour[1];
				image.data[i * 4 + 2] = colour[2];
				image.data[i * 4 + 3] = 255;
			}
		}
		return image;
	}

	function show(canvas, image) {
		if (canvas.width !== image.width) canvas.width = image.width;
		if (canvas.height !== image.height) canvas.height = image.height;
		canvas.getContext('2d').putImageData(image, 0, 0);
		canvas.style.width = image.width * PIXEL + 'px';
		canvas.style.height = image.height * PIXEL + 'px';
	}

	/* ---------- primitives ---------- */

	function addDisc(points, cx, cy, z, radius, colourAt) {
		for (var x = -radius; x <= radius; x += STEP) {
			for (var y = -radius; y <= radius; y += STEP) {
				var r = Math.sqrt(x * x + y * y);
				if (r > radius) continue;
				var colour = colourAt(x, y, r);
				if (colour) points.push({ x: cx + x, y: cy + y, z: z, colour: colour });
			}
		}
	}

	function addWall(points, cx, cy, radius, z0, z1, colourAt, inwardAtBack) {
		var step = STEP / radius;
		for (var a = 0; a < TAU; a += step) {
			var nx = Math.sin(a);
			var ny = Math.cos(a);
			var top = typeof z1 === 'function' ? z1(a) : z1;
			for (var z = z0; z <= top; z += STEP) {
				var normal = inwardAtBack && ny < 0 ? [-nx, -ny, 0] : [nx, ny, 0];
				var colour = colourAt(a, z, normal);
				if (colour) points.push({ x: cx + nx * radius, y: cy + ny * radius, z: z, colour: colour });
			}
		}
	}

	// Axis-aligned box in object space, rotated by `yaw` around the z axis.
	function addBox(points, box, colours, yaw) {
		var faces = [
			{ n: [0, 0, 1], c: colours.top, u: [box.x0, box.x1], v: [box.y0, box.y1], at: function (u, v) { return [u, v, box.z1]; } },
			{ n: [0, 1, 0], c: colours.front, u: [box.x0, box.x1], v: [box.z0, box.z1], at: function (u, v) { return [u, box.y1, v]; } },
			{ n: [0, -1, 0], c: colours.side, u: [box.x0, box.x1], v: [box.z0, box.z1], at: function (u, v) { return [u, box.y0, v]; } },
			{ n: [1, 0, 0], c: colours.side, u: [box.y0, box.y1], v: [box.z0, box.z1], at: function (u, v) { return [box.x1, u, v]; } },
			{ n: [-1, 0, 0], c: colours.side, u: [box.y0, box.y1], v: [box.z0, box.z1], at: function (u, v) { return [box.x0, u, v]; } }
		];
		faces.forEach(function (face) {
			var colour = shade(face.c, rotate(face.n, yaw));
			for (var u = face.u[0]; u <= face.u[1]; u += STEP) {
				for (var v = face.v[0]; v <= face.v[1]; v += STEP) {
					var p = rotate(face.at(u, v), yaw);
					points.push({ x: p[0], y: p[1], z: p[2], colour: colour });
				}
			}
		});
	}

	function rotate(v, yaw) {
		var c = Math.cos(yaw);
		var s = Math.sin(yaw);
		return [v[0] * c + v[1] * s, -v[0] * s + v[1] * c, v[2]];
	}

	/* ---------- Basque cheesecake on a plate ---------- */

	var CAKE_RADIUS = 11;
	var CAKE_HEIGHT = 6.5;
	var PLATE_RADIUS = 14;
	var PLATE_TOP = 1;
	var SLICE_COUNT = 8;
	var SLICE_ANGLE = TAU / SLICE_COUNT;

	var PLATE = rgb('#ffffff');
	var PLATE_RIM = rgb('#d9d5cc');
	var PARCHMENT = rgb('#f6efdf');
	var CREAM = rgb('#ffe6a3');
	var BURNT = ['#33190b', '#5c3017', '#8f5424'].map(rgb);

	function isEaten(angle, eaten) {
		var a = ((angle % TAU) + TAU) % TAU;
		return Math.floor(a / SLICE_ANGLE) < eaten;
	}

	function cakePoints(eaten) {
		var points = [];
		var top = PLATE_TOP + CAKE_HEIGHT;

		// Plate.
		addDisc(points, 0, 0, PLATE_TOP, PLATE_RADIUS, function () { return PLATE; });
		addWall(points, 0, 0, PLATE_RADIUS, 0, PLATE_TOP, function () { return PLATE_RIM; });

		if (eaten >= SLICE_COUNT) return points;

		// Caramelised top: dark middle, lighter edge.
		addDisc(points, 0, 0, top, CAKE_RADIUS, function (x, y, r) {
			if (isEaten(Math.atan2(x, y), eaten)) return null;
			return BURNT[r < CAKE_RADIUS * 0.55 ? 0 : r < CAKE_RADIUS * 0.85 ? 1 : 2];
		});

		// Parchment around the side, a little taller than the cake.
		addWall(points, 0, 0, CAKE_RADIUS + 0.4, PLATE_TOP, function (a) { return top + 1.2 + (Math.floor(a * 3) % 2); }, function (a, z, normal) {
			if (isEaten(a, eaten)) return null;
			return shade(PARCHMENT, normal, 0.8);
		}, true);

		// Creamy cut faces where slices are gone.
		if (eaten > 0) {
			[{ angle: 0, side: 1 }, { angle: eaten * SLICE_ANGLE, side: -1 }].forEach(function (cut) {
				var dx = Math.sin(cut.angle);
				var dy = Math.cos(cut.angle);
				var normal = [dy * cut.side, -dx * cut.side, 0];
				var colour = shade(CREAM, normal, 0.86);
				for (var t = 0; t <= CAKE_RADIUS; t += STEP) {
					for (var z = PLATE_TOP; z <= top; z += STEP) {
						points.push({ x: dx * t, y: dy * t, z: z, colour: colour });
					}
				}
			});
		}
		return points;
	}

	/* ---------- Hisense Vidda C2 Ultra ----------
	   Graphite rounded head seen from the front-left like the product photo:
	   black glass front with a big lens on the right and a speaker strip
	   below, held by two posts that rise from a round puck base. */

	var PROJECTOR_YAW = -0.5; // front turned towards the cheesecake
	var HEAD = { x: 8, y: 6, z0: 11, z1: 21.5, radius: 2.6 };
	var PANEL = { x: HEAD.x - 0.9, z0: HEAD.z0 + 2.8, z1: HEAD.z1 - 0.9 };
	var LENS = { x: 3, z: (PANEL.z0 + PANEL.z1) / 2, radius: 3.8 };

	function insideRounded(x, z, halfX, z0, z1, radius) {
		var cz = (z0 + z1) / 2;
		var halfZ = (z1 - z0) / 2;
		var qx = Math.abs(x) - (halfX - radius);
		var qz = Math.abs(z - cz) - (halfZ - radius);
		if (qx <= 0 || qz <= 0) return Math.abs(x) <= halfX && Math.abs(z - cz) <= halfZ;
		return qx * qx + qz * qz <= radius * radius;
	}

	function insideHead(x, z) {
		return insideRounded(x, z, HEAD.x, HEAD.z0, HEAD.z1, HEAD.radius);
	}

	function frontColour(x, z) {
		if (!insideRounded(x, z, PANEL.x, PANEL.z0, PANEL.z1, 1.8)) {
			// Speaker strip under the glass.
			var grille = z < PANEL.z0 && z > HEAD.z0 + 0.8 && Math.abs(x) < HEAD.x - 1 && (Math.round(x) + Math.round(z)) % 2 === 0;
			return rgb(grille ? '#3a3f46' : '#5a6069');
		}
		var lx = x - LENS.x;
		var lz = z - LENS.z;
		var r = Math.sqrt(lx * lx + lz * lz);
		if (r <= LENS.radius) {
			if (r > LENS.radius - 0.9) return rgb('#c3c8cf');
			if (lx < -0.3 && lz > 0.3 && r > 0.7 && r < 2) return rgb('#a3d3ff');
			return rgb('#1d2c47');
		}
		if (x > -5.6 && x < -2.8 && Math.abs(z - LENS.z) < 0.6) return rgb('#3a3f47');
		return rgb('#15181d');
	}

	function projectorPoints() {
		var points = [];
		var yaw = PROJECTOR_YAW;
		var graphite = rgb('#575d66');
		var post = { top: rgb('#4c525b'), front: rgb('#3f454e'), side: rgb('#3f454e') };

		function push(v, colour) {
			var p = rotate(v, yaw);
			points.push({ x: p[0], y: p[1], z: p[2], colour: colour });
		}

		// Round puck base with a lighter top.
		addDisc(points, 0, 0, 2.6, 8.6, function (x, y, r) { return shade(rgb(r > 6.6 ? '#c9cdd2' : r > 3 ? '#b4b9bf' : '#c9cdd2'), [0, 0, 1]); });
		addWall(points, 0, 0, 8.6, 0, 2.6, function (a, z, normal) { return shade(rgb('#7a8089'), normal, 0.75); });

		// Two posts up to the pivots on the sides of the head.
		addBox(points, { x0: -9.8, x1: -8.6, y0: -1.3, y1: 1.3, z0: 2.6, z1: 17 }, post, yaw);
		addBox(points, { x0: 8.6, x1: 9.8, y0: -1.3, y1: 1.3, z0: 2.6, z1: 17 }, post, yaw);

		for (var x = -HEAD.x; x <= HEAD.x; x += STEP) {
			for (var z = HEAD.z0; z <= HEAD.z1; z += STEP) {
				if (!insideHead(x, z)) continue;
				push([x, HEAD.y, z], shade(frontColour(x, z), rotate([0, 1, 0], yaw), 0.85));
				push([x, -HEAD.y, z], shade(graphite, rotate([0, -1, 0], yaw), 0.8));
				// Rounded shell, extruded front to back.
				var edge = !insideHead(x + 0.6, z) || !insideHead(x - 0.6, z) || !insideHead(x, z + 0.6) || !insideHead(x, z - 0.6);
				if (!edge) continue;
				var nx = insideHead(x + 0.6, z) ? (insideHead(x - 0.6, z) ? 0 : -1) : 1;
				var nz = insideHead(x, z + 0.6) ? (insideHead(x, z - 0.6) ? 0 : -1) : 1;
				var normal = rotate(normalise([nx, 0, nz || (nx ? 0 : 1)]), yaw);
				for (var y = -HEAD.y; y <= HEAD.y; y += STEP) {
					// Vent grille on the lower part of the sides.
					var grille = nz === 0 && z < HEAD.z0 + 4.5 && Math.abs(y) < HEAD.y - 1 && (Math.round(y) + Math.round(z)) % 2 === 0;
					push([x, y, z], shade(grille ? rgb('#33373e') : graphite, normal, 0.8));
				}
			}
		}

		// Pivot caps where the posts hold the head.
		[-1, 1].forEach(function (side) {
			for (var u = -1.5; u <= 1.5; u += STEP) {
				for (var v = -1.5; v <= 1.5; v += STEP) {
					if (u * u + v * v > 2.2) continue;
					push([side * 9.9, u, 16.2 + v], shade(rgb('#6b7179'), rotate([side, 0, 0], yaw), 0.8));
				}
			}
		});
		return points;
	}

	/* ---------- hand-drawn characters ----------
	   Small pixel maps, one letter per pixel, outlined automatically. */

	var SKIN = { s: '#f1c39b', S: '#d9a57c', n: '#f08aa0' };

	// The rooster: shirtless, bare feet, facing the cheesecake on the left.
	// Both frames share the exact same legs so he never slides between poses.
	var ROOSTER_COLOURS = Object.assign({
		w: '#ffffff', g: '#dedede', r: '#e0453a', y: '#f5b31c', k: '#212931', p: '#454b57'
	}, SKIN);

	var ROOSTER_LEGS = [
		'..........ppp.......',
		'..........ppp.......',
		'..........ppp.......',
		'..........ppp....s..',
		'..........ppppppsss.'
	];

	var ROOSTER_FRAMES = {
		// Kneeling, face on the floor.
		bow: [
			'....................',
			'....................',
			'....................',
			'....................',
			'....................',
			'....................',
			'....................',
			'....................',
			'....................',
			'....................',
			'.wwww..sssppp.......',
			'rwwwwwsssSppp.......',
			'rwwwwgsns.ppp.......',
			'rwwwgg.s..ppp....s..',
			'.yyg..ss..ppppppsss.'
		],
		// Kneeling upright, arms wide, beak to the sky.
		pray: [
			'...........r.r......',
			'..........rrrr......',
			'....ss...wwwwww...ss',
			'.....s..ywkwwwwg..s.',
			'.....s.yywwwwwwg..s.',
			'......s.rwwwwwwg.s..',
			'......s.r.wwwwg..s..',
			'.......s.sssss..s...',
			'........ssnsnSss....',
			'.........ssssS......'
		].concat(ROOSTER_LEGS)
	};

	// The guitarist: chibi, sleeveless black top, a big black-and-gold Thai
	// Yak mask in golds only, leaning back mid-solo on a red Flying V with a
	// pointy headstock.
	var GUITARIST_COLOURS = Object.assign({
		g: '#e0b13a', G: '#a87b1c', l: '#fff4bf', k: '#2a2622',
		c: '#3a3f48', C: '#555b66', p: '#2c3038', b: '#16181c',
		R: '#d8262c', D: '#9e1b20', W: '#f4f4f4', m: '#c9ccd1', N: '#8a5a2b', h: '#1c1d21'
	}, SKIN);

	var GUITARIST_FRAMES = [
		[
			'.............g..........',
			'.............g..........',
			'............gGg.........',
			'.............g..........',
			'...........ggGgg........',
			'............gGg.........',
			'..........gggGggg.......',
			'.........GgGgGgGgG......',
			'.........kggkkkggk......',
			'.........kllkgkllk......',
			'........gklkkgklkkg.....',
			'........gkkkkgkkkkg.....',
			'h.......gkGlgGglGkg.....',
			'.hh......kGgGlGgGk......',
			'..hN......kkkkkkk.......',
			'....N.......ssS.........',
			'.....N....sssccccC......',
			'.....sNsss..SccccCs.....',
			'......sN...cccccC.S.....',
			'........N.cccccC.s......',
			'.........Nmmppsss.......',
			'.........RRRRssR........',
			'........D.RRDDRRRRR.....',
			'.........DRR..DDDRR.....',
			'.........pDRR..ppDD.....',
			'........ppDRR...pp......',
			'.......pp..DRR..pp......',
			'......pppp......ppp.....',
			'....bbbbbb......bbbbb...'
		],
		[
			'.............g..........',
			'.............g..........',
			'............gGg.........',
			'.............g..........',
			'...........ggGgg........',
			'............gGg.........',
			'..........gggGggg.......',
			'.........GgGgGgGgG......',
			'.........kggkkkggk......',
			'.........kllkgkllk......',
			'........gklkkgklkkg.....',
			'........gkkkkgkkkkg.....',
			'h.......gkGlgGglGkg.....',
			'.hh......kGgGlGgGk......',
			'..hN......kkkkkkk.......',
			'....N.......ssS.........',
			'.....Ns...sssccccC......',
			'......ssss..SccccCs.....',
			'.......N...cccccC.S.....',
			'........N.cccccC.s......',
			'.........Nmmpppss.......',
			'.........RRRRRsR........',
			'........D.RRDsRRRRR.....',
			'.........DRR..DDDRR.....',
			'.........pDRR..ppDD.....',
			'........ppDRR...pp......',
			'.......pp..DRR..pp......',
			'......pppp......ppp.....',
			'....bbbbbb......bbbbb...'
		]
	];

	var MINI_CAKE = ['..ddd..', '.ddddd.', 'cdddddc', 'ccccccc', '.ccccc.'];
	var MINI_CAKE_COLOURS = { d: '#5c3017', c: '#f6efdf' };

	function pixelImage(rows, palette) {
		var height = rows.length + 2;
		var width = rows[0].length + 2;
		var grid = [];
		for (var y = 0; y < height; y++) {
			grid.push([]);
			for (var x = 0; x < width; x++) {
				var key = (rows[y - 1] || '')[x - 1];
				grid[y].push(key && palette[key] ? rgb(palette[key]) : null);
			}
		}
		var image = new ImageData(width, height);
		for (var py = 0; py < height; py++) {
			for (var px = 0; px < width; px++) {
				var colour = grid[py][px];
				if (!colour) {
					var touches = (grid[py - 1] && grid[py - 1][px]) || (grid[py + 1] && grid[py + 1][px]) || grid[py][px - 1] || grid[py][px + 1];
					if (!touches) continue;
					colour = OUTLINE;
				}
				var i = (py * width + px) * 4;
				image.data[i] = colour[0];
				image.data[i + 1] = colour[1];
				image.data[i + 2] = colour[2];
				image.data[i + 3] = 255;
			}
		}
		return image;
	}

	/* ---------- layout ---------- */

	function layout() {
		var laneWidth = lane.clientWidth;
		var cakeWidth = cakeButton.offsetWidth;
		var projectorWidth = projectorCanvas.offsetWidth;
		lane.style.height = Math.max(cakeCanvas.offsetHeight, projectorCanvas.offsetHeight, guitaristCanvas.offsetHeight, roosterCanvas.offsetHeight) + 'px';
		var roosterLeft = Math.round(laneWidth / 2 - roosterCanvas.offsetWidth / 2);
		rooster.style.left = roosterLeft + 'px';
		guitarist.style.left = roosterLeft + roosterCanvas.offsetWidth + 2 * PIXEL + 'px';

		var maxLeft = Math.max(0, laneWidth - projectorWidth - cakeWidth - 8);
		var cakeLeft = Math.min(Math.max(progress * laneWidth - cakeWidth / 2, 0), maxLeft);
		cakeButton.style.left = cakeLeft + 'px';

		var labelWidth = raisedLabel.offsetWidth;
		var maxLabelLeft = Math.max(0, laneWidth - goalLabel.offsetWidth - labelWidth - 12);
		var labelLeft = Math.min(Math.max(cakeLeft + cakeWidth / 2 - labelWidth / 2, 0), maxLabelLeft);
		raisedLabel.style.left = labelLeft + 'px';
	}

	function formatBaht(amount) {
		return String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ฿';
	}

	/* ---------- start ---------- */

	var bar = document.querySelector('[data-bar]');

	function showFund() {
		var raised = slices * perSlice + extra;
		progress = Math.min(raised / goal, 1);
		document.querySelector('[data-raised-amount]').textContent = formatBaht(raised);
		document.querySelector('[data-goal-amount]').textContent = formatBaht(goal);
		document.querySelector('[data-count]').textContent = slices + (slices === 1 ? ' slice' : ' slices') + (extra ? ' + other sweets' : '');
		document.querySelector('[data-bar-fill]').style.width = progress * 100 + '%';
		bar.setAttribute('aria-valuemax', String(goal));
		bar.setAttribute('aria-valuenow', String(raised));
		bar.setAttribute('aria-valuetext', formatBaht(raised) + ' of ' + formatBaht(goal));
	}

	showFund();
	fetch(FUND_URL)
		.then(function (response) { return response.ok ? response.json() : null; })
		.then(function (data) {
			if (!data || typeof data.slices !== 'number') return;
			slices = data.slices;
			perSlice = data.perSlice || perSlice;
			extra = data.extra || 0;
			showFund();
			layout();
		})
		.catch(function () { /* keep the fallback numbers */ });

	var fullCake = cakePoints(0);
	var cakeBox = boundsOf(fullCake);
	var cakeFrames = [rasterise(fullCake, cakeBox)];
	for (var eaten = 1; eaten <= SLICE_COUNT; eaten++) cakeFrames.push(rasterise(cakePoints(eaten), cakeBox));

	var projector = projectorPoints();
	var projectorFrames = [rasterise(projector, boundsOf(projector))];
	var roosterFrames = { bow: pixelImage(ROOSTER_FRAMES.bow, ROOSTER_COLOURS), pray: pixelImage(ROOSTER_FRAMES.pray, ROOSTER_COLOURS) };
	var guitaristFrames = GUITARIST_FRAMES.map(function (rows) { return pixelImage(rows, GUITARIST_COLOURS); });
	var miniCake = pixelImage(MINI_CAKE, MINI_CAKE_COLOURS);

	show(cakeCanvas, cakeFrames[0]);
	show(projectorCanvas, projectorFrames[0]);
	show(roosterCanvas, roosterFrames.pray);
	show(guitaristCanvas, guitaristFrames[0]);

	if (!reduceMotion) {
		// Slices vanish one by one like a loader, then the cake comes back.
		var sequence = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 8];
		var step = 0;
		window.setInterval(function () {
			step = (step + 1) % sequence.length;
			show(cakeCanvas, cakeFrames[sequence[step]]);
		}, 280);

		// The rooster bows to the cake, then rises with open arms and begs.
		var pleas = ['please!', 'eat more cakes!'];
		var plea = 0;
		var praying = true;
		window.setInterval(function () {
			praying = !praying;
			show(roosterCanvas, praying ? roosterFrames.pray : roosterFrames.bow);
			if (!praying) return;
			var bubble = document.createElement('span');
			bubble.className = 'plea';
			bubble.textContent = pleas[plea];
			plea = (plea + 1) % pleas.length;
			bubble.addEventListener('animationend', function () { bubble.remove(); });
			rooster.appendChild(bubble);
		}, 1000);

		// The guitarist shreds: both hands twitch on the strings.
		var lick = 0;
		window.setInterval(function () {
			lick = 1 - lick;
			show(guitaristCanvas, guitaristFrames[lick]);
		}, 160);

		// Now and then a tiny cheesecake or two flies out of the solo, always
		// backwards: a real throw under gravity that bounces, slides and fades.
		var GRAVITY = 900; // px per second squared
		function throwCake() {
			var cake = document.createElement('canvas');
			cake.className = 'sprite mini-cake';
			show(cake, miniCake);
			cake.style.visibility = 'hidden';
			lane.appendChild(cake);

			var floor = lane.clientHeight - cake.offsetHeight;
			var maxX = lane.clientWidth - cake.offsetWidth;
			var x = guitarist.offsetLeft + guitarist.offsetWidth * 0.45;
			var y = lane.clientHeight - guitarist.offsetHeight * 0.55;
			var vx = 35 + Math.random() * 35;
			var vy = -(170 + Math.random() * 90);
			var resting = 0;
			var last = null;

			function step(now) {
				var dt = last === null ? 0 : Math.min((now - last) / 1000, 0.05);
				last = now;
				cake.style.visibility = '';

				vy += GRAVITY * dt;
				x += vx * dt;
				y += vy * dt;
				if (x > maxX) { x = maxX; vx = -vx * 0.4; }
				if (y >= floor) {
					y = floor;
					vy = Math.abs(vy) > 60 ? -vy * 0.35 : 0;
					vx *= 0.6;
				}
				if (vy === 0 && y === floor) {
					vx *= Math.pow(0.02, dt);
					resting += dt;
				}
				cake.style.transform = 'translate(' + Math.round(x) + 'px, ' + Math.round(y) + 'px)';
				cake.style.opacity = resting > 0.6 ? String(Math.max(0, 1 - (resting - 0.6) / 0.4)) : '';
				if (resting < 1) window.requestAnimationFrame(step);
				else cake.remove();
			}
			window.requestAnimationFrame(step);
		}

		function popCakes() {
			throwCake();
			if (Math.random() < 0.3) window.setTimeout(throwCake, 180);
			window.setTimeout(popCakes, 5000 + Math.random() * 5000);
		}
		window.setTimeout(popCakes, 2500);
	}

	// Each sprite opens its own story below; only one is open at a time.
	var panels = [
		{ button: cakeButton, about: document.querySelector('[data-about="cake"]'), event: 'cheesecake_info_open' },
		{ button: projectorButton, about: document.querySelector('[data-about="projector"]'), event: 'projector_info_open' }
	];

	panels.forEach(function (panel) {
		panel.button.addEventListener('click', function () {
			var open = !panel.about.classList.contains('is-open');
			panels.forEach(function (other) {
				var isThis = other === panel;
				other.about.classList.toggle('is-open', isThis && open);
				other.button.setAttribute('aria-expanded', String(isThis && open));
			});
			if (panel.button === cakeButton) tapMe.classList.add('is-gone');
			if (!open) return;
			window.setTimeout(function () {
				panel.about.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
			}, 360);
			if (typeof window.gtag === 'function') {
				window.gtag('event', panel.event);
			}
		});
	});

	window.addEventListener('resize', layout);
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
	layout();
})();
