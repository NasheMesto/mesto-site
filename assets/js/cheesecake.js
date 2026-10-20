/* Cheesecake → projector fund: isometric pixel sprites and the progress bar. */
(function () {
	'use strict';

	var fund = document.querySelector('[data-fund]');
	var slices = Number(fund.getAttribute('data-slices')) || 0;
	var perSlice = Number(fund.getAttribute('data-per-slice')) || 100;
	var goal = Number(fund.getAttribute('data-goal')) || 1;
	var raised = slices * perSlice;
	var progress = Math.min(raised / goal, 1);

	var lane = document.querySelector('[data-lane]');
	var cakeButton = document.querySelector('[data-cake]');
	var cakeCanvas = document.querySelector('[data-cake-sprite]');
	var projectorCanvas = document.querySelector('[data-projector-sprite]');
	var raisedLabel = document.querySelector('[data-raised-label]');
	var goalLabel = document.querySelector('[data-goal-label]');
	var about = document.querySelector('[data-about]');
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

	/* ---------- JMGO N1S 4K ----------
	   Rounded graphite head: glossy black front panel with the lens on the
	   right, a light strip below it, held at the sides by a U-shaped gimbal. */

	var PROJECTOR_YAW = -0.35; // lens turned towards the cheesecake
	var HEAD = { x: 8.5, y: 4.5, z0: 5, z1: 17.5, radius: 3 };
	var LENS_Z = (HEAD.z0 + 3 + HEAD.z1 - 1) / 2;

	function insideHead(x, z) {
		var cz = (HEAD.z0 + HEAD.z1) / 2;
		var halfZ = (HEAD.z1 - HEAD.z0) / 2;
		var qx = Math.abs(x) - (HEAD.x - HEAD.radius);
		var qz = Math.abs(z - cz) - (halfZ - HEAD.radius);
		if (qx <= 0 || qz <= 0) return Math.abs(x) <= HEAD.x && Math.abs(z - cz) <= halfZ;
		return qx * qx + qz * qz <= HEAD.radius * HEAD.radius;
	}

	function frontColour(x, z) {
		var panelBottom = HEAD.z0 + 3;
		if (z < panelBottom) return rgb('#a9afb7');
		if (Math.abs(x) > HEAD.x - 1 || z > HEAD.z1 - 1) return rgb('#3f444c');
		var lx = x - 2.4;
		var lz = z - LENS_Z;
		var r = Math.sqrt(lx * lx + lz * lz);
		if (r <= 3.7) {
			if (r > 2.5) return rgb('#c3c9d1');
			if (lx < -0.3 && lz > 0.3 && r > 0.7 && r < 2) return rgb('#9fd4ff');
			return rgb('#1d3352');
		}
		if (x > -6 && x < -3 && Math.abs(z - LENS_Z) < 0.7) return rgb('#3a4049');
		return rgb('#15181d');
	}

	function projectorPoints() {
		var points = [];
		var yaw = PROJECTOR_YAW;
		var graphite = rgb('#4b5059');
		var gimbal = { top: rgb('#8a9099'), front: rgb('#767c85'), side: rgb('#767c85') };

		function push(v, colour) {
			var p = rotate(v, yaw);
			points.push({ x: p[0], y: p[1], z: p[2], colour: colour });
		}

		// Gimbal: base plate and two arms up to the pivots on the sides.
		addBox(points, { x0: -9.6, x1: 9.6, y0: -3, y1: 3, z0: 0, z1: 1.4 }, gimbal, yaw);
		addBox(points, { x0: -9.6, x1: -8.5, y0: -1.6, y1: 1.6, z0: 1.4, z1: 11.5 }, gimbal, yaw);
		addBox(points, { x0: 8.5, x1: 9.6, y0: -1.6, y1: 1.6, z0: 1.4, z1: 11.5 }, gimbal, yaw);

		for (var x = -HEAD.x; x <= HEAD.x; x += STEP) {
			for (var z = HEAD.z0; z <= HEAD.z1; z += STEP) {
				if (!insideHead(x, z)) continue;
				// Front and back faces.
				push([x, HEAD.y, z], frontColour(x, z));
				push([x, -HEAD.y, z], shade(graphite, rotate([0, -1, 0], yaw)));
				// Rounded shell, extruded front to back.
				var edge = !insideHead(x + 0.6, z) || !insideHead(x - 0.6, z) || !insideHead(x, z + 0.6) || !insideHead(x, z - 0.6);
				if (!edge) continue;
				var nx = insideHead(x + 0.6, z) ? (insideHead(x - 0.6, z) ? 0 : -1) : 1;
				var nz = insideHead(x, z + 0.6) ? (insideHead(x, z - 0.6) ? 0 : -1) : 1;
				var colour = shade(graphite, rotate(normalise([nx, 0, nz || (nx ? 0 : 1)]), yaw));
				for (var y = -HEAD.y; y <= HEAD.y; y += STEP) {
					// Speaker grille dots on the sides.
					var grille = nz === 0 && Math.round(y) % 2 === 0 && Math.round(z) % 2 === 0;
					push([x, y, z], grille ? shade(rgb('#3b3f46'), rotate([nx, 0, 0], yaw)) : colour);
				}
			}
		}

		// Pivot discs where the arms hold the head.
		[-1, 1].forEach(function (side) {
			for (var u = -1.6; u <= 1.6; u += STEP) {
				for (var v = -1.6; v <= 1.6; v += STEP) {
					if (u * u + v * v > 2.6) continue;
					push([side * 9.7, u, 11 + v], shade(rgb('#9aa0a8'), rotate([side, 0, 0], yaw)));
				}
			}
		});
		return points;
	}

	/* ---------- layout ---------- */

	function layout() {
		var laneWidth = lane.clientWidth;
		var cakeWidth = cakeButton.offsetWidth;
		var projectorWidth = projectorCanvas.offsetWidth;
		lane.style.height = Math.max(cakeCanvas.offsetHeight, projectorCanvas.offsetHeight) + 'px';

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

	document.querySelector('[data-raised-amount]').textContent = formatBaht(raised);
	document.querySelector('[data-goal-amount]').textContent = formatBaht(goal);
	document.querySelector('[data-count]').textContent = slices + (slices === 1 ? ' slice' : ' slices');
	document.querySelector('[data-bar-fill]').style.width = progress * 100 + '%';

	var bar = document.querySelector('[data-bar]');
	bar.setAttribute('aria-valuemax', String(goal));
	bar.setAttribute('aria-valuenow', String(raised));
	bar.setAttribute('aria-valuetext', formatBaht(raised) + ' of ' + formatBaht(goal));

	var fullCake = cakePoints(0);
	var cakeBox = boundsOf(fullCake);
	var cakeFrames = [rasterise(fullCake, cakeBox)];
	for (var eaten = 1; eaten <= SLICE_COUNT; eaten++) cakeFrames.push(rasterise(cakePoints(eaten), cakeBox));

	var projector = projectorPoints();
	var projectorFrames = [rasterise(projector, boundsOf(projector))];

	show(cakeCanvas, cakeFrames[0]);
	show(projectorCanvas, projectorFrames[0]);

	if (!reduceMotion) {
		// Slices vanish one by one like a loader, then the cake comes back.
		var sequence = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 8];
		var step = 0;
		window.setInterval(function () {
			step = (step + 1) % sequence.length;
			show(cakeCanvas, cakeFrames[sequence[step]]);
		}, 280);
	}

	cakeButton.addEventListener('click', function () {
		var open = !about.classList.contains('is-open');
		about.classList.toggle('is-open', open);
		cakeButton.setAttribute('aria-expanded', String(open));
		tapMe.classList.add('is-gone');
		if (!open) return;
		window.setTimeout(function () {
			about.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
		}, 360);
		if (typeof window.gtag === 'function') {
			window.gtag('event', 'cheesecake_info_open');
		}
	});

	window.addEventListener('resize', layout);
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
	layout();
})();
