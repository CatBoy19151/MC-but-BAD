(() => {
  const player = {
    x: 5 * window.TILE_SIZE,
    y: 0,
    width: window.TILE_SIZE * 0.9,
    height: window.TILE_SIZE * 1.8,
    velX: 0,
    velY: 0,
    speed: 2,
    jumping: false,
    grounded: false,
    health: 100,
    invulnerableTimer: 0,
    inventory: new Array(9).fill(null).map(() => ({ id: 0, count: 0 })),
  };

  const gravity = 0.6;
  const friction = 0.8;

  function updatePlayer(keys) {
    // Horizontal movement
    if (keys['a']) {
      if (player.velX > -player.speed) player.velX -= 1;
    }
    if (keys['d']) {
      if (player.velX < player.speed) player.velX += 1;
    }

    // Jumping
    if ((keys['w'] || keys[' '] || keys['arrowup']) && !player.jumping && player.grounded) {
      player.jumping = true;
      player.grounded = false;
      player.velY = -12;
    }

    // Apply physics
    player.velX *= friction;
    player.velY += gravity;

    player.x += player.velX;
    player.y += player.velY;

    // Collision detection
    player.grounded = false;
    for (let y = 0; y < window.WORLD_HEIGHT; y++) {
      for (let x = Math.floor(player.x / window.TILE_SIZE) - 1; x <= Math.floor((player.x + player.width) / window.TILE_SIZE) + 1; x++) {
        const block = window.getBlock(x, y);
        if (block === 0) continue;
        const bx = x * window.TILE_SIZE;
        const by = y * window.TILE_SIZE;

        if (
          player.x < bx + window.TILE_SIZE &&
          player.x + player.width > bx &&
          player.y < by + window.TILE_SIZE &&
          player.y + player.height > by
        ) {
          if (player.velY > 0) {
            player.y = by - player.height;
            player.velY = 0;
            player.grounded = true;
            player.jumping = false;
          } else if (player.velY < 0) {
            player.y = by + window.TILE_SIZE;
            player.velY = 0;
          }
        }
      }
    }

    if (player.y + player.height > window.WORLD_HEIGHT * window.TILE_SIZE) {
      player.y = window.WORLD_HEIGHT * window.TILE_SIZE - player.height;
      player.velY = 0;
      player.grounded = true;
      player.jumping = false;
    }

    if (player.invulnerableTimer > 0) player.invulnerableTimer--;
  }

  function addItemToInventory(id) {
    for (let slot of player.inventory) {
      if (slot.id === id && slot.count < 64) {
        slot.count++;
        return true;
      }
    }
    for (let slot of player.inventory) {
      if (slot.id === 0) {
        slot.id = id;
        slot.count = 1;
        return true;
      }
    }
    return false; // inventory full
  }

  function removeItemFromInventory(index) {
    if (player.inventory[index].count > 0) {
      player.inventory[index].count--;
      if (player.inventory[index].count <= 0) {
        player.inventory[index].id = 0;
      }
    }
  }

  window.player = player;
  window.updatePlayer = updatePlayer;
  window.addItemToInventory = addItemToInventory;
  window.removeItemFromInventory = removeItemFromInventory;
})();
