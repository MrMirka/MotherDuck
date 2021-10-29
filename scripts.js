import * as THREE from './build/three.module.js';
import { OrbitControls } from './js/OrbitControls.js';
import { RGBELoader } from './js/RGBELoader.js';
import { GLTFLoader } from './js/GLTFLoader.js';
import Stats from './js/stats.module.js';
import { GUI } from './js/dat.gui.module.js';
import { RectAreaLightHelper } from './js/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from './js/RectAreaLightUniformsLib.js';





import { FlakesTexture } from './js/FlakesTexture.js';



let scene, camera, renderer, control, duck;
let orbitMesh1, orbitMesh2;
let container1, conteiner2, conteiner3, conteiner4;
let sun;
let timer;

let mixer,bark;

let ring, ringDisk ;
let stats;
let fog;
let tex;
let isMobile = false;
let clock = new THREE.Clock();

let touchDelta = 1;
let isTouch = false;




//let gui = new GUI();
window.addEventListener('mousedown', barkOpen);
window.addEventListener('mouseup', barkClose);

window.addEventListener("touchend", barkClose, false);
window.addEventListener("touchstart", barkOpen, false);


init();

function init(){
	scene = new THREE.Scene();
	//fog = new THREE.Fog(0x000000,260,298);
	fog = new THREE.FogExp2(0x000000, 0.0011);
	scene.fog = fog;

	
	let gui = new GUI();
	/*
	gui.add(scene.fog, 'near',0,500,10);
	gui.add(scene.fog, 'far',0,500,10);
	*/
	

	container1 = new THREE.Object3D();
	conteiner2 = new THREE.Object3D();
	conteiner3 = new THREE.Object3D();
	conteiner4 = new THREE.Object3D();
	
	scene.add(container1, conteiner3, conteiner4);

	RectAreaLightUniformsLib.init();
	
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		//isMobile = true;
	}else{
		//addRec(0,0,0,0);
		//addRec(0,0,-80,Math.PI);
	//	addRec(0,-40,-40,Math.PI/2);
		//addRec(0,40,-40,-Math.PI/2);
	}
	
	conteiner3.rotation.set(0,-Math.PI/2,0);
	conteiner3.position.set(-40,0,0);
	container1.add(conteiner3);
	container1.position.y=20;

	
	
	
	//RING EMMITION
	const immerMat = new THREE.MeshStandardMaterial({emissive: 0x74DFE1, emissiveIntensity: 5.01, side: THREE.DoubleSide});	
	let ringEmGeo = new THREE.CylinderGeometry(58.67,58.67,4,165,2,true);
	ringDisk = new THREE.Mesh(ringEmGeo,immerMat);
	ringDisk.rotation.x = Math.PI/2;
	ringDisk.layers.enable(1);
	container1.add(ringDisk);

	

	

	camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1500 );
	camera.position.set( 115, 120, 180 );
	camera.lookAt(0,0,0);
	
	const container = document.getElementById( 'canvas' );


	renderer = new THREE.WebGLRenderer( { alpha:true, antialias: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.outputEncoding = THREE.GammaEncoding;
	//renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.gammaFactor = 1.7;
	//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 0.3;
	renderer.setSize( window.innerWidth, window.innerHeight );
	//document.body.appendChild( renderer.domElement );
	container.appendChild( renderer.domElement );

	control = new OrbitControls(camera, renderer.domElement);
	control.enableDamping = true;
	
	control.enablePan = false;
	control.enableZoom = false;
	control.minAzimuthAngle = -0.48642900576659637;
	control.maxAzimuthAngle = 0.9530985059023817;
	control.maxPolarAngle = 1.1936065021656286;
	control.minPolarAngle = 1.1936065021656286;
	
	
	control.update();


	//FAKE
	let ball = new THREE.SphereGeometry(22, 32,16);
	let mat = new THREE.MeshStandardMaterial({
		color: 0x1d1d1d,
		metalness: 1,
		roughness:0.2,
		envMapIntensity: 1
	});
	let mm = new THREE.Mesh(ball, mat);
	mm.position.set(0,20,0);
	//scene.add(mm);
	//=======


	
	let loader = new GLTFLoader();
	loader.load('motherduck_anim1k_2.glb', function(gltf) {
		duck = gltf.scene.children[0];
		duck.scale.set(1.3,1.3,1.3);
		duck.position.set(0,0,0);
		gltf.scene.traverse( function( node ) {
			if ( node.material ) {
				const hdri = new RGBELoader();
				hdri.load( './img/room2.hdr', function ( texture ) {
					tex = texture;
					tex.mapping = THREE.EquirectangularRefractionMapping;
					tex.wrapS = THREE.RepeatWrapping;
					tex.wrapP = THREE.RepeatWrapping;
					tex.format = THREE.RGBFormat;
					tex.repeat.set( 1, 1 );
					//tex.magFilter = THREE.NearestFilter;
					node.material.envMapIntensity = 2.2;
					node.material.envMap = tex;
					node.material.reflectivity = 0.4;
					node.material.projection = 'normal';
					node.material.transparent = false;
					node.material.normalScale= new THREE.Vector2(1, 1);
					node.material.roughness = 0.76;	
					
					renderer.render( scene, camera );
				});
			}
		});
		//ANIMATIONS
		const animations = gltf.animations;
		mixer = new THREE.AnimationMixer( gltf.scene );
		bark = mixer.clipAction(animations[0]);
		bark.enabled = true;
		bark.fadeIn = 1;
		bark.fadeOut = 0.2;
		//bark.setEffectiveTimeScale( 1 );
		//bark.play();

		//LIGTH
		sun = new THREE.DirectionalLight(0xffffff,15.2);
		sun.position.set(-38,50,19);
		sun.target = duck;
		scene.add(sun);
		
		conteiner4.add(container1);
		conteiner4.add(duck);
		conteiner4.position.set(0,-45,0);
	
		
	});

	//RING
	loader.load('ring3.glb', function(gltf){
		ring = gltf.scene.children[0];
		ring.scale.set(1,1,1);
		ring.position.set(0,0,0);

		if( !isMobile ) {

			let pot = new THREE.PointLight(0xffffff,17.2);
			let pot2 = new THREE.PointLight(0xffffff,7.2);
			pot.position.set(-44,-13,-9);
			pot2.position.set(21,50,16);
			ring.add(pot,pot2);

			
		}

		
		gltf.scene.traverse( function( node ) {
			if ( node.material ) {
				let texture = new THREE.CanvasTexture(new FlakesTexture());
				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;
				texture.repeat.x = 21;
				texture.repeat.y = 21;
				node.material.normalMap = texture;
				node.material.normalScale= new THREE.Vector2(0.5, 0.5);
				node.material.envMapIntensity = 0.6;
				node.material.reflectivity = 0;
				node.material.projection = 'normal';
				let roughness_map = new THREE.TextureLoader().load('./img/ring_dust.jpg');
				roughness_map.wrapS = THREE.RepeatWrapping;
				roughness_map.wrapT = THREE.RepeatWrapping;
				roughness_map.repeat.x = 1;
				roughness_map.repeat.y = 3;
				node.material.metalness = 0.3;
				node.material.roughness = 1;
				node.material.roughnessMap = roughness_map;
			}
			
		});
		//scene.add(ring);
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

	
	
	
	//stats = new Stats();
	//document.body.appendChild( stats.dom );



	animate();
}

function animate(){
	render();
	control.update();
	requestAnimationFrame(animate);
	
}

function render(){


	let mixerUpdateDelta = clock.getDelta();
	if(mixer!=undefined) {
	mixer.update( mixerUpdateDelta );
	}

	
	timer = Date.now() * 0.00003;
	
	//stats.update();

	//FORSE
	
	if(isTouch && touchDelta >= 1){
		touchDelta+=0.095;
		//console.log(touchDelta);
	}else if(!isTouch && touchDelta >1 ){
		touchDelta-=0.095;
		//touchDelta=1;
		//console.log(touchDelta);
	}else if(touchDelta<1){
		touchDelta=1;
		isTouch=false;
		//console.log(touchDelta);
	}
	//---------------

	/*
	container1.rotation.x = Math.sin(timer) * 1.5 * touchDelta + Math.PI*2;
	container1.rotation.y = Math.cos(timer) * 3.5 * touchDelta + Math.PI*2;
	container1.rotation.z += 0.0011;
	*/
	container1.rotation.x+=0.0002*(touchDelta*5);
	container1.rotation.y+=0.0004*(touchDelta*5);
	container1.rotation.z += 0.0011;
	
	if(sun!=undefined)
	sun.position.z = Math.sin(timer*6.1) / Math.PI + Math.cos(timer);
	

	renderer.render(scene, camera);
}



function addRec(x,y,z,r){
	const rectLight = new THREE.RectAreaLight( 0xffffff, 5, 7, 80 );
	rectLight.position.set(x, y, z );
	rectLight.rotation.set(r, 0,0 );
	//const rectLightHelper = new RectAreaLightHelper( rectLight );
	//rectLight.add( rectLightHelper );
	//scene.add( rectLight );
	
	conteiner3.add(rectLight);
	
	
	
}

function barkOpen(){
	if(bark!=undefined) {
		bark.timeScale = 1;
		bark.paused = false;
		bark.play();
		isTouch = true;
		
	}
}
function barkClose(){
	if(bark!=undefined){ 
		isTouch = false;
		//bark.reset();
		window.setTimeout(stopBark, 500);
		//bark.paused = true;
	}
}

function stopBark(){
	bark.timeScale = 0.4;
	bark.paused = true;
	
}





