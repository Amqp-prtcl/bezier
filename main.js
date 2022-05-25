
////////////////////////////////////////////////////////////////////////////
//////////////////////////////  utils  /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

const near = (/**@type Point*/a, /**@type Point*/b, /**@type number*/pre) => {
    return a + pre > b && a - pre < b
}

const pnear = (/**@type Point*/pa, /**@type Point*/pb, /**@type number*/rad) => {
    return near(pa.x, pb.x, rad) && near(pa.y, pb.y, rad)
}

const segment = (/**@type Point*/pa, /**@type Point*/pb, /**@type number*/w, c) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
}

/**
 * @return {Point}
 */
const np = (/**@type number*/x, /**@type number*/y) => {
    return {
        x: x,
        y: y
    }
}

const psmall = (/**@type Point*/p, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
}

const pbold = (/**@type Point*/p, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(p.x - 4, p.y - 4, 8, 8);
}

const lerp = (/**@type Point*/pa, /**@type Point*/pb, /**@type number*/t) => {
    return {
        x: pa.x + (pb.x - pa.x) * t,
        y: pa.y + (pb.y - pa.y) * t,
    }
}

////////////////////////////////////////////////////////////////////////////
//////////////////////////////  n render  //////////////////////////////////
////////////////////////////////////////////////////////////////////////////

const nlerp = (/**@type Point[]*/points, t) => {
    while (points.length > 1) {
        ps = []
        for (i = 0; i < points.length - 1; i++) {
            ps.push(lerp(points[i], points[i + 1], t))
        }
        points = ps
    }
    if (points.length == 0) {
        return np(0, 0)
    }
    return points[0]
}

const nbezier = (/**@type Point[]*/points) => {
    for (t = 0.0; t < 1.0; t += 0.1) {
        psmall(nlerp(points, t), "red")
    }
}

const nrender = (/**@type Point[]*/points) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const c = 'blue'
    points.forEach(p => pbold(p, c))

    const w = 2;
    for (i = 0; i < points.length - 1; i++) {
        segment(points[i], points[i + 1], w, c)
    }

    nbezier(points, 'red')
}

////////////////////////////////////////////////////////////////////////////
//////////////////////////////  canvas  ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize()
window.addEventListener('resize', resize)

const /**@type Point[]*/points = []

//render(pa, pb, pc, pd)
nrender(points)

var sel = -1;
canvas.onmousedown = (e) => {
    const rad = 10
    const pm = np(e.x, e.y)

    points.forEach((p, i) => { if (pnear(pm, p, rad)) { sel = i } })
}

canvas.onmouseup = (e) => {
    sel = -1
}

canvas.onmousemove = (e) => {
    if (sel == -1) {
        return
    }
    const pm = np(e.x, e.y)

    points[sel].x = pm.x
    points[sel].y = pm.y

    //render(pa, pb, pc, pd)
    nrender(points)
}

canvas.ondblclick = (e) => {
    points.push(np(e.x, e.y))
    nrender(points)
}