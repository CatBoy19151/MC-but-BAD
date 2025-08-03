(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  let keys = {};
  let mouseX = 0;
  let mouseY = 0;
  let selectedIndex = 0;

  // Simple textures as colors for blocks
  const textures = {
    1: '#7B5E2B', // dirt
    2: '#00AA00', // grass
    3: '#777777', // stone
    4: '#E4D96F', // sand
    5: '#2255EE', // water
    6: '#8B4513', // wood
    7: '#228822', // leaves
  };

  function pixelToBlock(x, y, cameraX) {
    return {
      x: Math.floor((x + cameraX) / window.TILE_SIZE),
      y: Math.floor(y / window.TILE_SIZE),
    };
  }

  function aabbCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  function updateHealthBar() {
    const healthBar = document.getElementById('healthBar');
    if (!healthBar) return;
    healthBar.style.width = Math.max(0, window.player.health) + '%';
    if (window.player.health > 60) healthBar.style.backgroundColor = '#0f0';
    else if (window.player.health > 30) healthBar.style.backgroundColor = '#ff0';
    else healthBar.style.backgroundColor = '#f00';
  }

  function updateInventoryUI() {
    const invContainer = document.getElementById('inventory');
    if (!invContainer) return;
    invContainer.innerHTML = '';
    window.player.inventory.forEach((slot, idx) => {
      const slotDiv = document.createElement('div');
      slotDiv.style.width = '32px';
      slotDiv.style.height = '32px';
      slotDiv.style.border = idx === selectedIndex ? '2px solid yellow' : '1px solid #ccc';
      slotDiv.style.display = 'inline-block';
      slotDiv.style.marginRight = '4px';
      slotDiv.style.backgroundColor = textures[slot.id] || '#00000033';
      slotDiv.style.position = 'relative';
      slotDiv.style.cursor = 'pointer';
      slotDiv.title = `Block: ${window.BLOCKS[slot.id]?.name || 'Empty'}`;

      if (slot.count > 0) {
        const countSpan = document.createElement('span');
        countSpan.textContent = slot.count;
        countSpan.style.position = 'absolute';
        countSpan.style.bottom = '2px';
        countSpan.style.right = '2px';
        countSpan.style.color = 'white';
        countSpan.style.fontSize = '12px';
        countSpan.style.textShadow = '1px 1px 2px black';
        slotDiv.appendChild(countSpan);
      }

      slotDiv.onclick = () => {
        selectedIndex = idx;
        updateInventoryUI();
      };

      invContainer.appendChild(slotDiv);
    });
  }

  // Camera follows player horizontally
  function getCameraX() {
    return window.player.x - canvas.width / 2 + window.player.width / 2;
  }

  function gameLoop() {
    const cameraX = getCameraX();
    const cameraY = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const playerChunk = Math.floor(window.player.x / window.TILE_SIZE / window.CHUNK_SIZE);
    for (let i = playerChunk - 3; i <= playerChunk + 3; i++) {
      if (!window.world.has(i * window.CHUNK_SIZE)) window.generateChunk(i);
    }

    const startX = Math.floor(cameraX / window.TILE_SIZE);
    const endX = startX + Math.ceil(canvas.width / window.TILE_SIZE) + 1;

    // Draw blocks
    for (let x = startX; x <= endX; x++) {
      for (let y = 0; y < window.WORLD_HEIGHT; y++) {
        const block = window.getBlock(x, y);
        if (block > 0) {
          ctx.fillStyle = textures[block];
          ctx.fillRect(x * window.TILE_SIZE - cameraX, y * window.TILE_SIZE - cameraY, window.TILE_SIZE, window.TILE_SIZE);
          ctx.strokeStyle = '#333';
          ctx.strokeRect(x * window.TILE_SIZE - cameraX, y * window.TILE_SIZE - cameraY, window.TILE_SIZE, window.TILE_SIZE);
        }
      }
    }

    // Player update
    window.updatePlayer(keys);

    // Enemy AI
    window.enemyAI();

    // Player collision with enemy
    if (aabbCollision(window.player, window.enemy)) {
      if (window.player.invulnerableTimer <= 0) {
        window.player.health -= 10;
        window.player.invulnerableTimer = 60;
      }
    }

    updateHealthBar();

    // Draw player
    ctx.fillStyle = '#ff0000';
    if (window.player.invulnerableTimer > 0) ctx.globalAlpha = 0.5;
    ctx.fillRect(window.player.x - cameraX, window.player.y - cameraY, window.player.width, window.player.height);
    ctx.globalAlpha = 1;

    // Draw enemy
    ctx.fillStyle = '#880000';
    ctx.fillRect(window.enemy.x - cameraX, window.enemy.y - cameraY, window.enemy.width, window.enemy.height);

    requestAnimationFrame(gameLoop);
  }

  window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
  });
  window.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false
