import * as THREE from "three";
import { mat, gloss } from "./materials";

export interface RoomResult {
  winPaneMats: THREE.MeshStandardMaterial[];
  winLight: THREE.PointLight;
}

export function buildRoom(scene: THREE.Scene): RoomResult {
  const ROOM_W = 13,
    ROOM_D = 11.7,
    ROOM_H = 6.5,
    ROOM_CZ = -5.2;
  const wallColor = 0xd8d4ce;
  const ceilColor = 0xf2f0ee;
  const trimColor = 0xe8e6e0;

  // ── Floor (wood texture) ──────────────────────────────────────────────────
  const texLoader = new THREE.TextureLoader();
  const floorRepeat = new THREE.Vector2(9, 8);

  function floorTex(name: string, srgb = false) {
    const t = texLoader.load(`/textures/wood_floor/${name}`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.copy(floorRepeat);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  const colorMap = floorTex("wood_floor_Color.png", true);
  const normalMap = floorTex("wood_floor_NormalGL.png");
  const roughMap = floorTex("wood_floor_Roughness.png");
  const aoMap = floorTex("wood_floor_AmbientOcclusion.png");
  const dispMap = floorTex("wood_floor_Displacement.png");

  // r152+ uses 'uv1' (channel 1) for aoMap; add enough segments for displacement
  const floorGeo = new THREE.PlaneGeometry(ROOM_W, ROOM_D, 64, 64);
  floorGeo.setAttribute("uv1", floorGeo.attributes.uv.clone());

  const floorMat = new THREE.MeshStandardMaterial({
    map: colorMap,
    normalMap,
    normalMapType: THREE.TangentSpaceNormalMap,
    normalScale: new THREE.Vector2(1.5, 1.5),
    roughnessMap: roughMap,
    roughness: 0.8,
    aoMap,
    aoMapIntensity: 1.2,
    displacementMap: dispMap,
    displacementScale: 0.008,
    displacementBias: -0.004,
    metalness: 0.0,
  });

  const floorBase = new THREE.Mesh(floorGeo, floorMat);
  floorBase.rotation.x = -Math.PI / 2;
  floorBase.position.set(0, 0, ROOM_CZ);
  floorBase.receiveShadow = true;
  scene.add(floorBase);

  // ── Wall & ceiling PBR textures ───────────────────────────────────────────
  function wallTex(name: string, rx: number, ry: number, srgb = false) {
    const t = texLoader.load(`/textures/wall/${name}`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function makeWallMat(rx: number, ry: number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      map: wallTex("wall.jpg", rx, ry, true),
      roughness: 0.88,
      metalness: 0.0,
    });
  }

  // ── Walls ──────────────────────────────────────────────────────────────────
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_W, ROOM_H, 32, 20),
    makeWallMat(4, 2),
  );
  backWall.position.set(0, ROOM_H / 2, -11.05);
  backWall.receiveShadow = true;
  scene.add(backWall);

  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_D, ROOM_H, 28, 20),
    makeWallMat(3.5, 2),
  );
  leftWall.position.set(-6.5, ROOM_H / 2, ROOM_CZ);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_D, ROOM_H, 28, 20),
    makeWallMat(3.5, 2),
  );
  rightWall.position.set(6.5, ROOM_H / 2, ROOM_CZ);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  // Ceiling
  const ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_W, ROOM_D, 32, 28),
    makeWallMat(5, 4),
  );
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, ROOM_H, ROOM_CZ);
  scene.add(ceil);

  // ── Crown molding (white) ──────────────────────────────────────────────────
  (
    [
      [ROOM_W, new THREE.Vector3(0, ROOM_H - 0.06, -11.0), 0],
      [ROOM_D, new THREE.Vector3(-6.46, ROOM_H - 0.06, ROOM_CZ), Math.PI / 2],
      [ROOM_D, new THREE.Vector3(6.46, ROOM_H - 0.06, ROOM_CZ), Math.PI / 2],
    ] as any[]
  ).forEach(([w, pos, ry]) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.12, 0.08),
      mat(trimColor),
    );
    m.position.copy(pos);
    m.rotation.y = ry;
    scene.add(m);
  });

  // Baseboard (white)
  (
    [
      [ROOM_W, new THREE.Vector3(0, 0.07, -11.0), 0],
      [ROOM_D, new THREE.Vector3(-6.46, 0.07, ROOM_CZ), Math.PI / 2],
      [ROOM_D, new THREE.Vector3(6.46, 0.07, ROOM_CZ), Math.PI / 2],
    ] as any[]
  ).forEach(([w, pos, ry]) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.14, 0.05),
      mat(trimColor),
    );
    m.position.copy(pos);
    m.rotation.y = ry;
    scene.add(m);
  });

  // ── Single wide window with scenic view ──────────────────────────────────
  const winPaneMats: THREE.MeshStandardMaterial[] = [];
  const frameMat = mat(0x888880, { roughness: 0.4, metalness: 0.5 });

  const winW = 8.5,
    winH = 4.5,
    winY = 3.0,
    winX = 0;
  const wallZ = -11.05;

  // Scenic exterior visible through the window — sized to fill full opening
  const sceneryTex = texLoader.load("/textures/window_view/view.jpeg");
  sceneryTex.colorSpace = THREE.SRGBColorSpace;
  const scenery = new THREE.Mesh(
    new THREE.PlaneGeometry(winW, winH),
    new THREE.MeshBasicMaterial({ map: sceneryTex, toneMapped: false }),
  );
  scenery.position.set(winX, winY, wallZ + 0.01);
  scene.add(scenery);

  // Glass pane — layered over scenery for window-glass feel
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xd0e8f8,
    emissive: new THREE.Color(0x88b8d8),
    emissiveIntensity: 0.07,
    roughness: 0.02,
    metalness: 0.06,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  winPaneMats.push(glassMat);
  const glassMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(winW, winH),
    glassMat,
  );
  glassMesh.position.set(winX, winY, wallZ + 0.02);
  scene.add(glassMesh);

  // Outer frame
  const fW = 0.09,
    fD = 0.07;
  (
    [
      [winW + fW, fW, fD, winX, winY + winH / 2 + fW / 2, wallZ + 0.03],
      [winW + fW, fW, fD, winX, winY - winH / 2 - fW / 2, wallZ + 0.03],
      [fW, winH + fW * 2, fD, winX - winW / 2 - fW / 2, winY, wallZ + 0.03],
      [fW, winH + fW * 2, fD, winX + winW / 2 + fW / 2, winY, wallZ + 0.03],
    ] as [number, number, number, number, number, number][]
  ).forEach(([w, h, d, x, y, z]) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      frameMat,
    );
    m.position.set(x, y, z);
    scene.add(m);
  });

  // Vertical mullions — divide into 3 visual sections
  [-winW / 3, winW / 3].forEach((mx) => {
    const mull = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, winH, fD),
      frameMat,
    );
    mull.position.set(mx, winY, wallZ + 0.03);
    scene.add(mull);
  });

  // Window sill ledge
  const sill = new THREE.Mesh(
    new THREE.BoxGeometry(winW + 0.3, 0.06, 0.18),
    mat(0xe8e6e0, { roughness: 0.5, metalness: 0.1 }),
  );
  sill.position.set(winX, winY - winH / 2 - 0.03, wallZ + 0.09);
  scene.add(sill);

  // Window point light
  const winLight = new THREE.PointLight(0xd4eaf5, 0.8, 12);
  winLight.position.set(0, winY, wallZ + 1.3);
  scene.add(winLight);

  // ── Ceiling border trim ───────────────────────────────────────────────────
  const borderMat = gloss(0xdddbd6, { roughness: 0.5, metalness: 0.1 });
  [
    [ROOM_W, 0, ROOM_H - 0.02, -11.0, 0, 0.08, 0.04],
    [ROOM_D, -6.46, ROOM_H - 0.02, ROOM_CZ, Math.PI / 2, 0.08, 0.04],
    [ROOM_D, 6.46, ROOM_H - 0.02, ROOM_CZ, Math.PI / 2, 0.08, 0.04],
  ].forEach(([w, x, y, z, ry, h, d]) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w as number, h as number, d as number),
      borderMat,
    );
    m.position.set(x as number, y as number, z as number);
    m.rotation.y = ry as number;
    scene.add(m);
  });

  return { winPaneMats, winLight };
}
