import * as THREE from './build/three.module.js';
import { OrbitControls } from './js/OrbitControls.js';
import { RGBELoader } from './js/RGBELoader.js';
import { GLTFLoader } from './js/GLTFLoader.js';
import Stats from './js/stats.module.js';
import { GUI } from './js/dat.gui.module.js';
import { RectAreaLightHelper } from './js/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from './js/RectAreaLightUniformsLib.js';
import { FlakesTexture } from './js/FlakesTexture.js';
import { EffectComposer } from './js/postprocessing/EffectComposer.js';
import { RenderPass } from './js/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './js/postprocessing/UnrealBloomPass.js';



let scene, camera, renderer, control, duck;
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
let composer; 

const params = {
	exposure: 0.8,
	bloomStrength: 1.3,
	bloomThreshold: 0,
	bloomRadius: 0.65
};



window.addEventListener('mousedown', barkOpen);
window.addEventListener('mouseup', barkClose);

window.addEventListener("touchend", barkClose, false);
window.addEventListener("touchstart", barkOpen, false);



console.log('vertion 0.9.1');


init();


function init(){
	scene = new THREE.Scene();
	fog = new THREE.Fog(0x000000,235,325);
	scene.fog = fog;
	
	
	container1 = new THREE.Object3D();
	conteiner2 = new THREE.Object3D();
	conteiner3 = new THREE.Object3D();
	conteiner4 = new THREE.Object3D();
	scene.add(container1, conteiner3, conteiner4,conteiner2);


	RectAreaLightUniformsLib.init(); //Rectangle area ligth init

	
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		isMobile = true;
	}else{
		addRec(0,0,0,0);
		addRec(0,0,-80,Math.PI);
		addRec(0,-40,-40,Math.PI/2);
		addRec(0,40,-40,-Math.PI/2);
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


	//COMPOSER
	const renderScene = new RenderPass( scene, camera );

	const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
	bloomPass.threshold = params.bloomThreshold;
	bloomPass.strength = params.bloomStrength;
	bloomPass.radius = params.bloomRadius;

	composer = new EffectComposer( renderer );
	composer.addPass( renderScene );
	composer.addPass( bloomPass );

	/*
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
	*/			



	
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
					node.material.envMapIntensity = 2.2;
					node.material.envMap = tex;
					node.material.reflectivity = 0.4;
					node.material.projection = 'normal';
					node.material.transparent = false;
					node.material.normalScale= new THREE.Vector2(1, 1);
					node.material.roughness = 0.8;	
					
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
		if( isMobile ) {
			let hSize = 5;

			let pot = new THREE.PointLight(0xffffff,17.2);
			let pot2 = new THREE.PointLight(0xffffff,7.2);

			let pHelper = new THREE.PointLightHelper(pot,hSize);
			let pHelper2 = new THREE.PointLightHelper(pot2,hSize);
			//scene.add(pHelper, pHelper2);

			/*OLD 
			pot.position.set(-44,-13,-9);
			pot2.position.set(21,50,16);
			*/

			pot.position.set(-47,-33,-9);
			pot2.position.set(47,0,0);

			conteiner2.add(pot, pot2);
			//ring.add(pot,pot2);
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
		touchDelta+=8.535;
		if(touchDelta>27) touchDelta=27;
	}else if(!isTouch && touchDelta >1 ){
		touchDelta-=0.535;
	}else if(touchDelta<1){
		touchDelta=1;
		isTouch=false;
	}


	container1.rotation.x+=0.0002*(CubicInOut(0,touchDelta,1,0.5)*15);
	container1.rotation.y+=0.0004*(CubicInOut(0,touchDelta,1,0.5)*15);
	container1.rotation.z += 0.0011;

	if(isMobile){
		conteiner2.rotation.x = Math.sin(timer) * 8.5  + Math.PI*2;
		conteiner2.rotation.y = Math.cos(timer) * 13.5  + Math.PI*2;
		conteiner2.rotation.z += 0.0011;
	}

	
	if(duck != undefined){
		duck.position.x = Math.cos(timer*50.01);
		duck.position.y = Math.sin(timer*50.01);
		duck.position.x = Math.sin(timer*20.01);

		duck.rotation.z = Math.sin(timer * 100.06) * .008 + Math.PI*1.999;
		duck.rotation.x = Math.sin(timer * 100.06) * .008 + Math.PI*1.999;
	}
	
	
	camera.updateProjectionMatrix();


	if(sun!=undefined)
	sun.position.z = Math.sin(timer*6.1) / Math.PI + Math.cos(timer);
	
	composer.render();
	//renderer.render(scene, camera);
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
	isTouch = true;
	if(bark!=undefined && !bark.isRunning()) {
		bark.play();
		//bark.timeScale = 1;
	//	bark.paused = false;
		
		//isTouch = true;
		bark.reset();
		bark.loop = THREE.LoopRepeat;
	}
}


function barkClose(){
	if(bark!=undefined){ 
		isTouch = false;
		//bark.loop = THREE.LoopOnce;
		window.setTimeout(stopBark, 500);
		
	}
}


function stopBark(){
	//bark.timeScale = 0.4;
	//bark.paused = true;
	bark.loop = THREE.LoopOnce;	
}


function CubicInOut(t, b, c, d){
	if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
	return c / 2 * ((t -= 2) * t * t + 2) + b;
}





