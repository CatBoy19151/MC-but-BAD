(() => {
  const enemy = {
    x: 300,
    y: 0,
    width: window.TILE_SIZE * 0.9,
    height: window.TILE_SIZE * 1.8,
    velX: 1.5,
    velY: 0,
    health: 30,
  };

  const gravity = 0.6;

  function enemyAI() {
    enemy.velY += gravity;
    enemy.x += enemy.velX;
    enemy.y += enemy.velY;

    // Ground check & collision
    const footBlockY = Math.floor((enemy.y + enemy.height) / window.TILE_SIZE);
    const frontBlockX = Math.floor(enemy.x / window.TILE_SIZE) + (enemy.velX > 0 ? 1 : 0);

    if (
      window.getBlock(frontBlockX, footBlockY) !== 0 ||
      window.getBlock(frontBlockX, footBlockY + 1) === 0
    ) {
      enemy.velX = -enemy.velX;
    }

    // Floor collision
    for (let y = 0; y < window.WORLD_HEIGHT; y++) {
      for (let x = Math.floor(enemy.x / window.TILE_SIZE) - 1; x <= Math.floor((enemy.x + enemy.width) / window.TILE_SIZE) + 1; x++) {
        const block = window.getBlock(x, y);
        if (block === 0) continue;
        const bx = x * window.TILE_SIZE;
        const by = y * window.TILE_SIZE;

        if (
          enemy.x < bx + window.TILE_SIZE &&
          enemy.x + enemy.width > bx &&
          enemy.y < by + window.TILE_SIZE &&
          enemy.y + enemy.height > by
        ) {
          if (enemy.velY > 0) {
            enemy.y = by - enemy.height;
            enemy.velY = 0;
          } else if (enemy.velY < 0) {
            enemy.y = by + window.TILE_SIZE;
            enemy.velY = 0;
          }
        }
      }
    }

    if (enemy.y + enemy.height > window.WORLD_HEIGHT * window.TILE_SIZE) {
      enemy.y = window.WORLD_HEIGHT * window.TILE_SIZE - enemy.height;
      enemy.velY = 0;
    }
  }

  window.enemy = enemy;
  window.enemyAI = enemyAI;
})();
