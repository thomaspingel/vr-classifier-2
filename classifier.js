AFRAME.registerComponent("classify", {
  schema: {
    sphere: { type: "string" }, // id of the sphere object placed in the scene in index.html
  },
  dependencies: ["raycaster"],
  init: function () {
    if (this.data.hand == "r") {
      //console.log('should emit');
      this.h = 1;
    } else {
      this.h = 0;
    }

    if (this.paint == null) {
      console.log("setting this.paint to false");
      this.paint = false;
    }
    this.el.addEventListener("triggerdown", this.TriggerDown);
    this.el.addEventListener("triggerup", this.TriggerUp);
    
    

    //this.el.addEventListener("click", this.undo);

    document.querySelector('#lefthand').addEventListener("triggerdown", this.transformTrue);
    document.querySelector('#lefthand').addEventListener("triggerup", this.transformFalse);
    document.querySelector('#righthand').addEventListener("gripdown", this.transformTrue);
    document.querySelector('#righthand').addEventListener("gripup", this.transformFalse);
    

    document.querySelector('#lefthand').addEventListener("xbuttondown", this.undo);
    document.querySelector('#lefthand').addEventListener("ybuttondown", this.redo);

    this.el.addEventListener("thumbstickmoved", this.logThumbstick);
    document.querySelector('#lefthand').addEventListener("thumbstickmoved", this.fly);
    //document.querySelector('#lefthand').addEventListener("triggerdown", this.fly);
  },
  TriggerUp: function (evt) {
    evt.srcElement.components.classify.paint = false;
    console.log("trigger up");
  },
  TriggerDown: function (evt) {
    evt.srcElement.components.classify.paint = true;
    console.log("trigger down");
    document.querySelector("#pointcloud").emit("strokeStart");
  },
  
  /**
  * When grip button pressed, enable rotating/moving/stretching
  */
  transformTrue: function (evt) {
    console.log("grip pressed");
    document
      .querySelector("#pointcloud").components.lasloader.origRot.setFromEuler(document.querySelector("#pointcloud").object3D.rotation).normalize();
    document
      .querySelector("#pointcloud")
      .setAttribute("lasloader", "transform", true);
  },
  /**
  * When grip button released, disable rotating/moving/stretching
  */
  transformFalse: function (evt) {
    document
      .querySelector("#pointcloud")
      .setAttribute("lasloader", "transform", false);
  },
  undo: function (evt) {
    document.querySelector("#pointcloud").emit("undo");
  },
  redo: function (evt) {
    document.querySelector("#pointcloud").emit("redo");
  },
  logThumbstick: function (evt) {
    /**
    *  If right joystick is down, shorten ray length
    */
    if (evt.detail.y > 0.55) {
      console.log("DOWN");
      let curlen =
        document.querySelector("#lefthand").components.raycaster.data.far;
      let amt = Math.max(-1 * (0.15 * curlen * evt.detail.y), -10000000);
      document
        .querySelector("#lefthand")
        .setAttribute("raycaster", "far", curlen + amt);
      document
        .querySelector("#righthand")
        .setAttribute("raycaster", "far", curlen + amt);
      document.querySelector("#raylenvalue").innerHTML = curlen + amt;
      document.querySelector("#raylen").value = curlen + amt;
    }
    /**
    *  If right joystick is up, increase ray length
    */
    if (evt.detail.y < -0.55) {
      console.log("UP");
      let curlen =
        document.querySelector("#lefthand").components.raycaster.data.far;
      let amt = Math.min(0.15 * curlen * -1 * evt.detail.y, 10000000);
      document
        .querySelector("#lefthand")
        .setAttribute("raycaster", "far", curlen + amt);
      document
        .querySelector("#righthand")
        .setAttribute("raycaster", "far", curlen + amt);
      document.querySelector("#raylenvalue").innerHTML = curlen + amt;
      document.querySelector("#raylen").value = curlen + amt;
    }
    /**
    *  If right joystick is left, make selection sphere smaller
    */
    if (evt.detail.x < -0.95) {
      console.log("LEFT");
      let currad = document.querySelector(
        "#" + evt.srcElement.components.classify.data.sphere
      ).object3D.scale.x;
      let amt = currad / 1.07;
      document
        .querySelector("#" + evt.srcElement.components.classify.data.sphere)
        .setAttribute("scale", { x: amt, y: amt, z: amt });
      //console.log(currad);
    }
    /**
    *  If right joystick is right, make selection sphere bigger
    */
    if (evt.detail.x > 0.95) {
      console.log("RIGHT");
      let currad = document.querySelector(
        "#" + evt.srcElement.components.classify.data.sphere
      ).object3D.scale.x;
      let amt = currad * 1.07;
      document
        .querySelector("#" + evt.srcElement.components.classify.data.sphere)
        .setAttribute("scale", { x: amt, y: amt, z: amt });
      //console.log(currad);
    }
  },
  
  /**
  *   fly: use left thumbstick to "fly" around the scene,
  *        relative to headset orientation
  */
  fly: function(evt){
    
    // get camera object
    let camera = document.querySelector("#cameraRig");
    //console.log(camera.firstElementChild.object3D.rotation);
    console.log(camera.object3D.position);
    let rot = new THREE.Vector3();
    rot.setFromEuler(camera.firstElementChild.object3D.rotation)
    
    // relative speed of motion multiplier
    let speed = 0.5;
    
    // turn orientation vector into direction vector
    let pitch = rot.x;
    let yaw = rot.y;
    let roll = rot.z;
    let z = -1*Math.cos(yaw)*Math.cos(pitch)
    let x = -1*Math.sin(yaw)*Math.cos(pitch)
    let y = Math.sin(pitch)
    let dir = new THREE.Vector3(x,y,z);
    
    /**
    *  If left joystick is down, fly backwards
    */
    if (evt.detail.y > 0.95) {
      camera.setAttribute('position', camera.object3D.position.sub(dir.multiplyScalar(speed)));
    }
    
    /**
    *  If left joystick is up, fly forwards
    */
    if (evt.detail.y < -0.95) {
      camera.setAttribute('position', camera.object3D.position.add(dir.multiplyScalar(speed)));
      
    }
    
    // LEFT
    if(evt.detail.x < -0.95) {}
    
    //RIGHT
    if(evt.detail.x > 0.95) {}
  },
  
  /**
  * Runs every tick
  */
  tick: function (time, timeDelta) {
    let intersections = this.el.components.raycaster.intersections;
    //console.log(intersections)
    
    let dist = this.el.components.raycaster.data.far; //length of ray
    
    // Snap the sphere to distance of the closest of the intersecting points
    if(intersections.length >0){
      dist = intersections[intersections.length - 1].distance; // first point is closest, last point is furthest generally
      //console.log(dist);
    }
    
    
    /**
     *   Place sphere on the tip of the ray
     */

    // get direction vector (world coordinates to which a vector would point)
    let dir = new THREE.Vector3(
      this.el.components.raycaster.data.direction.x,
      this.el.components.raycaster.data.direction.y,
      this.el.components.raycaster.data.direction.z
    );
    // make direction vector a unit vector (length one)
    dir.normalize();
    

    // rotate direction vector by controller entity's rotation
    dir.applyEuler(this.el.object3D.rotation);

    // scale vector by length of ray
    dir.multiplyScalar(dist);

    // add vector to current origin of the controller
    let camera = document.querySelector("#cameraRig");
    let pos = camera.object3D.position.clone().add(this.el.object3D.position);
    pos.add(dir);

    // set position of sphere to this location
    document
      .querySelector("#" + this.data.sphere)
      .setAttribute("position", pos);

    
    
    
    /**
     *    Collisions
     */
    // radius
    let r2 =
      document.querySelector("#" + this.data.sphere).object3D.scale.x ** 2;

   
    let pc = document.querySelector("#pointcloud");

    let selected = [];
    //let pns =pc.components.lasloader.positions;
    if (pc.object3D.children && pc.object3D.children.length > 0) {
      let pns = pc.components.lasloader.positions;
      //let pns = pc.object3D.children[0].geometry.attributes.position.array;
      // let worldpos = new THREE.Vector3();
      // console.log(pc.object3D.getWorldPosition(worldpos));
      let rotation = pc.object3D.rotation;
      let center = pc.object3D.position;
      let scale = pc.object3D.scale;

      let x, y, z, v;

      if (pns) {
        for (let i = 0; i < pns.length; i += 3) {
          x = pns[i];
          y = pns[i + 1];
          z = pns[i + 2];
          v = new THREE.Vector3(x, y, z);
          v.multiplyScalar(scale.x);
          v.applyEuler(rotation);
          v.add(center);

          //console.log(scale.x);

          //console.log(v);
          // if point is inside the sphere
          // x2+y2+z2=r2 -- equation of a sphere
          if (
            (v.x - pos.x) ** 2 + (v.y - pos.y) ** 2 + (v.z - pos.z) ** 2 <=
            r2
          ) {
            //console.log(x+", "+y+", "+z);
            selected.push(i / 3);
          }
        }
      }

      // left:0, right:1

      pc.emit("highlight", { selected: selected, hand: this.h });
    }

    // check for intersections every tick
    this.el.components.raycaster.refreshObjects();

    // if triggerdown has set this flag, classify intersected points
    if (this.paint) {
      //console.log("painting");
      let ids = [];
      let clns = [];
      

      let ptcld = document.querySelector("#pointcloud");
      // console.log(ptcld.object3D.rotation);
      //ptcld.object3D.rotation.z+=0.01;
      
      
      // this.raycaster_els = this.els;
      // for (let i = 0; i < intersections.length; i++) {
      //   //console.log(intersections[i].index, clns[intersections[i].index]);
      //   ids.push(intersections[i].index);
      //   clns.push(ptcld.components.lasloader.data.classificationValue);
      //   //console.log(ptcld.components.lasloader.data.classificationValue);
      // }
      //console.log(evt.detail.els);

      
      /
      if (selected.length > 0) {
        //console.log(ptcld.components.lasloader);
        // left:0, right:1

        ptcld.components.lasloader.classify(ids, [], this.h);
        //ptcld.components.lasloader.update(ptcld.components.lasloader.data);
      }
    }
  },
});
