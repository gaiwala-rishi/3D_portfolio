import * as THREE from 'three'
import { mat, gloss } from './materials'

export interface PropsResult {
	particleGeo: THREE.BufferGeometry
	PARTICLE_COUNT: number
}

export function buildProps(scene: THREE.Scene, isMobile: boolean): PropsResult {
	// ── Dust particles ─────────────────────────────────────────────────────────
	const PARTICLE_COUNT = isMobile ? 60 : 200
	const particleGeo = new THREE.BufferGeometry()
	const particlePos = new Float32Array(PARTICLE_COUNT * 3)
	for (let i = 0; i < PARTICLE_COUNT; i++) {
		particlePos[i * 3] = (Math.random() - 0.5) * 9
		particlePos[i * 3 + 1] = Math.random() * 5.5 + 0.5
		particlePos[i * 3 + 2] = Math.random() * -8 - 0.3
	}
	particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))
	scene.add(
		new THREE.Points(
			particleGeo,
			new THREE.PointsMaterial({
				color: 0xd4cfc8,
				size: 0.038,
				sizeAttenuation: true,
				transparent: true,
				opacity: 0.35,
				depthWrite: false,
			})
		)
	)

	// ── Large office floor plants ──────────────────────────────────────────────
	function buildOfficePlant(scale: number): THREE.Group {
		const g = new THREE.Group()
		const pot = new THREE.Mesh(
			new THREE.CylinderGeometry(0.22 * scale, 0.18 * scale, 0.42 * scale, 14),
			gloss(0xd8d4cc, { roughness: 0.45, metalness: 0.05 })
		)
		pot.castShadow = true
		g.add(pot)
		const soil = new THREE.Mesh(new THREE.CircleGeometry(0.215 * scale, 14), mat(0x2a1e14))
		soil.rotation.x = -Math.PI / 2
		soil.position.y = 0.212 * scale
		g.add(soil)
		const trunk = new THREE.Mesh(
			new THREE.CylinderGeometry(0.04 * scale, 0.06 * scale, 0.55 * scale, 8),
			mat(0x5a4830, { roughness: 0.9 })
		)
		trunk.position.y = 0.49 * scale
		g.add(trunk)
		for (let i = 0; i < 12; i++) {
			const a = (i / 12) * Math.PI * 2
			const h = 0.35 + Math.random() * 0.45
			const r = 0.12 + Math.random() * 0.12
			const leaf = new THREE.Mesh(
				new THREE.SphereGeometry(0.18 * scale, 8, 6),
				mat(i % 3 === 0 ? 0x1a6630 : 0x228844, { roughness: 0.85 })
			)
			leaf.scale.set(0.5 + r, h / 0.35, 0.5 + r)
			leaf.position.set(
				Math.sin(a) * 0.18 * scale,
				(0.62 + h * 0.22) * scale,
				Math.cos(a) * 0.18 * scale
			)
			leaf.castShadow = true
			g.add(leaf)
		}
		const canopy = new THREE.Mesh(
			new THREE.SphereGeometry(0.32 * scale, 10, 8),
			mat(0x1e7038, { roughness: 0.82 })
		)
		canopy.scale.set(1.0, 0.8, 1.0)
		canopy.position.y = 0.95 * scale
		g.add(canopy)
		return g
	}

	const plant1 = buildOfficePlant(1.6)
	plant1.position.set(4.2, 0, -1.2)
	scene.add(plant1)

	const plant2 = buildOfficePlant(0.9)
	plant2.position.set(-4.4, 0, -6.8)
	scene.add(plant2)

	return { particleGeo, PARTICLE_COUNT }
}
