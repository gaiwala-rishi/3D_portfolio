import * as THREE from 'three'
import { mat, gloss, emMat } from './materials'

export function buildBookshelf(scene: THREE.Scene): THREE.Group {
	const bookshelfGroup = new THREE.Group()
	// White/light wood casing
	const casing = gloss(0xf0eeea, { roughness: 0.55, metalness: 0.02 })
	const shelf = mat(0xe8e4dc, { roughness: 0.6 })

	const makePanel = (w: number, h: number, d: number, x: number, y: number, z: number, mat2 = casing) => {
		const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat2)
		m.position.set(x, y, z)
		m.castShadow = m.receiveShadow = true
		bookshelfGroup.add(m)
	}
	// Side panels
	makePanel(0.12, 3.2, 0.45, -0.73, 0, 0)
	makePanel(0.12, 3.2, 0.45, 0.73, 0, 0)
	// Top & bottom
	makePanel(1.55, 0.12, 0.45, 0, -1.55, 0, shelf)
	makePanel(1.55, 0.12, 0.45, 0, 1.55, 0, shelf)
	// Shelves
	makePanel(1.55, 0.08, 0.43, 0, -0.78, 0, shelf)
	makePanel(1.55, 0.08, 0.43, 0, 0.10, 0, shelf)
	makePanel(1.55, 0.08, 0.43, 0, 0.98, 0, shelf)

	// Warm back-lit panel
	const backPanel = new THREE.Mesh(
		new THREE.BoxGeometry(1.46, 3.1, 0.04),
		emMat(0xfff0d8, 0xffcc88, 0.45)
	)
	backPanel.position.set(0, 0, -0.2)
	bookshelfGroup.add(backPanel)

	// Professional book colors
	const bookPalette = [
		0x2a3a5a, 0x8a2020, 0x2a6a3a, 0xb8a060, 0x4a3a7a,
		0x7a4a20, 0x205a5a, 0x6a2a3a, 0x3a5a2a, 0x5a5a2a,
		0x2a4a6a, 0x9a5a20, 0x4a6a4a, 0x8a6a3a, 0x3a3a6a,
	]
	let bi = 0
	for (let row = 0; row < 3; row++) {
		const baseY = -1.48 + row * 0.88
		let x = -0.62
		while (x < 0.63) {
			const bw = 0.062 + Math.random() * 0.052
			const bh = 0.38 + Math.random() * 0.22
			const tilted = Math.random() > 0.82
			const book = new THREE.Mesh(
				new THREE.BoxGeometry(bw, bh, 0.3),
				mat(bookPalette[bi % bookPalette.length], { roughness: 0.85 })
			)
			book.position.set(x + bw / 2, baseY + bh / 2, 0.02)
			book.rotation.z = tilted ? (Math.random() - 0.5) * 0.25 : 0
			book.castShadow = true
			bookshelfGroup.add(book)
			const spine = new THREE.Mesh(
				new THREE.BoxGeometry(bw * 0.7, bh * 0.15, 0.01),
				mat(0xf5f5f0, { roughness: 0.95 })
			)
			spine.position.set(x + bw / 2, baseY + bh * 0.6, 0.162)
			bookshelfGroup.add(spine)
			x += bw + 0.008
			bi++
		}
	}

	// Globe
	const globeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.08, 8), mat(0x8a8070))
	globeBase.position.set(-0.45, 1.67, 0.04)
	bookshelfGroup.add(globeBase)
	const globe = new THREE.Mesh(
		new THREE.SphereGeometry(0.09, 16, 12),
		mat(0x6090b0, { roughness: 0.45 })
	)
	globe.position.set(-0.45, 1.83, 0.04)
	bookshelfGroup.add(globe)
	for (let i = 0; i < 3; i++) {
		const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.004, 4, 16), mat(0xd0c8b0))
		ring.position.set(-0.45, 1.83, 0.04)
		ring.rotation.y = (i / 3) * Math.PI
		bookshelfGroup.add(ring)
	}

	// Decorative vase / white object (replacing clay pot)
	const vase = new THREE.Mesh(
		new THREE.CylinderGeometry(0.04, 0.06, 0.18, 12),
		gloss(0xf0eeea, { roughness: 0.3, metalness: 0.05 })
	)
	vase.position.set(0.5, 1.68, 0.04)
	bookshelfGroup.add(vase)
	const vaseNeck = new THREE.Mesh(
		new THREE.CylinderGeometry(0.025, 0.04, 0.08, 12),
		gloss(0xf0eeea, { roughness: 0.3, metalness: 0.05 })
	)
	vaseNeck.position.set(0.5, 1.82, 0.04)
	bookshelfGroup.add(vaseNeck)

	// Trophy (gold)
	const trophy = new THREE.Mesh(
		new THREE.CylinderGeometry(0.025, 0.04, 0.14, 8),
		mat(0xf0c040, { roughness: 0.3, metalness: 0.8 })
	)
	trophy.position.set(0.15, 1.73, 0.04)
	bookshelfGroup.add(trophy)
	const star = new THREE.Mesh(
		new THREE.SphereGeometry(0.032, 6, 4),
		mat(0xf0c040, { roughness: 0.2, metalness: 0.9 })
	)
	star.position.set(0.15, 1.83, 0.04)
	bookshelfGroup.add(star)

	// Cabinet legs (white)
	;(
		[
			[-0.63, -2.15, -0.18],
			[-0.63, -2.15, 0.18],
			[0.63, -2.15, -0.18],
			[0.63, -2.15, 0.18],
		] as any[]
	).forEach(([x, y, z]) => {
		const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.08), casing)
		leg.position.set(x, y, z)
		leg.castShadow = leg.receiveShadow = true
		bookshelfGroup.add(leg)
	})

	bookshelfGroup.position.set(3.5, 1.85, -7.2)
	bookshelfGroup.scale.set(1.2, 1.2, 1.2)
	scene.add(bookshelfGroup)

	return bookshelfGroup
}
