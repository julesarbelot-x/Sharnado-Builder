"use strict";

const utilsDrawing = (function() {

  return {
    addBody: function(raycaster, camera, xPosition, yPosition, drawingData, scene) {
      raycaster.setFromCamera(new THREE.Vector2(xPosition,yPosition),camera);
      const epaisseur = drawingData.epaisseur;
      const intersects = raycaster.intersectObject( drawingData.plane, true );

      const intersection = intersects[0];

      drawingData.drawing3DPoints.push(intersection.point.clone());

      utilsData.addLine(drawingData, scene);
    },

    addFin: function(raycaster, camera, xPosition, yPosition, drawingData, scene) {
      // ajout d'une nageoire : on l'ajoute toujours sur le plan de dessin
      raycaster.setFromCamera(new THREE.Vector2(xPosition,yPosition),camera);
      const epaisseur = drawingData.epaisseur;
      // on ne s'interesse qu'a l'intersection avec le plan
      const intersects = raycaster.intersectObject( drawingData.plane, true );

      const nbrIntersection = intersects.length;

      var intersection = intersects[0];

      drawingData.drawing3DPoints.push(intersection.point.clone());

      // on met egalement le symetrique par rapport au corps de ce point car c'est une nageoire
      const pointSym = new THREE.Vector3(intersection.point.x, intersection.point.y, - intersection.point.z);
      drawingData.drawing3DPointsSym.push(pointSym.clone());

      utilsData.addLine(drawingData, scene);
    },

    // juste le contour a plat
    addTornadoContour: function(raycaster, camera, xPosition ,yPosition, drawingData, scene){
      raycaster.setFromCamera(new THREE.Vector2(xPosition,yPosition),camera);
      const t = drawingData.drawing3DPoints.length;
      const intersects = raycaster.intersectObject( drawingData.plane, true );

      const intersection = intersects[0];
      const point = intersection.point.clone();
      point.y += Math.pow(t, 6/8);
      drawingData.drawing3DPoints.push(point.clone());

      // on veut mettre la tornade dans le plan xOy
      // on est obliges de faire tourner le point plutot que la tornade a la fin de la construction
      // sinon le raycaster ne se met pas a jour... je n'ai pas trouve d'autre solution.
      // const quaternionTornado = new THREE.Quaternion(-Math.sqrt(2) / 2, 0, 0, Math.sqrt(2) / 2);
      drawingData.drawingTornado.push(point);

      // trace de la tornade
      utilsData.addLine(drawingData, scene);

      // nuage de particules
      for (var i=0; i<5; i++) {
        var particlex = (Math.random() - 1/2) * 20;
        var particley = (Math.random() - 1/2) * 20;
        var particlez = (Math.random() - 1/2) * 20;
        var particleGeometry = new THREE.SphereGeometry(.6);
        var particleMaterial = new THREE.MeshPhongMaterial( {color: 0x494949, opacity:0.3, transparent:true});
        var particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(point.x+particlex, point.y+particley, point.z+particlez);
        drawingData.particles.add(particle);
      }
    },

    addTornado: function(drawingData, sceneThreeJs){
      // methode : la curve est la courbe du tube
      const curve = new THREE.CatmullRomCurve3(drawingData.drawingTornado);

      let tubeGeometry = new THREE.TubeGeometry(curve, 64, 4);
      let tubeMaterial = new THREE.MeshPhongMaterial( { color: 0xbdc7c4, opacity:0.3, transparent:true } );
      let tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      tube.name = "tornado";
      tube.position.set(0,0,0);
      sceneThreeJs.tornado = tube;
      sceneThreeJs.sceneGraph.add(sceneThreeJs.tornado);
      sceneThreeJs.tornado.add(drawingData.particles);
      drawingData.particles = new THREE.Group();
      drawingData.drawing3DPoints = [];
      drawingData.drawingTornado = [];
      // sceneThreeJs.tornado.scale.set(7/4, 7/4, 7/4);
      // sceneThreeJs.tornado.position.set(0,0,0);

    },

    // place le requin sur la tornade : bouge si down = false, le place definitivement si down = true
    placeShark:function(raycaster, xPosition ,yPosition, drawingData, sceneThreeJs, down){
      const camera = sceneThreeJs.camera;
      raycaster.setFromCamera(new THREE.Vector2(xPosition,yPosition),camera);

      // on ne s'interesse qu'a l'intersection avec la tornade
      const intersects = raycaster.intersectObject( sceneThreeJs.tornado );

      let intersection = intersects[0];
      let point = intersection.point.clone();
      utilsData.orientShark(drawingData, point, sceneThreeJs);
      drawingData.currentShark.position.set(point.x, point.y, point.z);

      if(down){
        sceneThreeJs.tornado.add(drawingData.currentShark.clone());
      }
    },

    removeMesh: function(raycaster, sceneThreeJs, xPosition ,yPosition, drawingData){
      const camera = sceneThreeJs.camera;
      const scene = sceneThreeJs.sceneGraph;
      raycaster.setFromCamera(new THREE.Vector2(xPosition,yPosition),camera);

      // intersect recursif sur tous les enfants de scene
      const intersects = raycaster.intersectObjects( scene.children, true );

      const nbrIntersection = intersects.length;
      for(var k = 0; k<nbrIntersection; k++) {
        let intersection = intersects[k];
        // on ne doit pas remove le plan de dessin !
        if(intersection.object.name != "plane"){
          intersection.object.parent.remove(intersection.object);
          intersection.object.geometry.dispose();
          intersection.object.material.dispose();
          if(intersection.object.name == "body"){
            drawingData.body = null;
          }
          if(intersection.object.name == "tornado"){
            sceneThreeJs.tornado = null;
          }
        }
      }
    },

    // shapePoints : points de la forme a extruder
    addMesh: function(scene, shapePoints, camera, drawingData, epaisseur) {
      // precision de l'echantillonnage
      const division = 70;

      // on choisit 3 points de la shape
      // p0 = origine du repere local

      const p0 = shapePoints[0].clone();
      const p1 = shapePoints[Math.floor(shapePoints.length /3)].clone();
      const p2 = shapePoints[Math.floor(2 * shapePoints.length /3)].clone();

      // un vecteur du plan
      const u1 = new THREE.Vector3(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z);
      u1.normalize();
      // un autre vecteur du plan
      const v = new THREE.Vector3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);

      // vecteur orthogonal au plan
      const n = new THREE.Vector3(0,0,0);
      n.crossVectors(u1, v);
      n.normalize();

      // dernier vecteur de la base
      const u2= new THREE.Vector3(0,0,0);
      u2.crossVectors(n, u1);
      u2.normalize();

      const M = new THREE.Matrix3();
      M.set(u1.x, u1.y, u1.z,
            u2.x, u2.y, u2.z,
            n.x, n.y,n.z)

      const tab = []
      for (let v = 0; v < shapePoints.length; v++){
        var currentPoint = shapePoints[v].clone().sub(p0).applyMatrix3(M);
        tab.push(currentPoint)
      }

      // on echantillonne avec une spline 3D pour avoir un rendu plus smooth de la mesh
      const tabSpline = new THREE.CatmullRomCurve3(tab);
      const tabSampled = tabSpline.getPoints(division);

      drawingData.currentShape = new THREE.Shape(tabSampled);
      var extrudeSettings = {
         bevelEnabled:true, amount: epaisseur, bevelSegments:10, bevelSize:1, bevelThickness:1,
      };

      var geometry = new THREE.ExtrudeGeometry( drawingData.currentShape, extrudeSettings );

      const M1 = new THREE.Matrix3().getInverse(M)

      // on ajoute un vecteur selon z pour toujours avoir le plan de dessin comme plan transversal
      const trans = new THREE.Vector3(0,0,-epaisseur/2);

      for (let g = 0; g < geometry.vertices.length; g++){
        geometry.vertices[g].add(trans).applyMatrix3(M1).add(p0)
      }

      var material = new THREE.MeshPhongMaterial( { color: 0x808080 } );
      var mesh = new THREE.Mesh( geometry, material ) ;

      // update de la scene
      // si nageoire : alors child du corps
      if(drawingData.finMode){
        mesh.name = "fin";
        drawingData.body.add(mesh);
      }
      else if(drawingData.bodyMode){
        mesh.name = "body";
        drawingData.body = mesh;
        scene.add( mesh );
      }

      // reinitalisation et effacage des traits de construction
      drawingData.currentShape = new THREE.Shape();
      drawingData.drawing3DPoints = [];
    },

  };
})();
