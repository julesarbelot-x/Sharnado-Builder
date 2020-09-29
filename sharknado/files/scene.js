"use strict";

main();

function main(){

  const sceneThreeJs = {
    sceneGraph: null,
    camera: null,
    renderer: null,
    controls: null,
    tornado: null,
    animateBool: false,
    exporter: null,
  };

  // Données pour le dessin
  // contient le mode actuel : body, fin, jaw...
  const drawingData = {
    plane: null,
    currentShape: null,
    currentShapeSym: null,
    enableDrawing: false,
    drawing3DPoints:[],
    drawingTornado: [],
    drawing3DPointsSym:[],
    body:null,
    lineTab:[],
    finMode:false,
    bodyMode:true,
    tornadoMode:false,
    removeMode:false,
    addSharkMode:false,
    epaisseur:5,
    // contient les requins complets dessines
    tornado: null,
    currentShark: null,
    particles: new THREE.Group(),
  };

  initEmptyScene(sceneThreeJs);
  //initSkyBox(sceneThreeJs.sceneGraph);
  init3DObjects(sceneThreeJs.camera,sceneThreeJs.sceneGraph, drawingData);

  const screenSize = {
    w:sceneThreeJs.renderer.domElement.clientWidth,
    h:sceneThreeJs.renderer.domElement.clientHeight
  };

  const raycaster = new THREE.Raycaster();

  var exporterDecl = new THREE.OBJExporter();
  sceneThreeJs.exporter = exporterDecl;
  ///////////// Mouse Events ////////////////////////////////////////////////////////////
  const wrapperMouseDown = function(event) { mouseEvents.onMouseDown(event, sceneThreeJs, raycaster, screenSize, drawingData); };
  document.addEventListener( 'mousedown', wrapperMouseDown );

  const wrapperMouseMove = function(event) { mouseEvents.onMouseMove(event, sceneThreeJs, raycaster, screenSize, drawingData) };
  document.addEventListener( 'mousemove', wrapperMouseMove );

  const wrapperMouseUp = function(event) { mouseEvents.onMouseUp(event, sceneThreeJs, raycaster, screenSize, drawingData); };
  document.addEventListener( 'mouseup', wrapperMouseUp );

  ///////////// Keyboard Events ////////////////////////////////////////////////////////////

  const wrapperKeyDown = function(event) { keyboardEvents.onKeyDown(event, sceneThreeJs, screenSize, drawingData) };
  document.addEventListener( 'keydown', wrapperKeyDown );

  animationLoop(sceneThreeJs);
}


function init3DObjects(camera,sceneGraph, drawingData) {

  const planeGeometry = primitive.Quadrangle(new THREE.Vector3(-200,-100,0),new THREE.Vector3(-200,100,0),new THREE.Vector3(200,100,0),new THREE.Vector3(200,-100,0));
  const materialGround = new THREE.MeshPhongMaterial({ color: 0xC0C0C0, side: THREE.DoubleSide, opacity: 0.2, transparent:true,});

  const plane = new THREE.Mesh(planeGeometry,materialGround);

  plane.name="plane";
  drawingData.plane = plane;
  sceneGraph.add(plane);
  drawingData.currentShape = new THREE.Shape();
}

function initSkyBox (sceneGraph) {
  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load( 'hw_nightsky/nightsky_rt.tga');
  let texture_bk = new THREE.TextureLoader().load('hw_nightsky/nightsky_up.tga');
  let texture_up = new THREE.TextureLoader().load( 'hw_nightsky/nightsky_lf.tga');
  let texture_dn = new THREE.TextureLoader().load( 'hw_nightsky/nightsky_dn.tga');
  let texture_rt = new THREE.TextureLoader().load( 'hw_nightsky/nightsky_ft.tga');
  let texture_lf = new THREE.TextureLoader().load( 'hw_nightsky/nightsky_bk.tga');

  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));

  for (let i = 0; i < 6; i++)
    materialArray[i].side = THREE.BackSide;

  let skyboxGeo = new THREE.BoxGeometry( 10000, 10000, 10000);
  let skybox = new THREE.Mesh( skyboxGeo, materialArray );
  skybox.name = "skybox";
  console.log(skybox);
  sceneGraph.add(skybox);
}

function initEmptyScene(sceneThreeJs, affichageElement) {
  sceneThreeJs.sceneGraph = new THREE.Scene();
  sceneThreeJs.sceneGraph.background = new THREE.Color(0xB0E0E6);

  sceneThreeJs.camera = sceneInit.createCamera(0.47,0.68,138)
  sceneInit.insertAmbientLight(sceneThreeJs.sceneGraph);
  const spotLight1 = sceneInit.insertLight(sceneThreeJs.sceneGraph,sceneThreeJs.camera.position);
  spotLight1.name = "spotLight1";

  const spotLight2 = sceneInit.insertLight(sceneThreeJs.sceneGraph,new THREE.Vector3(3+sceneThreeJs.camera.position.x, 100+sceneThreeJs.camera.position.y, sceneThreeJs.camera.position.z));
  spotLight2.name = "spotLight2";

  const spotLight3 = sceneInit.insertLight(sceneThreeJs.sceneGraph,new THREE.Vector3(0, 0, -40));
  spotLight2.name = "spotLight3";

  sceneThreeJs.renderer = sceneInit.createRenderer();
  sceneInit.insertRenderInHtml(sceneThreeJs.renderer.domElement);

  sceneThreeJs.controls = new THREE.OrbitControls( sceneThreeJs.camera, sceneThreeJs.renderer.domElement );
  sceneThreeJs.sceneGraph.autoUpdate = true;
  //sceneThreeJs.controls.addEventListener( 'change', function(event){light_update2(sceneThreeJs.camera,spotLight2);},true);

  window.addEventListener('resize', function(event){onResize(sceneThreeJs);}, true);
}

function onResize(sceneThreeJs) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  sceneThreeJs.camera.aspect = width / height;
  sceneThreeJs.camera.updateProjectionMatrix();

  sceneThreeJs.renderer.setSize(width, height);
}

function render( sceneThreeJs ) {
  sceneThreeJs.renderer.render(sceneThreeJs.sceneGraph, sceneThreeJs.camera);
}

function animate(sceneThreeJs, time) {
  const t = time/1000;//time in second
  const alpha = 3;
  if(sceneThreeJs.tornado != null && sceneThreeJs.animateBool){
    const quaternionTornado = new THREE.Quaternion(0, Math.sin(alpha * t/2), 0, Math.cos(alpha * t/2));
    sceneThreeJs.tornado.quaternion.copy(quaternionTornado);

  }
  render(sceneThreeJs);
}

// Fonction de gestion d'animation
function animationLoop(sceneThreeJs) {
  // Fonction JavaScript de demande d'image courante à afficher
  requestAnimationFrame(

    // La fonction (dite de callback) recoit en paramètre le temps courant
    function(timeStamp){

      animate(sceneThreeJs,timeStamp); // appel de notre fonction d'animation

      animationLoop(sceneThreeJs); // relance une nouvelle demande de mise à jour


    }

  );

}
