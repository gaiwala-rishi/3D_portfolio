import * as THREE from "three";
import { mat, gloss, emMat } from "./materials";

export const DESK_POS = new THREE.Vector3(1.5, 0.25, -2.1);
export const DESK_ROT_Y = -Math.PI * 0.18;

export interface CharacterResult {
  characterGroup: THREE.Group;
}

export function buildCharacterAndBed(
  scene: THREE.Scene,
  screenMats: THREE.MeshStandardMaterial[],
): CharacterResult {
  const skin = mat(0xffccaa);
  const shirt = mat(0x2d3a4a, { roughness: 0.8 });
  const pants = mat(0x1a1a2a, { roughness: 0.85 });
  const hair = mat(0x1a0f05);
  const shoe = mat(0x111111);
  const glass = gloss(0x222233, { metalness: 0.85, roughness: 0.08 });

  const characterGroup = new THREE.Group();

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.46, 0.22), shirt);
  torso.position.set(0, 0.87, 0.02);
  torso.castShadow = true;
  characterGroup.add(torso);
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.3, 0.012),
    mat(0x4a6888),
  );
  stripe.position.set(0, 0.87, 0.117);
  characterGroup.add(stripe);
  const collarL = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.06, 0.012),
    mat(0xfafafa),
  );
  collarL.position.set(-0.05, 1.09, 0.116);
  collarL.rotation.z = 0.35;
  characterGroup.add(collarL);
  const collarR = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.06, 0.012),
    mat(0xfafafa),
  );
  collarR.position.set(0.05, 1.09, 0.116);
  collarR.rotation.z = -0.35;
  characterGroup.add(collarR);

  // Legs
  ([-0.11, 0.11] as number[]).forEach((lx) => {
    const thigh = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, 0.38),
      pants,
    );
    thigh.position.set(lx, 0.64, 0.19);
    thigh.castShadow = true;
    characterGroup.add(thigh);
    const calf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.44, 0.13), pants);
    calf.position.set(lx, 0.4, 0.38);
    calf.castShadow = true;
    characterGroup.add(calf);
    const shoe2 = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.22), shoe);
    shoe2.position.set(lx, 0.14, 0.47);
    characterGroup.add(shoe2);
  });

  // Arms
  ([-0.21, 0.21] as number[]).forEach((ax) => {
    const side = ax < 0 ? -1 : 1;
    const uArm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.28, 0.11), shirt);
    uArm.position.set(ax, 0.96, 0.04);
    uArm.rotation.z = side * 0.22;
    uArm.rotation.x = -0.55;
    uArm.castShadow = true;
    characterGroup.add(uArm);
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.058, 8, 6), shirt);
    elbow.position.set(ax, 0.841, 0.113);
    characterGroup.add(elbow);
    const fore = new THREE.Mesh(
      new THREE.BoxGeometry(0.088, 0.21, 0.088),
      skin,
    );
    fore.position.set(ax * 0.89, 0.766, 0.184);
    fore.rotation.x = 2.38;
    fore.rotation.z = -side * 0.1;
    characterGroup.add(fore);
    const hand = new THREE.Mesh(
      new THREE.BoxGeometry(0.095, 0.036, 0.085),
      skin,
    );
    hand.position.set(ax * 0.78, 0.69, 0.255);
    characterGroup.add(hand);
    for (let f = 0; f < 4; f++) {
      const fing = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, 0.018, 0.034),
        skin,
      );
      fing.position.set(ax * 0.78 + (f - 1.5) * 0.02, 0.69, 0.296);
      characterGroup.add(fing);
    }
  });

  // Head & neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.052, 0.06, 0.09, 10),
    skin,
  );
  neck.position.set(0, 1.145, 0.02);
  characterGroup.add(neck);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.225, 0.2), skin);
  head.position.set(0, 1.305, 0.02);
  head.castShadow = true;
  characterGroup.add(head);

  // Eyes
  const eyeY = 1.315;
  ([-0.056, 0.056] as number[]).forEach((ex) => {
    const brow = new THREE.Mesh(
      new THREE.BoxGeometry(0.044, 0.01, 0.006),
      mat(0x1a0f05),
    );
    brow.position.set(ex, eyeY + 0.022, 0.124);
    characterGroup.add(brow);
    const sclera = new THREE.Mesh(
      new THREE.BoxGeometry(0.042, 0.03, 0.006),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }),
    );
    sclera.position.set(ex, eyeY, 0.128);
    characterGroup.add(sclera);
    const iris = new THREE.Mesh(
      new THREE.CircleGeometry(0.013, 12),
      new THREE.MeshStandardMaterial({ color: 0x1a1a2e }),
    );
    iris.position.set(ex, eyeY, 0.132);
    characterGroup.add(iris);
    const pupil = new THREE.Mesh(
      new THREE.CircleGeometry(0.007, 10),
      new THREE.MeshStandardMaterial({ color: 0x050508 }),
    );
    pupil.position.set(ex, eyeY, 0.133);
    characterGroup.add(pupil);
    const shine = new THREE.Mesh(
      new THREE.CircleGeometry(0.004, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1.0,
      }),
    );
    shine.position.set(ex + 0.006, eyeY + 0.006, 0.134);
    characterGroup.add(shine);
  });

  // Ears
  ([-0.108, 0.108] as number[]).forEach((ex) => {
    const ear = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.048, 0.042),
      skin,
    );
    ear.position.set(ex, 1.3, 0.02);
    characterGroup.add(ear);
  });

  // Hair
  const hairCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.085, 0.21),
    hair,
  );
  hairCap.position.set(0, 1.455, 0.01);
  characterGroup.add(hairCap);
  ([-0.1, 0.1] as number[]).forEach((hx) => {
    const side2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.14, 0.18),
      hair,
    );
    side2.position.set(hx, 1.36, 0.01);
    characterGroup.add(side2);
  });
  const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.04), hair);
  fringe.position.set(0, 1.41, 0.105);
  characterGroup.add(fringe);

  // Glasses
  ([-0.054, 0.054] as number[]).forEach((gx) => {
    const lens = new THREE.Mesh(
      new THREE.TorusGeometry(0.026, 0.007, 7, 18),
      glass,
    );
    lens.position.set(gx, 1.3, 0.112);
    characterGroup.add(lens);
    const fill = new THREE.Mesh(
      new THREE.CircleGeometry(0.022, 16),
      new THREE.MeshStandardMaterial({
        color: 0x88aacc,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
      }),
    );
    fill.position.set(gx, 1.3, 0.114);
    characterGroup.add(fill);
  });
  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(0.028, 0.007, 0.005),
    glass,
  );
  bridge.position.set(0, 1.3, 0.113);
  characterGroup.add(bridge);
  ([-0.08, 0.08] as number[]).forEach((tx) => {
    const temple = new THREE.Mesh(
      new THREE.BoxGeometry(0.005, 0.006, 0.09),
      glass,
    );
    temple.position.set(tx, 1.3, 0.067);
    characterGroup.add(temple);
  });

  // Headphones
  ([-0.11, 0.11] as number[]).forEach((hpx) => {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 0.022, 10),
      mat(0x1a1a22),
    );
    cup.rotation.z = Math.PI / 2;
    cup.position.set(hpx, 1.345, 0.02);
    characterGroup.add(cup);
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.033, 0.033, 0.008, 10),
      mat(0x111118),
    );
    pad.rotation.z = Math.PI / 2;
    pad.position.set(hpx * 1.06, 1.345, 0.02);
    characterGroup.add(pad);
  });
  const hpBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.125, 0.01, 7, 20, Math.PI),
    mat(0x1a1a22),
  );
  hpBand.position.set(0, 1.38, 0.02);
  hpBand.rotation.z = Math.PI / 2;
  characterGroup.add(hpBand);

  // Lap laptop
  const lapBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.032, 0.3),
    gloss(0x2c2c36, { metalness: 0.6 }),
  );
  lapBase.position.set(0, 0.66, 0.19);
  lapBase.rotation.x = -0.08;
  lapBase.castShadow = true;
  characterGroup.add(lapBase);
  const lapScreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.27, 0.016),
    gloss(0x2c2c36, { metalness: 0.6 }),
  );
  lapScreen.position.set(0, 0.86, 0.01);
  lapScreen.rotation.x = -1.05;
  characterGroup.add(lapScreen);
  const lapDispMat = emMat(0x0d1f3c, 0x2244ee, 0.9);
  (lapDispMat as any)._baseIntensity = lapDispMat.emissiveIntensity;
  screenMats.push(lapDispMat);
  const lapDisplay = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.21, 0.006),
    lapDispMat,
  );
  lapDisplay.position.set(0, 0.86, 0.022);
  lapDisplay.rotation.x = -1.05;
  characterGroup.add(lapDisplay);
  [0xf7916a, 0x5af778, 0x7c6af7, 0xffee88, 0x55ccff].forEach((col, i) => {
    const w = 0.055 + Math.random() * 0.1;
    const indent = (i % 3) * 0.022;
    const clm = emMat(col, col, 1.5);
    (clm as any)._baseIntensity = clm.emissiveIntensity;
    screenMats.push(clm);
    const cl = new THREE.Mesh(new THREE.BoxGeometry(w, 0.013, 0.002), clm);
    cl.position.set(-0.08 + indent + w / 2, 0.88 + 0.04 - i * 0.038, 0.034);
    cl.rotation.x = -1.05;
    characterGroup.add(cl);
  });

  characterGroup.position.copy(DESK_POS);
  characterGroup.rotation.y = DESK_ROT_Y;
  characterGroup.scale.set(1.18, 1.18, 1.18);
  scene.add(characterGroup);

  return { characterGroup };
}
