"use strict";

const mouseEvents = (function() {

  return {
    onMouseDown: function(event, sceneThreeJs, raycaster, screenSize, drawingData) {
      const scene = sceneThreeJs.sceneGraph;
      const camera = sceneThreeJs.camera;
      if( event.button == 0 ) { // activation si la click gauche est enfoncé
        // Coordonnées du clic de souris
        const xPixel = event.offsetX;
        const yPixel = event.offsetY;

        const x =  2*xPixel/screenSize.w-1;
        const y = -2*yPixel/screenSize.h+1;

        if(drawingData.bodyMode) {
          utilsDrawing.addBody(raycaster, camera, x, y, drawingData, scene, true);
          drawingData.enableDrawing = true;
        }

        if(drawingData.finMode) {
          utilsDrawing.addFin(raycaster, camera, x, y, drawingData, scene, true);
          drawingData.enableDrawing = true;
        }

        if(drawingData.removeMode) {
          utilsDrawing.removeMesh(raycaster, sceneThreeJs, x, y, drawingData);
        }

        if(drawingData.tornadoMode) {
          utilsDrawing.addTornadoContour(raycaster, camera, x, y, drawingData, scene);
          drawingData.enableDrawing = true;
        }

        if(drawingData.addSharkMode) {
            utilsDrawing.placeShark(raycaster, x, y, drawingData, sceneThreeJs, true);
        }

      }
    },

    onMouseMove: function( event, sceneThreeJs, raycaster, screenSize, drawingData){
      // Coordonnées de la position de la souris
      const scene = sceneThreeJs.sceneGraph;
      const camera = sceneThreeJs.camera;
      const xPixel = event.offsetX;
      const yPixel = event.offsetY;

      const x =  2*xPixel/screenSize.w-1;
      const y = -2*yPixel/screenSize.h+1;


      if(drawingData.bodyMode) {
        if (drawingData.enableDrawing){
          utilsDrawing.addBody(raycaster, camera, x, y, drawingData, scene);
        }
      }

      if(drawingData.finMode) {
        if (drawingData.enableDrawing){
          utilsDrawing.addFin(raycaster, camera, x, y, drawingData, scene);
        }
      }

      if(drawingData.tornadoMode) {
        if (drawingData.enableDrawing){
          utilsDrawing.addTornadoContour(raycaster, camera, x, y, drawingData, scene);
        }
      }

      if(drawingData.addSharkMode){
        utilsDrawing.placeShark(raycaster, x, y, drawingData, sceneThreeJs, false);
      }
    },

    onMouseUp: function( event, sceneThreeJs, raycaster, screenSize, drawingData) {
      const xPixel = event.offsetX;
      const yPixel = event.offsetY;
      let scene = sceneThreeJs.sceneGraph;
      let camera = sceneThreeJs.camera;

      const x =  2*xPixel/screenSize.w-1;
      const y = -2*yPixel/screenSize.h+1;

      drawingData.enableDrawing = false;
      //actualisation de la position du plan de dessin si pas dans mode tornade
      if(!drawingData.tornadoMode && !drawingData.addSharkMode){
        utilsData.alignPlaneCamera(drawingData, camera, scene);
      }

      if(drawingData.bodyMode || drawingData.finMode) {
        const epaisseur = drawingData.epaisseur;

        utilsDrawing.addMesh(scene, drawingData.drawing3DPoints, camera, drawingData, epaisseur);

        // on agit symetriquement pour les nageoires
        if(drawingData.finMode) {
          utilsDrawing.addMesh(scene, drawingData.drawing3DPointsSym, camera, drawingData, epaisseur);
        }

        // on passe en mode nageoire apres le corps
        if(drawingData.bodyMode) {
          utilsData.enterMode(drawingData, sceneThreeJs, "finMode");
        }
      }

      if(drawingData.tornadoMode){
        utilsDrawing.addTornado(drawingData, sceneThreeJs);
      }

      // on enlève les traits de construction
      utilsData.removeLines(drawingData, scene);
      drawingData.drawing3DPoints = [];
      drawingData.drawing3DPointsSym = [];
    },
  };
})();
