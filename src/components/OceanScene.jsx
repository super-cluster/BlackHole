import { useEffect, useRef } from 'react'
import './OceanScene.css'

// ─────────────────────────────────────────────────
// DRAW: Moon
// ─────────────────────────────────────────────────
function drawMoon(ctx, x, y, r) {
  const glow = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 3)
  glow.addColorStop(0, 'rgba(255,240,160,0.18)')
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill()

  const body = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r)
  body.addColorStop(0, '#fff8e1'); body.addColorStop(0.6, '#f5e6a3'); body.addColorStop(1, '#d4b44a')
  ctx.fillStyle = body
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = 'rgba(180,140,50,0.22)'
  ;[[0.3,-0.25,0.15],[-0.35,0.2,0.1],[0.1,0.35,0.12]].forEach(([dx,dy,dr]) => {
    ctx.beginPath(); ctx.arc(x+r*dx, y+r*dy, r*dr, 0, Math.PI*2); ctx.fill()
  })
}

// ─────────────────────────────────────────────────
// DRAW: Distant Island
// ─────────────────────────────────────────────────
function drawIsland(ctx, cx, baseY) {
  ctx.fillStyle = 'rgba(6,18,38,0.88)'
  ctx.beginPath()
  ctx.moveTo(cx-80, baseY)
  ctx.quadraticCurveTo(cx-55, baseY-50, cx-20, baseY-65)
  ctx.quadraticCurveTo(cx+10, baseY-75, cx+30, baseY-55)
  ctx.quadraticCurveTo(cx+60, baseY-35, cx+80, baseY)
  ctx.closePath(); ctx.fill()

  // palm tree
  ctx.strokeStyle = 'rgba(6,18,38,0.95)'; ctx.lineWidth = 4; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(cx+15, baseY-55); ctx.lineTo(cx+12, baseY-85); ctx.stroke()
  ;[[-22,-10],[18,-8],[-5,-18],[14,-18]].forEach(([dx,dy]) => {
    ctx.beginPath()
    ctx.moveTo(cx+12, baseY-85)
    ctx.quadraticCurveTo(cx+12+dx*0.5, baseY-85+dy*0.5, cx+12+dx, baseY-85+dy)
    ctx.stroke()
  })
}

