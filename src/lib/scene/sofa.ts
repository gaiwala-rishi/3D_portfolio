import * as THREE from 'three'
import { gloss, mat } from './materials'

interface GLTFResult { scene: THREE.Group }

export function buildSofa(scene: THREE.Scene, gltf: GLTFResult, coffeeTableGltf: GLTFResult): void {
	// ── GLB sofa model ─────────────────────────────────────────────────────────
	const model = gltf.scene
	model.traverse((c: any) => {
		if (c.isMesh) {
			c.castShadow = true
			c.receiveShadow = true
		}
	})

	// Use largest dimension (any axis) to drive scale — sofa may be in any orientation
	model.updateMatrixWorld(true)
	const box = new THREE.Box3().setFromObject(model)
	const size = new THREE.Vector3()
	box.getSize(size)
	const maxDim = Math.max(size.x, size.y, size.z)
	// Target 3.5m for the largest dimension (sofa length)
	const scale = 3.5 / maxDim
	model.scale.setScalar(scale)
	model.updateMatrixWorld(true)

	// Center XZ, floor at y=0
	const scaledBox = new THREE.Box3().setFromObject(model)
	const scaledCenter = new THREE.Vector3()
	scaledBox.getCenter(scaledCenter)
	model.position.x -= scaledCenter.x
	model.position.z -= scaledCenter.z
	model.position.y -= scaledBox.min.y

	const sofaGroup = new THREE.Group()
	sofaGroup.add(model)
	// After scale 1.3: sofa width = 3.5×1.3 = 4.55m, half = 2.275m
	// Left wall at x=-5 → center.x = -5 + 2.275 = -2.725
	sofaGroup.position.set(-2.725, 0, -1.2)
	sofaGroup.rotation.y = Math.PI / 2
	sofaGroup.scale.setScalar(1.3)
	scene.add(sofaGroup)

	// ── Coffee table (GLB model) ───────────────────────────────────────────────
	const tableModel = coffeeTableGltf.scene
	tableModel.traverse((c: any) => {
		if (c.isMesh) { c.castShadow = true; c.receiveShadow = true }
	})

	tableModel.updateMatrixWorld(true)
	const tBox = new THREE.Box3().setFromObject(tableModel)
	const tSize = new THREE.Vector3()
	tBox.getSize(tSize)
	// Target ~1.1m on the longest horizontal axis
	const tScale = 1.1 / Math.max(tSize.x, tSize.z)
	tableModel.scale.setScalar(tScale)
	tableModel.updateMatrixWorld(true)

	// Floor at y=0, centered on XZ
	const tBox2 = new THREE.Box3().setFromObject(tableModel)
	const tCenter = new THREE.Vector3()
	tBox2.getCenter(tCenter)
	tableModel.position.x -= tCenter.x
	tableModel.position.z -= tCenter.z
	tableModel.position.y -= tBox2.min.y

	const tableGroup = new THREE.Group()
	tableGroup.add(tableModel)
	tableGroup.position.set(-2.0, 0, -0.6)
	tableGroup.scale.setScalar(1.56)
	scene.add(tableGroup)

	// ── Floor lamp (gold, matching reference image) ───────────────────────────
	const lampGroup = new THREE.Group()
	const goldMat = gloss(0xc8a840, { metalness: 0.88, roughness: 0.18 })
	const shadeMat = new THREE.MeshStandardMaterial({
		color: 0xf2e8cc,
		emissive: 0xffcc66,
		emissiveIntensity: 1.4,
		roughness: 0.6,
		side: THREE.DoubleSide,
	})

	const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.05, 16), goldMat)
	lampBase.castShadow = true
	lampGroup.add(lampBase)

	const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 1.72, 10), goldMat)
	pole.position.y = 0.885
	pole.castShadow = true
	lampGroup.add(pole)

	const joint = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), goldMat)
	joint.position.y = 1.77
	lampGroup.add(joint)

	const shade = new THREE.Mesh(
		new THREE.CylinderGeometry(0.08, 0.35, 0.42, 24, 1, true),
		shadeMat
	)
	shade.position.y = 1.57
	lampGroup.add(shade)

	const shadeCap = new THREE.Mesh(
		new THREE.CircleGeometry(0.08, 16),
		mat(0x1a1810, { roughness: 0.7 })
	)
	shadeCap.rotation.x = -Math.PI / 2
	shadeCap.position.y = 1.78
	lampGroup.add(shadeCap)

	const shadeRim = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.012, 8, 24), goldMat)
	shadeRim.rotation.x = Math.PI / 2
	shadeRim.position.y = 1.36
	lampGroup.add(shadeRim)

	const bulb = new THREE.Mesh(
		new THREE.SphereGeometry(0.028, 10, 8),
		new THREE.MeshStandardMaterial({
			color: 0xffffee,
			emissive: 0xffcc66,
			emissiveIntensity: 4.0,
		})
	)
	bulb.position.y = 1.62
	lampGroup.add(bulb)

	lampGroup.position.set(-3.5, 0, -0.3)
	lampGroup.scale.setScalar(1.3)
	scene.add(lampGroup)
}
