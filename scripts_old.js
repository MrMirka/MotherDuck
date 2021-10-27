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

import { FlakesTexture } from './js/FlakesTexture.js';

let scene, camera, renderer, control, duck;
let orbitMesh1, orbitMesh2;
let container1, conteiner2, conteiner3, conteiner4;
let composer, bloomPass, sun;


let ring, ringDisk;
let stats;

const params = {
	exposure: 0.3,
	bloomStrength: 0.26,
	bloomThreshold: 0.28,
	bloomRadius: 0.45
};

let gui = new GUI();
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
	addRec(0,0,-80,Math.PI);
	addRec(0,-40,-40,Math.PI/2);
	addRec(0,40,-40,-Math.PI/2);
	
	conteiner3.rotation.set(0,-Math.PI/2,0);
	conteiner3.position.set(-40,0,0);
	container1.add(conteiner3);

	
	
	
	//RING EMMITION
	const immerMat = new THREE.MeshStandardMaterial({emissive: 0xffffff, emissiveIntensity: 0.3, side: THREE.DoubleSide});	
	let ringEmGeo = new THREE.CylinderGeometry(58.67,58.67,4,165,2,true);
	ringDisk = new THREE.Mesh(ringEmGeo,immerMat);
	ringDisk.rotation.x = Math.PI/2;
	container1.add(ringDisk);

	

	

	camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 1500 );
	camera.position.set( 0, 45, 100 );
	camera.lookAt(0,0,0);

	renderer = new THREE.WebGLRenderer( { alpha:true, antialias: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = .3;
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	control = new OrbitControls(camera, renderer.domElement);
	control.update();

	//COMPOSE
	const renderScene = new RenderPass(scene, camera);

	bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
	bloomPass.threshold = params.bloomThreshold;
	bloomPass.strength = params.bloomStrength;
	bloomPass.radius = params.bloomRadius;

	composer = new EffectComposer( renderer );
	composer.addPass(renderScene);
	composer.addPass(bloomPass);

	
	
	let loader = new GLTFLoader();
	loader.load('motherduck3.glb', function(gltf) {
		duck = gltf.scene.children[0];
		duck.scale.set(1,1,1);
		duck.position.set(0,-15,0);
		gltf.scene.traverse( function( node ) {
			if ( node.material ) {
				node.material.envMapIntensity = 0.6;
				node.material.reflectivity = 1;
				node.material.projection = 'normal';
				node.material.transparent = false;
			}
		});
		//LIGTH
		sun = new THREE.DirectionalLight(0xffffff,15.2);
		sun.target = duck;
		scene.add(sun);
		gui.add(sun.position, 'x', -500,500,15);
		gui.add(sun.position, 'y', -500,500,15);
		gui.add(sun.position, 'z', -500,500,15);
		gui.add(sun, 'intensity', 0,30,0.1);

		scene.add(duck);

		const hdri = new RGBELoader();
		hdri.load( './img/ballroom_2k.pic', function ( texture ) {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapP = THREE.RepeatWrapping;
			scene.environment = texture;
			renderer.render( scene, camera );
		});
		
	});

	//RING
	loader.load('ring3.glb', function(gltf){
		ring = gltf.scene.children[0];
		ring.scale.set(1,1,1);
		ring.position.set(0,0,0);

		gltf.scene.traverse( function( node ) {
			if ( node.material ) {
				let texture = new THREE.CanvasTexture(new FlakesTexture());
				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;
				texture.repeat.x = 21;
				texture.repeat.y = 21;
				node.material.normalMap = texture;
				node.material.normalScale= new THREE.Vector2(1.5, 1.5);
				node.material.envMapIntensity = 0.6;
				node.material.reflectivity = 1;
				node.material.projection = 'normal';
				let roughness_map = new THREE.TextureLoader().load('./img/uh4sbhzc_2K_Roughness.jpg');
				roughness_map.wrapS = THREE.RepeatWrapping;
				roughness_map.wrapT = THREE.RepeatWrapping;
				roughness_map.repeat.x = 1;
				roughness_map.repeat.y = 3;
				node.material.roughnessMap = roughness_map;
			}
			
		});
		scene.add(ring);
		container1.add(ring);
	});

	//RING LOGO
	loader.load('ring_logo2.glb', function(gltf){
		ring = gltf.scene.children[0];
		ring.scale.set(1,1,1);
		ring.position.set(0,0,0);

		gltf.scene.traverse( function( node ) {
			if ( node.material ) {
				let loader = new THREE.TextureLoader();
				node.material.transparent = true;
				node.material.metalness = 1;
				node.material.roughness = 0.12;
				
				loader.load('./img/logo_map2.jpg', texture => {
					node.material.alphaMap = texture;
					node.material.alphaMap.wrapT = THREE.RepeatWrapping;
					node.material.alphaMap.wrapS = THREE.RepeatWrapping;
					node.material.alphaMap.repeat.x = 1;
					node.material.alphaMap.repeat.y = 1;
					node.material.alphaMap.flipY=false;
				});
				node.material.envMapIntensity = 0.6;
				node.material.reflectivity = 1;
				node.material.projection = 'normal';
			}
			
		});
		scene.add(ring);
		container1.add(ring);
	});

	//------

	
	addUi();
	
	stats = new Stats();
	document.body.appendChild( stats.dom );
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

	stats.update();
	
	
	container1.rotation.x = Math.sin(timer) * 1.5 + Math.PI*2;
	container1.rotation.y = Math.sin(timer) * 2.5 + Math.PI*2;
	container1.rotation.z += 0.0013;
	
	

	composer.render();
	//renderer.render(scene, camera);
}



function addRec(x,y,z,r){
	const rectLight = new THREE.RectAreaLight( 0xffffff, 7, 20, 80 );
	rectLight.power = 2000;
	rectLight.position.set(x, y, z );
	rectLight.rotation.set(r, 0,0 );
	//const rectLightHelper = new RectAreaLightHelper( rectLight );
	//rectLight.add( rectLightHelper );
	scene.add( rectLight );
	conteiner3.add(rectLight);
	
}

function addUi(){
	
	gui.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {

		renderer.toneMappingExposure = Math.pow( value, 4.0 );

	} );

	gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {

		bloomPass.threshold = Number( value );

	} );

	gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {

		bloomPass.strength = Number( value );

	} );

	gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

		bloomPass.radius = Number( value );

	} );




}
