
import { useEffect, useRef } from 'react';
import styled from 'styled-components';

const Loader = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId: number;

    // Particle config
    const PARTICLE_COUNT = 60;
    type Particle = {
      x: number;
      y: number;
      r: number;
      dx: number;
      dy: number;
      glow: number;
    };
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.5 + Math.random() * 2.5,
        dx: (Math.random() - 0.5) * 0.7,
        dy: (Math.random() - 0.5) * 0.7,
        glow: 0.5 + Math.random() * 1.5
      });
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 12 * p.glow;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fill();
        ctx.restore();

        // Move
        p.x += p.dx;
        p.y += p.dy;
        // Wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }
      animationId = window.requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationId) window.cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <StyledWrapper>
      <canvas ref={canvasRef} className="loader-bg-canvas" />
      <div aria-label="A hamster running in a cosmic, glowing wheel" role="img" className="wheel-and-hamster">
        <div className="wheel" />
        <div className="hamster">
          <div className="hamster__body">
            <div className="hamster__head">
              <div className="hamster__ear" />
              <div className="hamster__eye" />
              <div className="hamster__nose" />
            </div>
            <div className="hamster__limb hamster__limb--fr" />
            <div className="hamster__limb hamster__limb--fl" />
            <div className="hamster__limb hamster__limb--br" />
            <div className="hamster__limb hamster__limb--bl" />
            <div className="hamster__tail" />
          </div>
        </div>
        <div className="spoke" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* === COSMIC FUSION THEME VARIABLES === */
  --gradient-accent: linear-gradient(90deg, #ff512f, #dd2476);
  --c-border: rgba(255, 255, 255, 0.2);
  --c-glow: rgba(221, 36, 118, 0.8);
  --c-hamster-main: #f9d2b8; /* A lighter, cosmic-dust color */
  --c-hamster-shadow: #e3a587;
  --c-hamster-ear: #d18a70;
  --c-hamster-eye: #fff;
  --c-hamster-nose: #ff512f;

  /* === COMPONENT STYLES === */
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #18122B 0%, #2D1B4A 60%, #3A295C 100%);
  overflow: hidden; /* Hide overflow for star animations */
  position: relative;

  .loader-bg-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    pointer-events: none;
    background: transparent;
  }

  .wheel-and-hamster {
    --dur: 1s;
    position: relative;
    width: 12em;
    height: 12em;
    font-size: 14px;
    z-index: 2; /* Ensure hamster is above stars */
  }

  .wheel,
  .hamster,
  .hamster div,
  .spoke {
    position: absolute;
  }

  .wheel,
  .spoke {
    border-radius: 50%;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .wheel {
    background: radial-gradient(100% 100% at center,hsla(0,0%,100%,0) 47.8%,var(--c-border) 48%);
    z-index: 2;
    animation: wheel-glow calc(var(--dur) * 2) ease-in-out infinite;
  }

  .hamster {
    animation: hamster var(--dur) ease-in-out infinite;
    top: 50%;
    left: calc(50% - 3.5em);
    width: 7em;
    height: 3.75em;
    transform: rotate(4deg) translate(-0.8em,1.85em);
    transform-origin: 50% 0;
    z-index: 1;
  }

  .hamster__head {
    animation: hamsterHead var(--dur) ease-in-out infinite;
    background: var(--c-hamster-shadow);
    border-radius: 70% 30% 0 100% / 40% 25% 25% 60%;
    box-shadow: 0 -0.25em 0 var(--c-hamster-main) inset,
  		0.75em -1.55em 0 var(--c-hamster-main) inset;
    top: 0;
    left: -2em;
    width: 2.75em;
    height: 2.5em;
    transform-origin: 100% 50%;
  }

  .hamster__ear {
    animation: hamsterEar var(--dur) ease-in-out infinite;
    background: var(--c-hamster-ear);
    border-radius: 50%;
    box-shadow: -0.25em 0 var(--c-hamster-shadow) inset;
    top: -0.25em;
    right: -0.25em;
    width: 0.75em;
    height: 0.75em;
    transform-origin: 50% 75%;
  }

  .hamster__eye {
    animation: hamsterEye var(--dur) linear infinite;
    background-color: var(--c-hamster-eye);
    border-radius: 50%;
    top: 0.375em;
    left: 1.25em;
    width: 0.5em;
    height: 0.5em;
  }

  .hamster__nose {
    background: var(--c-hamster-nose);
    border-radius: 35% 65% 85% 15% / 70% 50% 50% 30%;
    top: 0.75em;
    left: 0;
    width: 0.2em;
    height: 0.25em;
  }

  .hamster__body {
    animation: hamsterBody var(--dur) ease-in-out infinite;
    background: var(--c-hamster-main);
    border-radius: 50% 30% 50% 30% / 15% 60% 40% 40%;
    box-shadow: 0.1em 0.75em 0 var(--c-hamster-shadow) inset,
  		0.15em -0.5em 0 var(--c-hamster-main) inset;
    top: 0.25em;
    left: 2em;
    width: 4.5em;
    height: 3em;
    transform-origin: 17% 50%;
    transform-style: preserve-3d;
  }

  .hamster__limb--fr,
  .hamster__limb--fl {
    clip-path: polygon(0 0,100% 0,70% 80%,60% 100%,0% 100%,40% 80%);
    top: 2em;
    left: 0.5em;
    width: 1em;
    height: 1.5em;
    transform-origin: 50% 0;
  }

  .hamster__limb--fr {
    animation: hamsterFRLimb var(--dur) linear infinite;
    background: linear-gradient(var(--c-hamster-shadow) 80%,var(--c-hamster-ear) 80%);
    transform: rotate(15deg) translateZ(-1px);
  }

  .hamster__limb--fl {
    animation: hamsterFLLimb var(--dur) linear infinite;
    background: linear-gradient(var(--c-hamster-main) 80%,var(--c-hamster-ear) 80%);
    transform: rotate(15deg);
  }

  .hamster__limb--br,
  .hamster__limb--bl {
    border-radius: 0.75em 0.75em 0 0;
    clip-path: polygon(0 0,100% 0,100% 30%,70% 90%,70% 100%,30% 100%,40% 90%,0% 30%);
    top: 1em;
    left: 2.8em;
    width: 1.5em;
    height: 2.5em;
    transform-origin: 50% 30%;
  }

  .hamster__limb--br {
    animation: hamsterBRLimb var(--dur) linear infinite;
    background: linear-gradient(var(--c-hamster-shadow) 90%,var(--c-hamster-ear) 90%);
    transform: rotate(-25deg) translateZ(-1px);
  }

  .hamster__limb--bl {
    animation: hamsterBLLimb var(--dur) linear infinite;
    background: linear-gradient(var(--c-hamster-main) 90%,var(--c-hamster-ear) 90%);
    transform: rotate(-25deg);
  }

  .hamster__tail {
    animation: hamsterTail var(--dur) linear infinite;
    background: var(--c-hamster-shadow);
    border-radius: 0.25em 50% 50% 0.25em;
    box-shadow: 0 -0.2em 0 var(--c-hamster-ear) inset;
    top: 1.5em;
    right: -0.5em;
    width: 1em;
    height: 0.5em;
    transform: rotate(30deg) translateZ(-1px);
    transform-origin: 0.25em 0.25em;
  }

  .spoke {
    animation: spoke var(--dur) linear infinite;
    background: radial-gradient(100% 100% at center,hsla(0,0%,100%,0) 4.8%,var(--gradient-accent) 5%),
  		linear-gradient(hsla(0,0%,100%,0) 46.9%,var(--c-border) 47% 52.9%,hsla(0,0%,100%,0) 53%) 50% 50% / 99% 99% no-repeat;
  }

  /* Animations */
  @keyframes wheel-glow {
    0%, 100% {
      box-shadow: 0 0 10px 2px var(--c-glow);
    }
    50% {
      box-shadow: 0 0 20px 5px var(--c-glow);
    }
  }

  @keyframes hamster {
    from, to {
      transform: rotate(4deg) translate(-0.8em,1.85em);
    }

    50% {
      transform: rotate(0) translate(-0.8em,1.85em);
    }
  }

  @keyframes hamsterHead {
    from, 25%, 50%, 75%, to {
      transform: rotate(0);
    }

    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(8deg);
    }
  }

  @keyframes hamsterEye {
    from, 90%, to {
      transform: scaleY(1);
    }

    95% {
      transform: scaleY(0);
    }
  }

  @keyframes hamsterEar {
    from, 25%, 50%, 75%, to {
      transform: rotate(0);
    }

    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(12deg);
    }
  }

  @keyframes hamsterBody {
    from, 25%, 50%, 75%, to {
      transform: rotate(0);
    }

    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(-2deg);
    }
  }

  @keyframes hamsterFRLimb {
    from, 25%, 50%, 75%, to {
      transform: rotate(50deg) translateZ(-1px);
    }

    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(-30deg) translateZ(-1px);
    }
  }

  @keyframes hamsterFLLimb {
    from, 25%, 50%, 75%, to {
      transform: rotate(-30deg);
    }

    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(50deg);
    }
  }

  @keyframes hamsterBRLimb {
    from, 25%, 50%, 75%, to {
      transform: rotate(-60deg) translateZ(-1px);
    }

    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(20deg) translateZ(-1px);
    }
  }

  @keyframes hamsterBLLimb {
    from, 25%, 50%, 75%, to {
      transform: rotate(20deg);
    }

    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(-60deg);
    }
  }

  @keyframes hamsterTail {
    from, 25%, 50%, 75%, to {
      transform: rotate(30deg) translateZ(-1px);
    }

    12.5%, 37.5%, 62.5%, 87.5% {
      transform: rotate(10deg) translateZ(-1px);
    }
  }

  @keyframes spoke {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(-1turn);
    }
  }
`;

export default Loader;
