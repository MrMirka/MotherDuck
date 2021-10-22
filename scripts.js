import * as THREE from './build/three.module.js';
import { OrbitControls } from './js/OrbitControls.js';
import { RGBELoader } from './js/RGBELoader.js';
import { GLTFLoader } from './js/GLTFLoader.js';
import Stats from './js/stats.module.js';
import { GUI } from './js/dat.gui.module.js';
import { EffectComposer } from './js/postprocessing/EffectComposer.js';
import { RenderPass } from './js/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './js/postprocessing/UnrealBloomPass.js';
import { RectAreaLightUniformsLib } from './js/RectAreaLightUniformsLib.js';

import { SSRPass } from './js/postprocessing/SSRPass.js';
import { ShaderPass } from './js/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from './js/shaders/GammaCorrectionShader.js';
import { ReflectorForSSRPass } from './js/objects/ReflectorForSSRPass.js';

let scene, camera, renderer, control, duck;
let orbitMesh1, orbitMesh2;
let container1, conteiner2;
let composer, bloomPass;
let ssrPass, groundReflector;

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
	

	container1 = new THREE.Object3D();
	conteiner2 = new THREE.Object3D();
	scene.add(container1, conteiner2);



	
	const immerMat = new THREE.MeshStandardMaterial({emissive: 0xffffff, emissiveIntensity: 1});

	const innerOrbit1 = new THREE.TorusGeometry(44,0.2,32,200);
	
	let inerMesh1 = new THREE.Mesh(innerOrbit1, immerMat);
	
	const orbit1 = new THREE.TorusGeometry(45,1,32,200);
	const orbitMat1 = new THREE.MeshPhysicalMaterial( physic);
	orbitMesh1 = new THREE.Mesh(orbit1,orbitMat1);
	//orbitMesh1.add(new THREE.DirectionalLight( 0xffffff, 0.8));
	orbitMesh1.position.set(0,0,0)
	selects.push(orbitMesh1);
	container1.add(orbitMesh1, inerMesh1);

	const innerOrbit2 = new THREE.TorusGeometry(46,0.2,32,200);
	let inerMesh2 = new THREE.Mesh(innerOrbit2, immerMat);

	const orbit2 = new THREE.TorusGeometry(47,1,32,200);
	const orbitMat2 = new THREE.MeshPhysicalMaterial( physic);
	orbitMesh2 = new THREE.Mesh(orbit2,orbitMat2);
	//orbitMesh2.add(new THREE.DirectionalLight( 0xffffff, 0.6));
	orbitMesh2.position.set(0,0,0)
	selects.push(orbitMesh2);
	conteiner2.add(orbitMesh2, inerMesh2);

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

	//POSS
	
	const renderScene = new RenderPass( scene, camera );

	bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
	bloomPass.threshold = params2.bloomThreshold;
	bloomPass.strength = params2.bloomStrength;
	bloomPass.radius = params2.bloomRadius;

	composer = new EffectComposer( renderer );
	composer.addPass( renderScene );
	composer.addPass( bloomPass );
	

	//composer = new EffectComposer( renderer );
			ssrPass = new SSRPass( {
				renderer,
				scene,
				camera,
				width: innerWidth,
				height: innerHeight,
				groundReflector: params.groundReflector ? groundReflector : null,
				selects: params.groundReflector ? selects : null
			} );

			composer.addPass( ssrPass );
			composer.addPass( new ShaderPass( GammaCorrectionShader ) );






	


	//addUI();

	animate();
}

function animate(){
	render();
	control.update();
	requestAnimationFrame(animate);
	
}

function render(){
	const time = performance.now() * 0.001;
	const timer = Date.now() * 0.0001;

	
	container1.rotation.x = timer * 7;
	container1.rotation.z = timer * 4;

	conteiner2.rotation.z = timer * 7;
	conteiner2.rotation.y = timer * 4;
	

	
	
	

	
	

	composer.render();
	//renderer.render(scene, camera);
}

/*
function addUI(){
	
	const gui = new GUI();
	

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
*/

