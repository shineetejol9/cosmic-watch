
    // ==================== Falling Asteroids Animation ====================
    function createFallingAsteroid() {
      const container = document.getElementById('asteroid-container');
      const asteroid = document.createElement('div');
      asteroid.className = 'falling-asteroid';
      
      const asteroids = ['🪨', '💫', '⭐', '✨'];
      const sizes = ['text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'];
      const leftPos = Math.random() * 100;
      const duration = 8 + Math.random() * 12;
      
      asteroid.textContent = asteroids[Math.floor(Math.random() * asteroids.length)];
      asteroid.style.left = leftPos + '%';
      asteroid.style.animationDuration = duration + 's';
      asteroid.style.opacity = 0.3 + Math.random() * 0.5;
      
      container.appendChild(asteroid);
      
      setTimeout(() => asteroid.remove(), duration * 1000);
    }
    
    // Create falling asteroids continuously
    setInterval(createFallingAsteroid, 500);
    
    // ==================== Starfield Background ====================
    function createStarfield() {
      const starfield = document.getElementById('starfield');
      const stars = [];
      for (let i = 0; i < 150; i++) {
        stars.push(`
          <div style="
            position: absolute;
            width: ${1 + Math.random() * 3}px;
            height: ${1 + Math.random() * 3}px;
            background: white;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${0.1 + Math.random() * 0.7};
            animation: pulse ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 4}s;
          "></div>
        `);
      }
      starfield.innerHTML = stars.join('');
    }
    
    createStarfield();
    
    // ==================== Configuration ====================
    const defaultConfig = {
      main_title: 'COSMIC WATCH',
      subtitle: 'Near-Earth Object Monitoring System',
      alert_section_title: 'YOUR WATCHLIST',
      background_color: '#020617',
      surface_color: '#0f172a',
      text_color: '#e2e8f0',
      primary_action: '#06b6d4',
      secondary_action: '#3b82f6'
    };
    
    let config = { ...defaultConfig };
    
    // ==================== State ====================
    let currentUser = null;
    let neoData = [];
    let watchlist = [];
    let allUserData = [];
    let currentFilter = 'all';
    let isAuthMode = 'login';
    
    const NASA_API_KEY = 'DEMO_KEY';
    const NASA_API_URL = 'https://api.nasa.gov/neo/rest/v1/feed';
    
    // 3D Scene variables
    let scene, camera, renderer, earth, asteroidOrbit, asteroidPoint;
    let currentAsteroid = null;
    let autoRotate = true;
    
    // ==================== Toast Notifications ====================
    function showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      const colors = {
        success: 'bg-green-500/90 border-green-400',
        error: 'bg-red-500/90 border-red-400',
        warning: 'bg-yellow-500/90 border-yellow-400',
        info: 'bg-cyan-500/90 border-cyan-400'
      };
      
      toast.className = `${colors[type]} border backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transform translate-x-full transition-transform duration-300`;
      toast.textContent = message;
      container.appendChild(toast);
      
      requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full');
      });
      
      setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
    
    // ==================== 3D Scene Setup ====================
    function init3DScene(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      
      const container = canvas.parentElement;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // Dispose old renderer if exists
      if (renderer) {
        renderer.dispose();
      }
      
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);
      scene.fog = new THREE.Fog(0x0f172a, 500, 2000);
      
      camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);
      camera.position.set(50, 30, 80);
      camera.lookAt(0, 0, 0);
      
      renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: true 
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      
      // Starfield
      const starGeometry = new THREE.BufferGeometry();
      const starVertices = [];
      for (let i = 0; i < 1500; i++) {
        starVertices.push(
          (Math.random() - 0.5) * 1000,
          (Math.random() - 0.5) * 1000,
          (Math.random() - 0.5) * 1000
        );
      }
      starGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starVertices), 3));
      const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: true });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
      
      // Earth
      const earthGeometry = new THREE.SphereGeometry(25, 128, 128);
      const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0x2563eb,
        emissive: 0x1e3a8a,
        shininess: 25,
        wireframe: false
      });
      earth = new THREE.Mesh(earthGeometry, earthMaterial);
      earth.castShadow = true;
      earth.receiveShadow = true;
      scene.add(earth);
      
      // Enhanced Orbit Rings
      const createRing = (radius, color) => {
        const ringGeometry = new THREE.BufferGeometry();
        const ringVertices = [];
        for (let i = 0; i <= 256; i++) {
          const angle = (i / 256) * Math.PI * 2;
          ringVertices.push(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
          );
        }
        ringGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ringVertices), 3));
        const ringMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });
        return new THREE.Line(ringGeometry, ringMaterial);
      };
      
      const ring1 = createRing(120, 0x06b6d4);
      scene.add(ring1);
      
      const ring2 = createRing(160, 0x0ea5e9);
      ring2.rotation.x = Math.PI / 6;
      scene.add(ring2);
      
      const ring3 = createRing(90, 0xfbbf24);
      ring3.rotation.z = Math.PI / 4;
      scene.add(ring3);
      
      // Asteroid point
      const asteroidGeometry = new THREE.SphereGeometry(3, 32, 32);
      const asteroidMaterial = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        metalness: 0.8,
        roughness: 0.2
      });
      asteroidPoint = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
      asteroidPoint.castShadow = true;
      asteroidPoint.receiveShadow = true;
      scene.add(asteroidPoint);
      
      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);
      
      const sunLight = new THREE.DirectionalLight(0xffffff, 1);
      sunLight.position.set(100, 80, 100);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      scene.add(sunLight);
      
      // Point light for glow
      const glowLight = new THREE.PointLight(0x06b6d4, 2, 300);
      glowLight.position.set(0, 0, 0);
      scene.add(glowLight);
      
      // Animation loop
      function animate() {
        requestAnimationFrame(animate);
        
        earth.rotation.y += 0.0005;
        if (asteroidPoint) {
          asteroidPoint.rotation.x += 0.02;
          asteroidPoint.rotation.y += 0.025;
        }
        
        renderer.render(scene, camera);
      }
      
      animate();
      
      // Handle resize
      window.addEventListener('resize', () => {
        const newWidth = canvas.parentElement.clientWidth;
        const newHeight = canvas.parentElement.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      });
    }
    
    function update3DScene(neo) {
      if (!scene || !asteroidPoint) return;
      
      const distance = parseFloat(neo.close_approach_data[0]?.miss_distance?.kilometers || 1000000000);
      const normalizedDistance = Math.min(120, 40 + (distance / 5000000) * 0.1);
      
      // Animated orbit
      const time = Date.now() * 0.0001;
      asteroidPoint.position.x = Math.cos(time) * normalizedDistance;
      asteroidPoint.position.z = Math.sin(time * 0.7) * normalizedDistance;
      asteroidPoint.position.y = Math.sin(time * 0.5) * (normalizedDistance * 0.4);
      
      // Draw orbit path
      const points = [];
      for (let i = 0; i <= 256; i++) {
        const angle = (i / 256) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            Math.cos(angle) * normalizedDistance,
            Math.sin(angle * 0.7) * (normalizedDistance * 0.4),
            Math.sin(angle * 0.7) * normalizedDistance
          )
        );
      }
      
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0xfbbf24,
        linewidth: 2,
        fog: false
      });
      
      if (asteroidOrbit) scene.remove(asteroidOrbit);
      asteroidOrbit = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(asteroidOrbit);
    }
    
    // ==================== NASA API Integration ====================
    async function fetchNEOData() {
      const today = new Date().toISOString().split('T')[0];
      const url = `${NASA_API_URL}?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        neoData = Object.values(data.near_earth_objects).flat();
        
        updateStats();
        renderNEOList();
        updateRiskAnalysis();
        checkAlerts();
        
        document.getElementById('last-updated').textContent = `Last sync: ${new Date().toLocaleTimeString()}`;
        
      } catch (error) {
        console.error('Failed to fetch NEO data:', error);
        showToast('Using sample asteroid data', 'info');
        
        neoData = generateSampleData();
        updateStats();
        renderNEOList();
        updateRiskAnalysis();
      }
    }
    
    function generateSampleData() {
      const names = ['Apophis', 'Bennu', '1999 RQ36', '2024 AA', 'Eros', '2023 DZ2', 'Didymos', 'Ryugu', '2024 BX1', 'Toutatis'];
      return names.map((name, i) => ({
        id: `sample-${i}`,
        name: name,
        nasa_jpl_url: '#',
        is_potentially_hazardous_asteroid: Math.random() > 0.7,
        estimated_diameter: {
          meters: {
            estimated_diameter_min: 50 + Math.random() * 500,
            estimated_diameter_max: 100 + Math.random() * 800
          }
        },
        close_approach_data: [{
          close_approach_date_full: new Date().toISOString(),
          relative_velocity: {
            kilometers_per_hour: (10000 + Math.random() * 90000).toFixed(0)
          },
          miss_distance: {
            kilometers: (100000 + Math.random() * 50000000).toFixed(0),
            lunar: (0.5 + Math.random() * 50).toFixed(2)
          }
        }]
      }));
    }
    
    // ==================== Risk Analysis Engine ====================
    function calculateRiskScore(neo) {
      let score = 0;
      
      if (neo.is_potentially_hazardous_asteroid) score += 40;
      
      const distance = parseFloat(neo.close_approach_data[0]?.miss_distance?.kilometers || 1000000000);
      const distanceScore = Math.max(0, 30 - (distance / 2000000));
      score += distanceScore;
      
      const diameter = neo.estimated_diameter?.meters?.estimated_diameter_max || 0;
      const sizeScore = Math.min(20, diameter / 50);
      score += sizeScore;
      
      const velocity = parseFloat(neo.close_approach_data[0]?.relative_velocity?.kilometers_per_hour || 0);
      const velocityScore = Math.min(10, velocity / 10000);
      score += velocityScore;
      
      return Math.min(100, Math.round(score));
    }
    
    function updateRiskAnalysis() {
      const hazardous = neoData.filter(n => n.is_potentially_hazardous_asteroid);
      const maxRisk = hazardous.length > 0 
        ? Math.max(...hazardous.map(n => calculateRiskScore(n)))
        : Math.max(...neoData.map(n => calculateRiskScore(n)), 0);
      
      const circle = document.getElementById('risk-circle');
      const scoreEl = document.getElementById('risk-score');
      const labelEl = document.getElementById('risk-label');
      
      const circumference = 251.2;
      const offset = circumference - (maxRisk / 100) * circumference;
      circle.style.strokeDashoffset = offset;
      
      scoreEl.textContent = maxRisk;
      
      if (maxRisk < 30) {
        circle.style.stroke = '#22c55e';
        scoreEl.className = 'font-display text-3xl text-green-400 glow-text';
        labelEl.textContent = 'LOW THREAT';
        labelEl.className = 'font-display text-sm text-green-400 mb-4 glow-text';
      } else if (maxRisk < 60) {
        circle.style.stroke = '#eab308';
        scoreEl.className = 'font-display text-3xl text-yellow-400 glow-text';
        labelEl.textContent = 'MODERATE THREAT';
        labelEl.className = 'font-display text-sm text-yellow-400 mb-4 glow-text';
      } else {
        circle.style.stroke = '#ef4444';
        scoreEl.className = 'font-display text-3xl text-red-400 glow-text';
        labelEl.textContent = 'ELEVATED THREAT';
        labelEl.className = 'font-display text-sm text-red-400 mb-4 glow-text';
      }
    }
    
    // ==================== UI Rendering ====================
    function updateStats() {
      document.getElementById('stat-total').textContent = neoData.length;
      document.getElementById('stat-hazardous').textContent = neoData.filter(n => n.is_potentially_hazardous_asteroid).length;
      document.getElementById('stat-watching').textContent = watchlist.length;
      
      if (neoData.length > 0) {
        const closest = neoData.reduce((min, neo) => {
          const dist = parseFloat(neo.close_approach_data[0]?.miss_distance?.lunar || Infinity);
          return dist < min.dist ? { dist, name: neo.name } : min;
        }, { dist: Infinity, name: '--' });
        
        document.getElementById('stat-closest').textContent = `${closest.dist.toFixed(1)} LD`;
      }
    }
    
    function renderNEOList() {
      const container = document.getElementById('neo-list');
      let filtered = currentFilter === 'hazardous' 
        ? neoData.filter(n => n.is_potentially_hazardous_asteroid)
        : neoData;
      
      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="text-center py-12">
            <svg class="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <p class="text-slate-400">No ${currentFilter === 'hazardous' ? 'hazardous ' : ''}asteroids detected</p>
          </div>
        `;
        return;
      }
      
      container.innerHTML = filtered.map((neo, idx) => {
        const approach = neo.close_approach_data[0];
        const distance = parseFloat(approach?.miss_distance?.kilometers || 0);
        const velocity = parseFloat(approach?.relative_velocity?.kilometers_per_hour || 0);
        const diameter = neo.estimated_diameter?.meters?.estimated_diameter_max || 0;
        const riskScore = calculateRiskScore(neo);
        const isWatched = watchlist.some(w => w.asteroid_id === neo.id);
        
        const riskColor = riskScore < 30 ? 'green' : riskScore < 60 ? 'yellow' : 'red';
        
        return `
          <div class="neo-card glass-panel rounded-xl p-4 transition-all duration-300 cursor-pointer border border-transparent hover:border-cyan-500/50 ${neo.is_potentially_hazardous_asteroid ? 'hazardous-pulse' : ''}" style="--card-index: ${idx};" data-neo-id="${neo.id}">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-12 h-12 rounded-lg ${neo.is_potentially_hazardous_asteroid ? 'bg-red-500/20' : 'bg-cyan-500/20'} flex items-center justify-center flex-shrink-0 float-animation">
                  <svg class="w-6 h-6 ${neo.is_potentially_hazardous_asteroid ? 'text-red-400' : 'text-cyan-400'}" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="8" opacity="0.3"/>
                    <circle cx="12" cy="12" r="5"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <h3 class="font-display font-semibold text-white truncate">${neo.name}</h3>
                  <div class="flex items-center gap-2 mt-1 flex-wrap">
                    ${neo.is_potentially_hazardous_asteroid ? '<span class="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">HAZARDOUS</span>' : ''}
                    <span class="px-2 py-0.5 rounded-full text-xs bg-${riskColor}-500/20 text-${riskColor}-400 border border-${riskColor}-500/30">Risk: ${riskScore}</span>
                  </div>
                </div>
              </div>
              <button class="watch-btn p-2 rounded-lg ${isWatched ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-400 hover:text-yellow-400'} transition-all duration-300 transform hover:scale-110 active:scale-95 flex-shrink-0" data-neo-id="${neo.id}" data-neo-name="${neo.name}" ${!currentUser ? 'disabled title="Sign in to watch"' : ''}>
                <svg class="w-5 h-5" fill="${isWatched ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700/50">
              <div>
                <p class="text-xs text-slate-500 uppercase">Distance</p>
                <p class="font-display text-sm text-slate-300">${(distance / 1000000).toFixed(2)} M km</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 uppercase">Velocity</p>
                <p class="font-display text-sm text-slate-300">${(velocity / 1000).toFixed(1)} km/s</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 uppercase">Diameter</p>
                <p class="font-display text-sm text-slate-300">${diameter.toFixed(0)} m</p>
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      container.querySelectorAll('.watch-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!currentUser) {
            showToast('Please sign in to watch asteroids', 'warning');
            return;
          }
          toggleWatch(btn.dataset.neoId, btn.dataset.neoName);
        });
      });
      
      container.querySelectorAll('.neo-card').forEach(card => {
        card.addEventListener('click', () => {
          const neoId = card.dataset.neoId;
          const neo = neoData.find(n => n.id === neoId);
          if (neo) {
            init3DScene('orbit-canvas-3d');
            update3DScene(neo);
          }
        });
      });
    }
    
    function renderWatchlist() {
      const container = document.getElementById('watchlist-items');
      const emptyState = document.getElementById('watchlist-empty');
      
      if (watchlist.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
      }
      
      emptyState.classList.add('hidden');
      container.classList.remove('hidden');
      
      container.innerHTML = watchlist.map(item => `
        <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg group hover:cursor-pointer transition-all duration-300 hover:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center float-animation">
              <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="6"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-sm text-white">${item.asteroid_name}</p>
              <p class="text-xs text-slate-500">Alert: ${(item.alert_distance_km / 1000000).toFixed(1)}M km</p>
            </div>
          </div>
          <button class="remove-watch-btn p-1 rounded text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 transform hover:scale-110 active:scale-95" data-id="${item.__backendId}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      `).join('');
      
      container.querySelectorAll('.remove-watch-btn').forEach(btn => {
        btn.addEventListener('click', () => removeFromWatchlist(btn.dataset.id));
      });
    }
    
    // ==================== Alert System ====================
    function checkAlerts() {
      if (!currentUser || watchlist.length === 0) return;
      
      const alerts = [];
      
      watchlist.forEach(watched => {
        const neo = neoData.find(n => n.id === watched.asteroid_id);
        if (neo) {
          const distance = parseFloat(neo.close_approach_data[0]?.miss_distance?.kilometers || Infinity);
          if (distance < watched.alert_distance_km) {
            alerts.push({
              neo,
              watched,
              distance
            });
          }
        }
      });
      
      const alertsPanel = document.getElementById('alerts-panel');
      const alertList = document.getElementById('alert-list');
      
      if (alerts.length > 0) {
        alertsPanel.classList.remove('hidden');
        alertList.innerHTML = alerts.map(alert => `
          <div class="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-pulse">
            <div class="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-sm text-red-400">${alert.neo.name}</p>
              <p class="text-xs text-slate-400">${(alert.distance / 1000000).toFixed(2)}M km - Below threshold!</p>
            </div>
          </div>
        `).join('');
        
        showToast(`⚠️ ${alerts.length} asteroid(s) within alert range!`, 'warning');
      } else {
        alertsPanel.classList.add('hidden');
      }
    }
    
    // ==================== Watch Management ====================
    async function toggleWatch(neoId, neoName) {
      const existing = watchlist.find(w => w.asteroid_id === neoId);
      
      if (existing) {
        await removeFromWatchlist(existing.__backendId);
      } else {
        await addToWatchlist(neoId, neoName);
      }
    }
    
    async function addToWatchlist(neoId, neoName) {
      if (allUserData.length >= 999) {
        showToast('Maximum watch limit reached (999 items)', 'error');
        return;
      }
      
      const result = await window.dataSdk.create({
        type: 'watch',
        user_email: currentUser.email,
        user_name: currentUser.name,
        asteroid_id: neoId,
        asteroid_name: neoName,
        alert_distance_km: 10000000,
        created_at: new Date().toISOString(),
        is_active: true
      });
      
      if (result.isOk) {
        showToast(`Now watching ${neoName}`, 'success');
      } else {
        showToast('Failed to add to watchlist', 'error');
      }
    }
    
    async function removeFromWatchlist(backendId) {
      const item = allUserData.find(d => d.__backendId === backendId);
      if (!item) return;
      
      const result = await window.dataSdk.delete(item);
      
      if (result.isOk) {
        showToast('Removed from watchlist', 'info');
      } else {
        showToast('Failed to remove from watchlist', 'error');
      }
    }
    
    // ==================== Authentication ====================
    function showAuthModal() {
      document.getElementById('auth-modal').classList.remove('hidden');
    }
    
    function hideAuthModal() {
      document.getElementById('auth-modal').classList.add('hidden');
    }
    
    function toggleAuthMode() {
      isAuthMode = isAuthMode === 'login' ? 'register' : 'login';
      const nameField = document.getElementById('name-field');
      const authTitle = document.getElementById('auth-title');
      const authBtnText = document.getElementById('auth-btn-text');
      const authToggleText = document.getElementById('auth-toggle-text');
      const authToggle = document.getElementById('auth-toggle');
      
      if (isAuthMode === 'register') {
        nameField.classList.remove('hidden');
        authTitle.textContent = 'Create Your Account';
        authBtnText.textContent = 'REGISTER';
        authToggleText.textContent = 'Already have an account?';
        authToggle.textContent = 'Sign In';
      } else {
        nameField.classList.add('hidden');
        authTitle.textContent = 'Welcome to Cosmic Watch';
        authBtnText.textContent = 'INITIATE ACCESS';
        authToggleText.textContent = 'New researcher?';
        authToggle.textContent = 'Create Account';
      }
    }
    
    async function handleAuth(e) {
      e.preventDefault();
      
      const email = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-password').value;
      const name = document.getElementById('auth-name').value.trim() || email.split('@')[0];
      
      if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
      }
      
      const existingUser = allUserData.find(d => d.type === 'user' && d.user_email === email);
      
      if (isAuthMode === 'register') {
        if (existingUser) {
          showToast('Account already exists. Please sign in.', 'warning');
          toggleAuthMode();
          return;
        }
        
        const result = await window.dataSdk.create({
          type: 'user',
          user_email: email,
          user_name: name,
          asteroid_id: '',
          asteroid_name: '',
          alert_distance_km: 0,
          created_at: new Date().toISOString(),
          is_active: true
        });
        
        if (result.isOk) {
          currentUser = { email, name };
          showToast(`Welcome aboard, ${name}!`, 'success');
          updateUserUI();
          hideAuthModal();
        } else {
          showToast('Registration failed. Please try again.', 'error');
        }
      } else {
        if (!existingUser) {
          showToast('Account not found. Please register.', 'warning');
          toggleAuthMode();
          return;
        }
        
        currentUser = { email: existingUser.user_email, name: existingUser.user_name };
        showToast(`Welcome back, ${currentUser.name}!`, 'success');
        updateUserUI();
        hideAuthModal();
      }
    }
    
    function logout() {
      currentUser = null;
      watchlist = [];
      updateUserUI();
      renderWatchlist();
      renderNEOList();
      document.getElementById('alerts-panel').classList.add('hidden');
      showToast('Signed out successfully', 'info');
    }
    
    function updateUserUI() {
      const loginBtn = document.getElementById('login-btn');
      const userInfo = document.getElementById('user-info');
      const userAvatar = document.getElementById('user-avatar');
      const userNameDisplay = document.getElementById('user-name-display');
      const watchlistEmpty = document.getElementById('watchlist-empty');
      
      if (currentUser) {
        loginBtn.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userInfo.classList.add('flex');
        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        userNameDisplay.textContent = currentUser.name;
        watchlistEmpty.querySelector('p:last-child').textContent = 'Click 👁️ to track asteroids';
        
        watchlist = allUserData.filter(d => d.type === 'watch' && d.user_email === currentUser.email);
        document.getElementById('stat-watching').textContent = watchlist.length;
        renderWatchlist();
        renderNEOList();
        checkAlerts();
      } else {
        loginBtn.classList.remove('hidden');
        userInfo.classList.add('hidden');
        userInfo.classList.remove('flex');
        watchlistEmpty.querySelector('p:last-child').textContent = 'Sign in to track objects';
      }
    }
    
    // ==================== Data Handler ====================
    const dataHandler = {
      onDataChanged(data) {
        allUserData = data;
        
        if (currentUser) {
          watchlist = data.filter(d => d.type === 'watch' && d.user_email === currentUser.email);
          document.getElementById('stat-watching').textContent = watchlist.length;
          renderWatchlist();
          renderNEOList();
          checkAlerts();
        }
      }
    };
    
    // ==================== Element SDK ====================
    function onConfigChange(cfg) {
      config = { ...defaultConfig, ...cfg };
      
      document.getElementById('main-title').textContent = config.main_title || defaultConfig.main_title;
      document.getElementById('subtitle').textContent = config.subtitle || defaultConfig.subtitle;
      document.getElementById('alert-section-title').textContent = config.alert_section_title || defaultConfig.alert_section_title;
    }
    
    // ==================== Initialization ====================
    async function init() {
      if (window.elementSdk) {
        window.elementSdk.init({
          defaultConfig,
          onConfigChange,
          mapToCapabilities: (cfg) => ({
            recolorables: [
              {
                get: () => cfg.background_color || defaultConfig.background_color,
                set: (v) => window.elementSdk.setConfig({ background_color: v })
              },
              {
                get: () => cfg.surface_color || defaultConfig.surface_color,
                set: (v) => window.elementSdk.setConfig({ surface_color: v })
              },
              {
                get: () => cfg.text_color || defaultConfig.text_color,
                set: (v) => window.elementSdk.setConfig({ text_color: v })
              },
              {
                get: () => cfg.primary_action || defaultConfig.primary_action,
                set: (v) => window.elementSdk.setConfig({ primary_action: v })
              },
              {
                get: () => cfg.secondary_action || defaultConfig.secondary_action,
                set: (v) => window.elementSdk.setConfig({ secondary_action: v })
              }
            ],
            borderables: [],
            fontEditable: undefined,
            fontSizeable: undefined
          }),
          mapToEditPanelValues: (cfg) => new Map([
            ['main_title', cfg.main_title || defaultConfig.main_title],
            ['subtitle', cfg.subtitle || defaultConfig.subtitle],
            ['alert_section_title', cfg.alert_section_title || defaultConfig.alert_section_title]
          ])
        });
      }
      
      if (window.dataSdk) {
        const result = await window.dataSdk.init(dataHandler);
        if (!result.isOk) {
          console.error('Failed to initialize data SDK');
        }
      }
      
      document.getElementById('login-btn').addEventListener('click', showAuthModal);
      document.getElementById('logout-btn').addEventListener('click', logout);
      document.getElementById('auth-toggle').addEventListener('click', toggleAuthMode);
      document.getElementById('auth-form').addEventListener('submit', handleAuth);
      document.getElementById('auth-modal').addEventListener('click', (e) => {
        if (e.target.id === 'auth-modal') hideAuthModal();
      });
      
      document.getElementById('filter-all').addEventListener('click', () => {
        currentFilter = 'all';
        document.getElementById('filter-all').className = 'px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all duration-300 hover:scale-105 active:scale-95';
        document.getElementById('filter-hazardous').className = 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 hover:border-red-500/50 hover:text-red-400 transition-all duration-300 hover:scale-105 active:scale-95';
        renderNEOList();
      });
      
      document.getElementById('filter-hazardous').addEventListener('click', () => {
        currentFilter = 'hazardous';
        document.getElementById('filter-hazardous').className = 'px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 transition-all duration-300 hover:scale-105 active:scale-95';
        document.getElementById('filter-all').className = 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-all duration-300 hover:scale-105 active:scale-95';
        renderNEOList();
      });
      
      document.getElementById('refresh-btn').addEventListener('click', () => {
        const icon = document.getElementById('refresh-icon');
        icon.classList.add('animate-spin');
        fetchNEOData().finally(() => {
          setTimeout(() => icon.classList.remove('animate-spin'), 1000);
        });
      });
      
      await fetchNEOData();
      setInterval(fetchNEOData, 5 * 60 * 1000);
    }
    
    init();