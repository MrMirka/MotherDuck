import * as THREE from './build/three.module.js';
import { OrbitControls } from './js/OrbitControls.js';
import { RGBELoader } from './js/RGBELoader.js';
import { GLTFLoader } from './js/GLTFLoader.js';
import Stats from './js/stats.module.js';
import { GUI } from './js/dat.gui.module.js';
import { EffectComposer } from './js/postprocessing/EffectComposer.js';
import { RenderPass } from './js/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './js/postprocessing/UnrealBloomPass.js';
import { RectAreaLightHelper } from './js/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from './js/RectAreaLightUniformsLib.js';

import { SSRPass } from './js/postprocessing/SSRPass.js';
import { ShaderPass } from './js/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from './js/shaders/GammaCorrectionShader.js';
import { ReflectorForSSRPass } from './js/objects/ReflectorForSSRPass.js';

let scene, camera, renderer, control, duck;
let orbitMesh1, orbitMesh2;
let container1, conteiner2, conteiner3, conteiner4;
let composer, bloomPass;
let ssrPass, groundReflector;

let ring, ringDisk;

const selects = [];

let rectLight;

const params2 = {
	exposure: 1,
	bloomStrength: 1.5,
	bloomThreshold: 0,
	bloomRadius: 0
};

const params = {
	enableSSR: true,
	autoRotate: true,
	otherMeshes: true,
	groundReflector: true
};

const physic = {
	clearcoat: 1.0,
	clearcoatRoughness:1,
	metalness: 0.1,
	roughness:1,
	color: 0x181818
};


init();

function init(){
	scene = new THREE.Scene();
	let fog = new THREE.Fog(0x000000,300,700);
	scene.fog = fog;
	

	container1 = new THREE.Object3D();
	conteiner2 = new THREE.Object3D();
	conteiner3 = new THREE.Object3D();
	
	scene.add(container1, conteiner3);

	RectAreaLightUniformsLib.init();
	
	addRec(0,0,0,0);
	addRec(0,0,-150,Math.PI);
	addRec(0,-75,-75,Math.PI/2);
	addRec(0,75,-75,-Math.PI/2);
	
	conteiner3.rotation.set(0,-Math.PI/2,0);
	conteiner3.position.set(-75,0,0);

	container1.add(conteiner3);

	
	
	
	
	const immerMat = new THREE.MeshStandardMaterial({emissive: 0xffffff, emissiveIntensity: 5, side: THREE.DoubleSide});

			/*
			const innerOrbit1 = new THREE.TorusGeometry(44,0.2,32,200);
			
			let inerMesh1 = new THREE.Mesh(innerOrbit1, immerMat);
			
			const orbit1 = new THREE.TorusGeometry(45,1,32,200);
			const orbitMat1 = new THREE.MeshPhysicalMaterial( physic);
			orbitMesh1 = new THREE.Mesh(orbit1,orbitMat1);
			//orbitMesh1.add(new THREE.DirectionalLight( 0xffffff, 0.8));
			orbitMesh1.position.set(0,0,0)
			selects.push(orbitMesh1);
			//container1.add(orbitMesh1, inerMesh1);

			const innerOrbit2 = new THREE.TorusGeometry(46,0.2,32,200);
			let inerMesh2 = new THREE.Mesh(innerOrbit2, immerMat);

			const orbit2 = new THREE.TorusGeometry(47,1,32,200);
			const orbitMat2 = new THREE.MeshPhysicalMaterial( physic);
			orbitMesh2 = new THREE.Mesh(orbit2,orbitMat2);
			//orbitMesh2.add(new THREE.DirectionalLight( 0xffffff, 0.6));
			orbitMesh2.position.set(0,0,0)
			selects.push(orbitMesh2);
			//conteiner2.add(orbitMesh2, inerMesh2);
			*/

	//RING EMMITION
	let ringEmGeo = new THREE.CylinderGeometry(58.5,58.5,4,96,2,true);
	ringDisk = new THREE.Mesh(ringEmGeo,immerMat);
	ringDisk.rotation.x = Math.PI/2;

	container1.add(ringDisk);

	

	camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 1500 );
	camera.position.set( 0, 45, 100 );
	camera.lookAt(0,0,0);

	renderer = new THREE.WebGLRenderer( { alpha:false, antialias: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 0.22;
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	control = new OrbitControls(camera, renderer.domElement);
	control.update();

	
	
	let loader = new GLTFLoader();
	loader.load('motherduck.glb', function(gltf) {
		duck = gltf.scene.children[0];
		duck.scale.set(1,1,1);
		duck.position.set(0,-15,0);
		gltf.scene.traverse( function( node ) {
			if ( node.material ) {
				node.material.envMapIntensity = 0.6;
				node.material.reflectivity = 1;
				node.material.projection = 'normal';
			}
		});
		selects.push(duck);
		scene.add(duck);

		const hdri = new RGBELoader();
		hdri.load( './img/hdri_3.hdr', function ( texture ) {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapP = THREE.RepeatWrapping;
			scene.environment = texture;
			renderer.render( scene, camera );
		});
		
	});
	loader.load('ring.glb', function(gltf){
		ring = gltf.scene.children[0];
		ring.scale.set(1,1,1);
		ring.position.set(0,0,0);
		scene.add(ring);
		container1.add(ring);
	});

	

	animate();
}

function animate(){
	render();
	control.update();
	requestAnimationFrame(animate);
	
}

function render(){
	const time = performance.now() * 0.01;
	const timer = Date.now() * 0.00007;

	
	container1.rotation.x = Math.cos(timer) * 5  + Math.PI*2;
	container1.rotation.y = Math.sin(timer) * 3 * Math.cos(Math.sin(time*0.1)) + Math.PI*2;
	container1.rotation.z = Math.cos(timer) * 12 * Math.cos(Math.sin(time*0.1));



	//camera.updateProjectionMatrix();
	

	renderer.render(scene, camera);
}



function addRec(x,y,z,r){
	const rectLight = new THREE.RectAreaLight( 0xffffff, 7, 20, 150 );
	rectLight.power = 2000;
	rectLight.position.set(x, y, z );
	rectLight.rotation.set(r, 0,0 );
	scene.add( rectLight );
	//scene.add( new RectAreaLightHelper( rectLight ) );
	conteiner3.add(rectLight);
	
}
