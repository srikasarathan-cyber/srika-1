/**
 * three-scene.js - Cinematic 3D Background Engine for Srika Sarathan Portfolio
 * Creates an interactive cosmic environment with floating crystalline geometries,
 * cyber particle constellation, ambient lighting, and mouse-reactive parallax.
 */

(function () {
  'use strict';

  const container = document.getElementById('canvas-container');
  if (!container) return;

  // Check if THREE is available, otherwise initialize elegant fallback
  if (typeof THREE === 'undefined') {
    initCanvasFallback(container);
    return;
  }

  let scene, camera, renderer;
  let particles, particleGeo, particleMat;
  let crystalMesh, wireframeMesh, ringMesh, torusKnotMesh;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;
  let clock = new THREE.Clock();

  init();
  animate();

  function init() {
    // 1. Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070913, 0.0018);

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    camera.position.z = 800;

    // 3. Renderer setup
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed, falling back to 2D canvas', e);
      initCanvasFallback(container);
      return;
    }

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x1a1d36, 1.8);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(0x00f5d4, 3, 1200);
    cyanPoint.position.set(300, 200, 300);
    scene.add(cyanPoint);

    const purplePoint = new THREE.PointLight(0x9d4edd, 3, 1200);
    purplePoint.position.set(-300, -200, 200);
    scene.add(purplePoint);

    const blueDir = new THREE.DirectionalLight(0x4361ee, 1.2);
    blueDir.position.set(0, 500, 500);
    scene.add(blueDir);

    // 5. Particle Constellation
    const particleCount = window.innerWidth < 768 ? 600 : 1200;
    particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f5d4); // neon cyan
    const color2 = new THREE.Color(0x7b2cbf); // electric purple
    const color3 = new THREE.Color(0x3a86ff); // cyber blue

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2200;
      positions[i + 1] = (Math.random() - 0.5) * 1800;
      positions[i + 2] = (Math.random() - 0.5) * 1600;

      const mixed = Math.random();
      const c = mixed < 0.4 ? color1 : (mixed < 0.7 ? color2 : color3);
      colors[i] = c.r;
      colors[i + 1] = c.g;
      colors[i + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom circular soft glow texture for particles
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(0,245,212,0.8)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const pTexture = new THREE.CanvasTexture(canvas);

    particleMat = new THREE.PointsMaterial({
      size: 14,
      map: pTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Central Floating 3D Cyber Crystal (Icosahedron)
    const crystalGeo = new THREE.IcosahedronGeometry(110, 0);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c122c,
      emissive: 0x00f5d4,
      emissiveIntensity: 0.25,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.82,
      wireframe: false
    });

    crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.position.set(320, 40, -100);
    scene.add(crystalMesh);

    // Glowing wireframe wrapper for crystal
    const wireGeo = new THREE.IcosahedronGeometry(116, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    wireframeMesh = new THREE.Mesh(wireGeo, wireMat);
    crystalMesh.add(wireframeMesh);

    // 7. Floating Orbit Ring
    const ringGeo = new THREE.TorusGeometry(180, 2.5, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      transparent: true,
      opacity: 0.5,
      wireframe: true
    });
    ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    crystalMesh.add(ringMesh);

    // 8. Secondary Ambient Polyhedron (Left-side Torus Knot)
    const torusKnotGeo = new THREE.TorusKnotGeometry(75, 18, 100, 16);
    const torusKnotMat = new THREE.MeshStandardMaterial({
      color: 0x240046,
      emissive: 0x7b2cbf,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.9,
      wireframe: true
    });
    torusKnotMesh = new THREE.Mesh(torusKnotGeo, torusKnotMat);
    torusKnotMesh.position.set(-420, -140, -250);
    scene.add(torusKnotMesh);

    // 9. Cyber Grid Floor with Perspective
    const gridHelper = new THREE.GridHelper(2400, 40, 0x00f5d4, 0x1f274a);
    gridHelper.position.y = -450;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.25;
    scene.add(gridHelper);

    // Listeners
    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
  }

  function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.45;
    mouseY = (event.clientY - windowHalfY) * 0.45;
  }

  function onTouchMove(event) {
    if (event.touches.length > 0) {
      mouseX = (event.touches[0].clientX - windowHalfX) * 0.4;
      mouseY = (event.touches[0].clientY - windowHalfY) * 0.4;
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Damped camera parallax
    targetX = mouseX * 0.35;
    targetY = mouseY * 0.35;

    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (-targetY - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    // Particles slow cosmic drift
    if (particles) {
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;
    }

    // Crystal rotation and subtle floating breath
    if (crystalMesh) {
      crystalMesh.rotation.x = elapsedTime * 0.3;
      crystalMesh.rotation.y = elapsedTime * 0.45;
      crystalMesh.position.y = 40 + Math.sin(elapsedTime * 1.2) * 16;
    }

    if (ringMesh) {
      ringMesh.rotation.z = -elapsedTime * 0.5;
    }

    // Torus knot rotation
    if (torusKnotMesh) {
      torusKnotMesh.rotation.x = elapsedTime * 0.2;
      torusKnotMesh.rotation.y = elapsedTime * 0.35;
      torusKnotMesh.position.y = -140 + Math.cos(elapsedTime * 0.9) * 20;
    }

    renderer.render(scene, camera);
  }

  // Fallback 2D Canvas Animation in case WebGL or Three.js script is blocked
  function initCanvasFallback(parent) {
    const canvas = document.createElement('canvas');
    canvas.className = 'fallback-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    parent.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    const nodes = [];
    const nodeCount = 70;
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        color: i % 2 === 0 ? 'rgba(0, 245, 212,' : 'rgba(157, 78, 221,'
      });
    }

    function renderFallback() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color + '0.7)';
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(0, 245, 212, ${0.2 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(renderFallback);
    }
    renderFallback();
  }
})();
