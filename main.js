
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

/** 
 * @return {Bezier}
 * */
const newBezier = (/**@type Point*/p) => {
    return {
        points: [p],
        push: function (p) {
            this.points.push(p)
        },
    }
}

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
    for (t = 0.0; t < 1.0; t += 0.001) {
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
/////////////////////////  multi-bezier render  ////////////////////////////
////////////////////////////////////////////////////////////////////////////

/** @typedef {Point[]} Bezier */

const manager = new function Manager() {
    this.sel = 0
    this.beziers = []
    this.addPoint = function (/**@type Point*/p, /**@type boolean*/alt) {
        if (alt) {
            this.beziers.push(newBezier(p))
        }
        this.beziers.push(bezier)
    }

    this.render = () => {
        for (i = 0; i < this.beziers.length; i++) {
            nbezier(this.beziers[i])
        }
    }
}

////////////////////////////////////////////////////////////////////////////
//////////////////////////////  canvas  ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resize = () => {
    canvas.width = window.widinnerWidth;
    canvas.height = window.innerHeight;
}
resize()
window.addEventListener('resize', resize)

const /**@type Point[]*/points = []

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

    nrender(points)
}

canvas.ondblclick = (e) => {
    if (e.altKey) { // new bezier

    }
    points.push(np(e.x, e.y))
    nrender(points)
}

////////////////////////////////////////////////////////////////////////////
//////////////////////////////  rebuild  ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////

const getNearPoint = (/**@type Point*/p, rad) => {
    for (ib = 0; ib < beziers.length; ib++) {
        for (ip = 0; ip < beziers[ib].length; ip++) {
            if (pnear(beziers[ib][ip], p, rad)) {
                return [b, ip]
            }
        }
    }
    return [-1, -1]
}

var selb = -1
var sellocb = -1
var isDown = false
const /**@type Bezier[]*/ beziers = []

const render = () => {
    beziers.forEach((b, ib) => {
        b.forEach((p, ip) => {
            if (ib == selb && ip == sellocb) {
                pbold(p, "red")
            } else {
                pbold(p, "blue")
            }
        })
        nbezier(b)
    })
}

const rad = 10
const onmousedown = (e) => {
    var pm = np(e.x, e.y)
    [selb, sellocb] = getNearPoint(pm, rad)
    isDown = (selb != -1 && sellocb != -1)
    render()
}

const onmousemove = (e) => {
    if (!isDown) {
        return
    }
    if (selb == -1 || sellocb == -1) {
        return
    }
    var pm = np(e.x, e.y)
    beziers[selb][sellocb].x = pm.x
    beziers[selb][sellocb].y = pm.y
    render()
}

const onmouseup = (e) => {
    isDown = false
}

const ondblclick = (e) => {
    var pm = np(e.x, e.y)
    if (e.altKey) { // remove point
        if (selb == -1 || sellocb == -1) { // if not point selected
            return
        }
        beziers[selb].splice(sellocb, 1) // removes point
        render()
        return
    }
    if (selb == -1 || sellocb == -1) { // if no point selected
        // add point at mouse
        if (beziers.length==0) {
            beziers.push(newBezier(pm))
            render()
            return
        }
        beziers[beziers.length-1].push(pm)
        return
    }
    const [nselb, nsellocb, ok] = getNextAddress(selb, sellocb)
    if (!ok) {
        return // is last point -> do nothing
    }



    selb = nselb
    sellocb = nsellocb

    // add point between sel point and next
    //if last point do nothing
}

const getNextAddress = (selb, sellocb) => {
    if (beziers[selb].length-1 == sellocb) { // is last bezier in point
        if (beziers.length-1 == selb) { // is last bezier
            return [selb, sellocb, false] // there is no next address
        }
        return [selb+1, 0, true] // next bezier
    }
    return [selb, sellocb+1, true] // just return net point
}