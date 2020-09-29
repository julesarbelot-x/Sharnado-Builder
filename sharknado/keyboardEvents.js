"use strict";

const keyboardEvents = (function() {
  return {
    onKeyDown: function(event, sceneThreeJs, screenSize, drawingData) {
      const deplacement = 1;
      const camera = sceneThreeJs.camera;
      const direction = camera.getWorldDirection();

      if(event.code == "KeyW"){
        drawingData.plane.position.add(direction);
      }
      if(event.code == "KeyB"){
        utilsData.enterMode(drawingData, sceneThreeJs, "bodyMode");
      }
      if(event.code == "KeyP"){
        utilsData.reinitPlane(drawingData, sceneThreeJs);
      }
      // mettre en pause l'animation
      if(event.code == "Space"){
        sceneThreeJs.animateBool = !sceneThreeJs.animateBool;
      }
      if(event.code == "KeyS"){
        drawingData.plane.position.add(direction.multiplyScalar(-1));
      }
      if(event.code == "KeyR"){
        utilsData.enterMode(drawingData, sceneThreeJs, "removeMode");
      }
      if(event.code == "KeyF"){
        utilsData.enterMode(drawingData, sceneThreeJs, "finMode");
      }
      if(event.code == "KeyT"){
        utilsData.enterMode(drawingData, sceneThreeJs, "tornadoMode");
        console.log(drawingData.tornadoMode);
      }
      if(event.code == "KeyA"){
        utilsData.enterMode(drawingData, sceneThreeJs, "addSharkMode");
      }
      if(event.code == "KeyG"){
        if(!drawingData.tornadoMode){
          utilsData.saveOBJ(sceneThreeJs, drawingData.body);
        }
        else{
          utilsData.saveOBJ(sceneThreeJs, sceneThreeJs.tornado);
        }
      }
    },
  };
})();
