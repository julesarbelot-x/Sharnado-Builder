const utilsData = (function() {
  return {
    enterMode: function(drawingData, sceneThreeJs, mode){
      const camera = sceneThreeJs.camera;
      let scene = sceneThreeJs.sceneGraph;
      switch(mode){
        case "removeMode":
          drawingData.removeMode = true;
          drawingData.finMode = false;
          drawingData.bodyMode = false;
          drawingData.tornadoMode = false;
          drawingData.addSharkMode = false;
          document.getElementById("AffichageMode").innerHTML = "Clique sur un objet pour l'effacer";
        break;
        case "finMode":
          drawingData.removeMode = false;
          drawingData.finMode = true;
          drawingData.bodyMode = false;
          drawingData.tornadoMode = false;
          drawingData.addSharkMode = false;
          document.getElementById("AffichageMode").innerHTML = "Dessine la forme d'une nageoire";
        break;
        case "bodyMode":
          drawingData.removeMode = false;
          drawingData.finMode = false;
          drawingData.bodyMode = true;
          drawingData.tornadoMode = false;
          drawingData.addSharkMode = false;
          document.getElementById("AffichageMode").innerHTML = "Dessine le corps du requin";
          utilsData.reinitPlane(drawingData, camera, scene);
        break;
        case "tornadoMode":
          // on va dessiner la tornade
          if(!drawingData.tornadoMode && !drawingData.addSharkMode){
            drawingData.removeMode = false;
            drawingData.finMode = false;
            drawingData.bodyMode = false;
            drawingData.tornadoMode = true;
            drawingData.addSharkMode = false;
            document.getElementById("AffichageMode").innerHTML = "Dessine la forme de la tornade";
            // sauvegarde du requin
            utilsData.reinitPlaneTornado(drawingData, sceneThreeJs);
            // reinitialisation a la scene vide
            scene.remove(drawingData.body);

            // on avait deja une tornade
            if(sceneThreeJs.tornado != null){
              scene.add(sceneThreeJs.tornado);
            }
            // sauvegarde du requin dessine
            drawingData.currentShark = drawingData.body;
            drawingData.body = null;
            if(drawingData.currentShark != null) {
              drawingData.currentShark.scale.set(1/6, 1/6, 1/6);
            }

            return;
          }
          // on dessine un nouveau requin
          if(drawingData.tornadoMode || drawingData.addSharkMode){
            drawingData.removeMode = false;
            drawingData.finMode = false;
            drawingData.bodyMode = true;
            drawingData.tornadoMode = false;
            drawingData.addSharkMode = false;
            document.getElementById("AffichageMode").innerHTML = "Dessine un nouveau requin";
            // reinitialisation a la scene vide
            scene.add(drawingData.plane);
            utilsData.reinitPlane(drawingData, sceneThreeJs);
            scene.remove(sceneThreeJs.tornado);
            if(drawingData.currentShark != null) {
              drawingData.currentShark.geometry.dispose();
              drawingData.currentShark.material.dispose();
              drawingData.currentShark = null;
            }
          }
        break;
        case "addSharkMode":
          drawingData.removeMode = false;
          drawingData.finMode = false;
          drawingData.bodyMode = false;
          drawingData.tornadoMode = false;
          drawingData.addSharkMode = true;
          document.getElementById("AffichageMode").innerHTML = "Place ton requin dans la tornade";

          sceneThreeJs.tornado.add(drawingData.currentShark);
        break;
      }
    },

    removeLines: function(drawingData, scene) {
      const lineTab = drawingData.lineTab;
      for(let i = 0; i < lineTab.length; i++){
        scene.remove(lineTab[i]);
      }
      drawingData.lineTab = [];
    },

    alignPlaneCamera: function(drawingData, camera, scene) {
      drawingData.plane.quaternion.copy(camera.quaternion);
    },

    // remet le plan de dessin a sa position initiale
    reinitPlane: function(drawingData, sceneThreeJs) {
      identityQPlane = new THREE.Quaternion(0,0,0,1);
      drawingData.plane.quaternion.copy(identityQPlane);
      sceneThreeJs.controls.reset();
      drawingData.plane.position.set(0,0,0);
      drawingData.plane.updateMatrix();
    },

    // met le plan de dessin selon xOz pour dessiner la tornade
    reinitPlaneTornado: function(drawingData, sceneThreeJs) {
      sceneThreeJs.camera.position.set(0, 100, 0);
      sceneThreeJs.camera.lookAt(new THREE.Vector3(0,0,0));
      const quaternionTornado = new THREE.Quaternion(-Math.sqrt(2) / 2, 0, 0, Math.sqrt(2) / 2);
      drawingData.plane.quaternion.copy(quaternionTornado);
    },

    addLine: function(drawingData, scene){
      const lineGeometry = new THREE.Geometry();
      lineGeometry.vertices = drawingData.drawing3DPoints;
      const lineMaterial = new THREE.LineBasicMaterial( { color: 0xff00ff } );
      drawingData.line = new THREE.Line( lineGeometry, lineMaterial );
      drawingData.lineTab.push(drawingData.line);
      drawingData.line.is_ob = true;
      scene.add(drawingData.line);
    },

    // on oriente le requin "currentShark" joliment par rapport a la tornade
    orientShark: function(drawingData, point, sceneThreeJs) {
      // barycentre des points ?
      const point0 = sceneThreeJs.tornado.geometry.vertices[0];
      const x = point.x - point0.x;
      const z = point.z - point0.z;
      //calcul de l'angle de rotation
      const angle = Math.atan2(z,x);
      // on calcule la bonne rotation
      const quaternionShark = new THREE.Quaternion(0,Math.sin(-angle/2), 0 , Math.cos(angle/2));
      drawingData.currentShark.quaternion.copy(quaternionShark);
    },

    // permet de DL un fichier, en l'occurrence un .obj
    download: function(filename, text) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },

    // convertit le requin actuel en .obj
    saveOBJ: function(sceneThreeJs, object) {
      console.log(object);
      var result = sceneThreeJs.exporter.parse(object);
      utilsData.download("shark.OBJ", result);
      console.log(result);
    },
  };
})();
