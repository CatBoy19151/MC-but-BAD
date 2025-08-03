(() => {
  const TILE_SIZE = 32;
  const WORLD_HEIGHT = 18;
  const CHUNK_SIZE = 30;

  const BLOCKS = [
    { id: 0, name: "Air" },
    { id: 1, name: "Dirt" },
    { id: 2, name: "Grass" },
    { id: 3, name: "Stone" },
    { id: 4, name: "Sand" },
    { id: 5, name: "Water" },
    { id: 6, name: "Wood" },
    { id: 7, name: "Leaves" },
  ];

  const world = new Map();

  function terrainHeight(x) {
    const base = 9;
    const amplitude = 4;
    const frequency = 0.05;
    const noise = Math.sin(x * frequency) * amplitude + Math.sin(x * frequency * 3) * 1.5;
    return Math.floor(base + noise);
  }

  function setBlock(x, y, blockId) {
    if (!world.has(x)) generateChunk(Math.floor(x / CHUNK_SIZE));
    const column = world.get(x);
    if (column && y >= 0 && y < WORLD_HEIGHT) {
      column[y] = blockId;
    }
  }

  function getBlock(x, y) {
    if (!world.has(x)) generateChunk(Math.floor(x / CHUNK_SIZE));
    const column = world.get(x);
    if (column && y >= 0 && y < WORLD_HEIGHT) {
      return column[y];
    }
    return 0;
  }

  function carveCaves(chunkX) {
    for (let x = chunkX * CHUNK_SIZE; x < (chunkX + 1) * CHUNK_SIZE; x++) {
      if (!world.has(x)) continue;
      let col = world.get(x);
      for (let y = 10; y < WORLD_HEIGHT - 1; y++) {
        if (Math.random() < 0.07) {
          col[y] = 0;
          if (Math.random() < 0.5 && world.has(x + 1)) world.get(x + 1)[y] = 0;
          if (Math.random() < 0.5 && world.has(x - 1)) world.get(x - 1)[y] = 0;
        }
      }
    }
  }

  function generateTrees(chunkX) {
    for (let x = chunkX * CHUNK_SIZE; x < (chunkX + 1) * CHUNK_SIZE; x++) {
      if (!world.has(x)) continue;
      let col = world.get(x);
      let groundY = -1;
      for (let y = 0; y < WORLD_HEIGHT; y++) {
        if (col[y] === 2) {
          groundY = y;
          break;
        }
      }
      if (groundY === -1) continue;

      if (Math.random() < 0.12) {
        const height = 3 + Math.floor(Math.random() * 3);
        for (let h = 1; h <= height; h++) {
          if (groundY - h < 0) break;
          setBlock(x, groundY - h, 6);
        }
        for (let lx = -1; lx <= 1; lx++) {
          for (let ly = -3; ly <= -1; ly++) {
            let leafX = x + lx;
            let leafY = groundY + ly;
            if (leafY >= 0 && leafY < WORLD_HEIGHT && leafX >= 0) {
              if (getBlock(leafX, leafY) === 0) setBlock(leafX, leafY, 7);
            }
          }
        }
      }
    }
  }

  function generateVillage(chunkX) {
    if (Math.random() > 0.15) return;

    let startX = chunkX * CHUNK_SIZE + 5 + Math.floor(Math.random() * (CHUNK_SIZE - 15));
    for (let house = 0; house < 3; house++) {
      let baseX = startX + house * 5;
      let groundY = terrainHeight(baseX);
      for (let x = baseX; x < baseX + 4; x++) {
        for (let y = groundY - 3; y <= groundY; y++) {
          if (x === baseX || x === baseX + 3 || y === groundY || y === groundY - 3) {
            setBlock(x, y, 6);
          } else {
            setBlock(x, y, 0);
          }
        }
      }
      for (let x = baseX - 1; x <= baseX + 4; x++) {
        setBlock(x, groundY - 4, 7);
      }
    }
  }

  function generateChunk(chunkX) {
    for (let x = chunkX * CHUNK_SIZE; x < (chunkX + 1) * CHUNK_SIZE; x++) {
      let column = [];
      let groundHeight = terrainHeight(x);
      for (let y = 0; y < WORLD_HEIGHT; y++) {
        if (y > groundHeight) {
          if (y > groundHeight + 3) column[y] = 3;
          else column[y] = 1;
        } else if (y === groundHeight) {
          column[y] = 2;
        } else if (y === WORLD_HEIGHT - 1) {
          column[y] = 5;
        } else if (y > groundHeight && y <= groundHeight + 3) {
          column[y] = 1;
        } else {
          column[y] = 0;
        }
        if (y === groundHeight && y >= WORLD_HEIGHT - 5 && Math.random() < 0.1) {
          column[y] = 4;
        }
      }
      world.set(x, column);
    }
    carveCaves(chunkX);
    generateTrees(chunkX);
    generateVillage(chunkX);
  }

  window.TILE_SIZE = TILE_SIZE;
  window.WORLD_HEIGHT = WORLD_HEIGHT;
  window.CHUNK_SIZE = CHUNK_SIZE;
  window.BLOCKS = BLOCKS;
  window.world = world;
  window.terrainHeight = terrainHeight;
  window.setBlock = setBlock;
  window.getBlock = getBlock;
  window.generateChunk = generateChunk;
})();