// ─────────────────────────────────────────────────
// DRAW: Going Merry Ship
// ─────────────────────────────────────────────────
function drawGoingMerry(ctx, cx, cy, t) {
  ctx.save()
  ctx.translate(cx, cy + Math.sin(t*0.9)*4)
  ctx.rotate(Math.sin(t*0.9)*0.025)

  // Shadow
  ctx.fillStyle = 'rgba(0,20,60,0.35)'
  ctx.beginPath(); ctx.ellipse(5, 55, 88, 10, 0, 0, Math.PI*2); ctx.fill()

  // Hull
  ctx.beginPath()
  ctx.moveTo(-88,-4)
  ctx.bezierCurveTo(-93,16,-85,46,-50,53)
  ctx.lineTo(60,53)
  ctx.bezierCurveTo(95,46,90,16,88,-4)
  ctx.closePath()
  const h = ctx.createLinearGradient(-88,0,88,53)
  h.addColorStop(0,'#5c2e0a'); h.addColorStop(0.4,'#7a3d14'); h.addColorStop(1,'#3d1a06')
  ctx.fillStyle = h; ctx.fill()
  ctx.strokeStyle = '#9b5523'; ctx.lineWidth = 2; ctx.stroke()

  // Gold hull stripe
  ctx.strokeStyle = '#c9a832'; ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(-87,5); ctx.bezierCurveTo(-88,12,-84,20,-75,24)
  ctx.lineTo(75,24); ctx.bezierCurveTo(84,20,88,12,87,5); ctx.stroke()

  // Deck
  const dk = ctx.createLinearGradient(-82,-15,-82,0)
  dk.addColorStop(0,'#8b5523'); dk.addColorStop(1,'#6b3a14')
  ctx.fillStyle = dk; ctx.beginPath(); ctx.rect(-82,-16,164,14); ctx.fill()
  ctx.strokeStyle = '#9b6533'; ctx.lineWidth = 1; ctx.stroke()

  // Rail posts
  ctx.strokeStyle = '#6b3a14'; ctx.lineWidth = 2
  ;[-65,-45,-25,-5,15,35,55].forEach(px => {
    ctx.beginPath(); ctx.moveTo(px,-15); ctx.lineTo(px,-26); ctx.stroke()
  })
  ctx.strokeStyle = '#9b5523'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(-82,-26); ctx.lineTo(80,-26); ctx.stroke()

  // Sheep Head (Going Merry)
  ctx.save(); ctx.translate(-84,-22)
  ctx.fillStyle = '#f5ead8'
  ctx.beginPath(); ctx.ellipse(2,-12,16,13,0,0,Math.PI*2); ctx.fill()
  ctx.strokeStyle = '#c9a878'; ctx.lineWidth = 1.5; ctx.stroke()
  ;[[-14,-18],[16,-18]].forEach(([ex,ey]) => {
    ctx.beginPath(); ctx.ellipse(ex,ey,8,5,ex<0?-0.5:0.5,0,Math.PI*2); ctx.fill(); ctx.stroke()
  })
  ctx.fillStyle = '#f5ead8'; ctx.beginPath(); ctx.rect(-4,0,10,10); ctx.fill()
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ;[[-6,-14],[8,-14]].forEach(([ex,ey]) => { ctx.beginPath(); ctx.arc(ex,ey,2.5,0,Math.PI*2); ctx.fill() })
  ctx.restore()

  // Cannon ports
  ctx.fillStyle = '#2a1205'
  ;[-10,25,55].forEach(px => {
    ctx.beginPath(); ctx.ellipse(px,37,6,4,0,0,Math.PI*2); ctx.fill()
    ctx.fillStyle='#1a0a02'; ctx.beginPath(); ctx.ellipse(px,37,4,3,0,0,Math.PI*2); ctx.fill()
    ctx.fillStyle='#2a1205'
  })

  // === MAST ===
  ctx.save(); ctx.translate(-5,-15)
  ctx.fillStyle = '#4a2a0a'; ctx.beginPath(); ctx.rect(-3.5,-130,7,130); ctx.fill()

  // Yard arm
  ctx.strokeStyle = '#4a2a0a'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(-50,-90); ctx.lineTo(55,-90); ctx.stroke()

  // Main sail
  const sw = Math.sin(t*1.2)*10
  const sg = ctx.createLinearGradient(-5,-120,55+sw,-30)
  sg.addColorStop(0,'rgba(245,238,215,0.95)'); sg.addColorStop(1,'rgba(225,215,185,0.9)')
  ctx.fillStyle = sg; ctx.beginPath()
  ctx.moveTo(3,-120); ctx.bezierCurveTo(40+sw,-100,60+sw,-68,54+sw,-30); ctx.lineTo(3,-35); ctx.closePath()
  ctx.fill(); ctx.strokeStyle='rgba(180,155,100,0.7)'; ctx.lineWidth=1.5; ctx.stroke()

  // Cross on sail (Straw hat crew)
  ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 3.5
  ctx.beginPath(); ctx.moveTo(28+sw*0.4,-95); ctx.lineTo(28+sw*0.4,-58); ctx.moveTo(12+sw*0.4,-78); ctx.lineTo(44+sw*0.4,-78); ctx.stroke()

  // Jolly Roger flag
  const fw = Math.sin(t*2.5)*5; const fw2 = Math.sin(t*2.5+0.5)*3
  ctx.fillStyle = '#0a0a1a'
  ctx.beginPath(); ctx.moveTo(0,-128); ctx.lineTo(0+fw,-120); ctx.lineTo(32+fw2,-120); ctx.lineTo(32+fw,-128); ctx.closePath(); ctx.fill()
  ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(11+fw*0.3,-124,4.5,0,Math.PI*2); ctx.fill()
  ctx.fillStyle = '#0a0a1a'
  ;[[9,-125],[13,-125]].forEach(([ex,ey]) => { ctx.beginPath(); ctx.arc(ex+fw*0.2,ey,1.2,0,Math.PI*2); ctx.fill() })
  ctx.strokeStyle = 'white'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(5+fw*0.2,-120); ctx.lineTo(17+fw*0.2,-128); ctx.moveTo(17+fw*0.2,-120); ctx.lineTo(5+fw*0.2,-128); ctx.stroke()

  ctx.restore() // mast

  // Bowsprit
  ctx.save(); ctx.translate(-82,-15); ctx.rotate(-0.44)
  ctx.strokeStyle = '#4a2a0a'; ctx.lineWidth = 3.5
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-65); ctx.stroke()
  const fs = Math.sin(t*1.2+0.4)*5
  const fg = ctx.createLinearGradient(0,-10,25+fs,-60)
  fg.addColorStop(0,'rgba(245,238,215,0.88)'); fg.addColorStop(1,'rgba(225,215,185,0.82)')
  ctx.fillStyle = fg; ctx.beginPath()
  ctx.moveTo(0,-10); ctx.bezierCurveTo(20+fs,-20,28+fs,-40,20+fs*0.5,-60); ctx.lineTo(0,-58); ctx.closePath(); ctx.fill()
  ctx.restore()

  ctx.restore() // ship
}

