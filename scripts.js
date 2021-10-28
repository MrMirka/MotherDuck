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



let ring, ringDisk ;
let stats;
let fog;
let tex;

//let gui = new GUI();
init();

function init(){
	scene = new THREE.Scene();
	fog = new THREE.Fog(0x000000,300,700);
	//scene.fog = fog;
	

	container1 = new THREE.Object3D();
	conteiner2 = new THREE.Object3D();
	conteiner3 = new THREE.Object3D();
	
	scene.add(container1, conteiner3);

	RectAreaLightUniformsLib.init();
	
	addRec(0,0,0,0);
	//addRec(0,0,-80,Math.PI);
	//addRec(0,-40,-40,Math.PI/2);
	//addRec(0,40,-40,-Math.PI/2);
	
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
	camera.position.set( 115, 120, 250 );
	camera.lookAt(0,0,0);
	
	const container = document.getElementById( 'canvas' );


	renderer = new THREE.WebGLRenderer( { alpha:true, antialias: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	//renderer.outputEncoding = THREE.sRGBEncoding;
	//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 0.6;
	renderer.setSize( window.innerWidth, window.innerHeight );
	//document.body.appendChild( renderer.domElement );
	container.appendChild( renderer.domElement );

	//control = new OrbitControls(camera, renderer.domElement);
	//control.update();


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
	loader.load('motherduck3.glb', function(gltf) {
		duck = gltf.scene.children[0];
		duck.scale.set(1.3,1.3,1.3);
		duck.position.set(0,0,0);
		gltf.scene.traverse( function( node ) {
			if ( node.material ) {

						const hdri = new RGBELoader();
				hdri.load( './img/ballroom_1k.hdr', function ( texture ) {
					tex = texture;
					tex.mapping = THREE.EquirectangularRefractionMapping;
					tex.wrapS = THREE.RepeatWrapping;
					tex.wrapP = THREE.RepeatWrapping;
					tex.repeat.set( 1, 1 );
					tex.magFilter = THREE.NearestFilter;
					//scene.environment = tex;
						node.material.envMapIntensity = 1;
						node.material.envMap = tex;
						node.material.reflectivity = 1;
						node.material.projection = 'normal';
						node.material.transparent = false;
						node.material.normalScale= new THREE.Vector2(1, 1);
						node.material.roughness = 0.7;	
					renderer.render( scene, camera );
				});

				
			}
		});
		//LIGTH
		sun = new THREE.DirectionalLight(0xffffff,15.2);
		sun.position.set(-60,70,15);
		sun.target = duck;
		scene.add(sun);
		/*
		gui.add(sun.position, 'x', -500,500,15);
		gui.add(sun.position, 'y', -500,500,15);
		gui.add(sun.position, 'z', -500,500,15);
		gui.add(sun, 'intensity', 0,30,0.1);

		gui.add(fog, 'near', 0, 700, 10);
		gui.add(fog, 'far', 0, 700, 10);


		gui.add(camera.position, 'x', -500,500,0.4);
		gui.add(camera.position, 'y', -500,500,0.4);
		gui.add(camera.position, 'z', -500,500,0.4);
		*/
		

		scene.add(duck);
		/*
		const hdri = new RGBELoader();
		hdri.load( './img/ballroom_1k.hdr', function ( texture ) {
			tex = texture;
			tex.mapping = THREE.EquirectangularRefractionMapping;
			tex.wrapS = THREE.RepeatWrapping;
			tex.wrapP = THREE.RepeatWrapping;
			tex.repeat.set( 1, 1 );
			tex.magFilter = THREE.NearestFilter;
			scene.environment = tex;
			renderer.render( scene, camera );
		});
		*/
		
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
				node.material.normalScale= new THREE.Vector2(0.5, 0.5);
				node.material.envMapIntensity = 0.6;
				node.material.reflectivity = 0;
				node.material.projection = 'normal';
				let roughness_map = new THREE.TextureLoader().load('./img/ring_dust.jpg');
				roughness_map.wrapS = THREE.RepeatWrapping;
				roughness_map.wrapT = THREE.RepeatWrapping;
				roughness_map.repeat.x = 1;
				roughness_map.repeat.y = 3;
				node.material.metalness = 0.5;
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

	
	
	
	stats = new Stats();
	document.body.appendChild( stats.dom );



	animate();
}

function animate(){
	render();
	//control.update();
	requestAnimationFrame(animate);
	
}

function render(){
	
	timer = Date.now() * 0.00007;
	stats.update();

	if (sun != undefined) {
		sun.position.x = Math.sin(timer*10)*100;
		sun.position.z = Math.cos(timer*10)*100;
	}
	
	container1.rotation.x = Math.sin(timer) * 1.5 + Math.PI*2;
	container1.rotation.y = Math.sin(timer) * 2.5 + Math.PI*2;
	container1.rotation.z += 0.0013;

	renderer.render(scene, camera);
}



function addRec(x,y,z,r){
	const rectLight = new THREE.RectAreaLight( 0xffffff, 0.8, 2, 80 );
	//rectLight.power = 2000;
	rectLight.position.set(x, y, z );
	rectLight.rotation.set(r, 0,0 );
	//const rectLightHelper = new RectAreaLightHelper( rectLight );
	//rectLight.add( rectLightHelper );
	//scene.add( rectLight );
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		console.log('isMobile');
		//conteiner3.add(rectLight);

	}else{
		console.log('isDesctop');
		//conteiner3.add(rectLight);
	}
	
	
}