// ─────────────────────────────────────────────────
// DRAW: Luffy
// ─────────────────────────────────────────────────
function drawLuffy(ctx, cx, cy, t) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(Math.sin(t*0.9)*0.03)

  const arm = Math.sin(t*1.1)*4

  // Shoes
  ctx.fillStyle = '#1a0a02'
  ctx.beginPath(); ctx.ellipse(-7,62,9,4,-0.1,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(7,62,9,4,0.1,0,Math.PI*2); ctx.fill()

  // Pants
  ctx.fillStyle = '#1a3a6b'
  ctx.beginPath(); ctx.roundRect(-13,36,11,28,[3,3,5,5]); ctx.fill()
  ctx.beginPath(); ctx.roundRect(2,36,11,28,[3,3,5,5]); ctx.fill()

  // Belt
  ctx.fillStyle = '#8b5523'; ctx.beginPath(); ctx.rect(-14,33,28,5); ctx.fill()
  ctx.fillStyle = '#e8c547'; ctx.beginPath(); ctx.rect(-4,33,8,5); ctx.fill()

  // Vest (red)
  ctx.fillStyle = '#c0392b'
  ctx.beginPath()
  ctx.moveTo(-15,4); ctx.lineTo(-15,38); ctx.lineTo(15,38); ctx.lineTo(15,4); ctx.lineTo(8,2); ctx.lineTo(0,3); ctx.lineTo(-8,2); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#c8845c'
  ctx.beginPath(); ctx.moveTo(-4,4); ctx.lineTo(4,4); ctx.lineTo(2,38); ctx.lineTo(-2,38); ctx.closePath(); ctx.fill()
  ctx.fillStyle = 'rgba(100,10,0,0.2)'; ctx.beginPath(); ctx.rect(-15,4,5,34); ctx.fill()

  // Arms
  ctx.strokeStyle = '#c8845c'; ctx.lineWidth = 9; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-15,14); ctx.bezierCurveTo(-35,10,-55-arm,0,-65-arm,-10); ctx.stroke()
  ctx.fillStyle = '#c8845c'; ctx.beginPath(); ctx.arc(-66-arm,-12,7,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.moveTo(15,14); ctx.bezierCurveTo(28,16,32,22,30,30); ctx.stroke()
  ctx.fillStyle = '#c8845c'; ctx.beginPath(); ctx.arc(30,32,6,0,Math.PI*2); ctx.fill()

  // Neck
  ctx.fillStyle = '#c8845c'; ctx.beginPath(); ctx.rect(-5,-5,10,12); ctx.fill()

  // Head
  ctx.fillStyle = '#c8845c'; ctx.beginPath(); ctx.arc(0,-20,19,0,Math.PI*2); ctx.fill()
  ctx.fillStyle = 'rgba(150,80,30,0.18)'; ctx.beginPath(); ctx.arc(6,-18,12,0,Math.PI*2); ctx.fill()

  // Scar
  ctx.strokeStyle='#8b2020'; ctx.lineWidth=2; ctx.lineCap='round'
  ctx.beginPath(); ctx.moveTo(-13,-14); ctx.lineTo(-8,-10); ctx.stroke()

  // Eyes (whites)
  ctx.fillStyle = 'white'
  ctx.beginPath(); ctx.ellipse(-7,-20,6,7,-0.1,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(7,-20,6,7,0.1,0,Math.PI*2); ctx.fill()
  // Iris
  ctx.fillStyle='#1a0a02'
  ctx.beginPath(); ctx.ellipse(-7,-19,4.5,5.5,0,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(7,-19,4.5,5.5,0,0,Math.PI*2); ctx.fill()
  // Shine
  ctx.fillStyle='white'
  ctx.beginPath(); ctx.arc(-5,-21,1.5,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(9,-21,1.5,0,Math.PI*2); ctx.fill()

  // Brows
  ctx.strokeStyle='#2a0a02'; ctx.lineWidth=2.5
  ctx.beginPath(); ctx.moveTo(-13,-27); ctx.quadraticCurveTo(-9,-30,-3,-29); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(3,-29); ctx.quadraticCurveTo(9,-30,13,-27); ctx.stroke()

  // Nose
  ctx.fillStyle = '#b87050'; ctx.beginPath(); ctx.arc(2,-13,2.5,0,Math.PI*2); ctx.fill()

  // Big grin
  ctx.strokeStyle='#2a0a02'; ctx.lineWidth=2.5; ctx.lineCap='round'
  ctx.beginPath(); ctx.arc(0,-14,10,0.15,Math.PI-0.15); ctx.stroke()
  ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(0,-6,6,0,Math.PI); ctx.fill()

  // === STRAW HAT ===
  const hb = Math.sin(t*0.9)*1.5
  ctx.save(); ctx.translate(0, hb)
  // Shadow
  ctx.fillStyle='rgba(160,130,20,0.35)'; ctx.beginPath(); ctx.ellipse(2,-41,30,9,0.05,0,Math.PI*2); ctx.fill()
  // Brim
  const brimG = ctx.createLinearGradient(-28,-50,28,-36)
  brimG.addColorStop(0,'#e8c547'); brimG.addColorStop(0.5,'#f5d96a'); brimG.addColorStop(1,'#c9a832')
  ctx.fillStyle=brimG; ctx.beginPath(); ctx.ellipse(0,-43,28,8,0,0,Math.PI*2); ctx.fill()
  ctx.strokeStyle='#c9a832'; ctx.lineWidth=1.5; ctx.stroke()
  // Dome
  const domeG = ctx.createLinearGradient(-18,-72,18,-42)
  domeG.addColorStop(0,'#f5d96a'); domeG.addColorStop(0.4,'#e8c547'); domeG.addColorStop(1,'#c9a832')
  ctx.fillStyle=domeG; ctx.beginPath()
  ctx.moveTo(-18,-45); ctx.bezierCurveTo(-18,-68,-10,-77,0,-78); ctx.bezierCurveTo(10,-77,18,-68,18,-45); ctx.closePath()
  ctx.fill(); ctx.strokeStyle='#c9a832'; ctx.lineWidth=1.5; ctx.stroke()
  // Red band
  ctx.fillStyle='#cc2200'; ctx.beginPath()
  ctx.moveTo(-18,-46); ctx.lineTo(-18,-52); ctx.bezierCurveTo(-15,-56,15,-56,18,-52); ctx.lineTo(18,-46); ctx.bezierCurveTo(15,-49,-15,-49,-18,-46); ctx.closePath(); ctx.fill()
  // Shine
  ctx.fillStyle='rgba(255,248,200,0.4)'; ctx.beginPath(); ctx.ellipse(-5,-63,6,10,-0.3,0,Math.PI*2); ctx.fill()
  ctx.restore()

  ctx.restore()
}

// ─────────────────────────────────────────────────
// DRAW: Sea King Eye (peeking from water)
// ─────────────────────────────────────────────────
function drawSeaKing(ctx, x, y, t) {
  const py = y + Math.sin(t*0.35)*10
  // Body mass
  ctx.fillStyle = 'rgba(8,25,55,0.88)'
  ctx.beginPath(); ctx.ellipse(x, py+22, 45, 28, 0, 0, Math.PI*2); ctx.fill()
  // Eye glow
  const eg = ctx.createRadialGradient(x,py,0,x,py,20)
  eg.addColorStop(0,'rgba(255,200,50,0.95)'); eg.addColorStop(0.4,'rgba(200,80,0,0.7)'); eg.addColorStop(1,'transparent')
  ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(x,py,20,0,Math.PI*2); ctx.fill()
  // Pupil
  ctx.fillStyle='#08000f'; ctx.beginPath(); ctx.ellipse(x,py,9,12,0,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='rgba(255,160,0,0.5)'; ctx.beginPath(); ctx.ellipse(x,py,2,9,0,0,Math.PI*2); ctx.fill()
  // Tentacle tip
  ctx.strokeStyle='rgba(8,25,55,0.85)'; ctx.lineWidth=12; ctx.lineCap='round'
  ctx.beginPath(); ctx.moveTo(x+30,py+10); ctx.bezierCurveTo(x+50,py-15,x+60,py+5,x+55,py+25); ctx.stroke()
  ctx.strokeStyle='rgba(12,35,70,0.7)'; ctx.lineWidth=8
  ctx.beginPath(); ctx.moveTo(x+30,py+10); ctx.bezierCurveTo(x+50,py-15,x+60,py+5,x+55,py+25); ctx.stroke()
}

// ─────────────────────────────────────────────────
// DRAW: Seagulls
// ─────────────────────────────────────────────────
function drawSeagulls(ctx, t, W, H) {
  ;[{bx:0.05,by:0.22,ph:0,sp:28,sz:1},{bx:0.12,by:0.20,ph:1.3,sp:25,sz:0.8},{bx:0.08,by:0.24,ph:2.5,sp:22,sz:0.7},{bx:0.22,by:0.19,ph:0.7,sp:30,sz:0.9}].forEach(b => {
    const x = ((b.bx*W + t*b.sp*60) % (W*1.3)) - W*0.15
    const y = b.by*H + Math.sin(t*2+b.ph)*9
    const flap = Math.sin(t*5+b.ph)*0.5
    const s = 9*b.sz
    ctx.strokeStyle=`rgba(225,218,200,0.72)`; ctx.lineWidth=1.6*b.sz; ctx.lineCap='round'
    ctx.beginPath()
    ctx.moveTo(x-s, y+Math.sin(flap)*s*0.4)
    ctx.quadraticCurveTo(x-s*0.4, y-Math.cos(Math.abs(flap))*s*0.55, x, y)
    ctx.quadraticCurveTo(x+s*0.4, y-Math.cos(Math.abs(flap))*s*0.55, x+s, y+Math.sin(flap)*s*0.4)
    ctx.stroke()
  })
}

// ─────────────────────────────────────────────────
// DRAW: Foam
// ─────────────────────────────────────────────────
function drawFoam(ctx, W, baseY, t) {
  for (let i=0; i<22; i++) {
    const x = (i/22*W + t*38) % W
    const y = baseY + Math.sin(x*0.011+t*0.9)*13
    const a = 0.18 + Math.sin(i+t*3)*0.1
    ctx.fillStyle = `rgba(200,235,255,${Math.max(0.05,a)})`
    ctx.beginPath(); ctx.ellipse(x,y,5+Math.sin(i)*2,2.5,0,0,Math.PI*2); ctx.fill()
  }
}

// ─────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────
export default function OceanScene() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId, t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      animId = requestAnimationFrame(draw)
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const oceanTop = H * 0.55

      // Moon
      drawMoon(ctx, W*0.12, H*0.18, 42)

      // Moon reflection path on water
      const rg = ctx.createLinearGradient(W*0.12, oceanTop, W*0.12, H)
      rg.addColorStop(0,'rgba(232,197,71,0.1)'); rg.addColorStop(1,'rgba(232,197,71,0)')
      ctx.fillStyle = rg
      ctx.beginPath(); ctx.moveTo(W*0.07,oceanTop); ctx.lineTo(W*0.17,oceanTop); ctx.lineTo(W*0.26,H); ctx.lineTo(W*-0.02,H); ctx.closePath(); ctx.fill()

      // Distant islands
      drawIsland(ctx, W*0.07, oceanTop+4)
      drawIsland(ctx, W*0.88, oceanTop+6)

      // Ocean layers (3, back to front)
      const layers = [
        { yf:0.55, amp:20, per:0.006, spd:0.5, c1:'rgba(8,52,110,0.95)', c2:'rgba(3,16,40,1)' },
        { yf:0.60, amp:14, per:0.009, spd:0.75, c1:'rgba(10,72,138,0.95)', c2:'rgba(5,22,52,1)' },
        { yf:0.65, amp:9,  per:0.012, spd:1.0,  c1:'rgba(14,88,158,0.95)', c2:'rgba(7,28,62,1)' },
      ]
      layers.forEach(({yf,amp,per,spd,c1,c2}) => {
        const baseY = H*yf
        ctx.beginPath()
        for (let x=0; x<=W; x+=3) {
          const y = baseY + Math.sin(x*per + t*spd)*amp
          x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
        }
        ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath()
        const g = ctx.createLinearGradient(0,baseY,0,H)
        g.addColorStop(0,c1); g.addColorStop(1,c2)
        ctx.fillStyle = g; ctx.fill()
        // Crest highlight on front wave
        if (yf===0.65) {
          ctx.strokeStyle='rgba(140,210,255,0.22)'; ctx.lineWidth=2
          ctx.beginPath()
          for (let x=0; x<=W; x+=3) {
            const y = baseY + Math.sin(x*per+t*spd)*amp
            x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
          }
          ctx.stroke()
        }
      })

      // Foam
      drawFoam(ctx, W, H*0.65, t)

      // Seagulls
      drawSeagulls(ctx, t, W, H)

      // Sea King (left, emerging from water)
      drawSeaKing(ctx, W*0.13, H*0.70, t)

      // Going Merry Ship
      const sx = W*0.65
      const sy = H*0.65 + Math.sin(sx*0.009+t)*14
      drawGoingMerry(ctx, sx, sy-58, t)

      // Luffy on the ship
      drawLuffy(ctx, sx-12, sy-215, t)

      t += 1/60
    }
    draw()

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="ocean-canvas" aria-hidden="true" />
}
