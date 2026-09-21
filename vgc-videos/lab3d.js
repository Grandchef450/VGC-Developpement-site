/* ---------- VGC3D v3: real vehicle model (GLB) + projected decals + turntable (three.js r128) ---------- */
window.VGC3D = (function(){
  function cv(w,h){ var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function poly(x, pts){ x.beginPath(); x.moveTo(pts[0][0],pts[0][1]); for(var i=1;i<pts.length;i++) x.lineTo(pts[i][0],pts[i][1]); x.closePath(); }
  var LIB = {
    roundel:{name:'Numéro 07', draw:function(){ var c=cv(512,512), x=c.getContext('2d'); x.fillStyle='#fff'; x.beginPath(); x.arc(256,256,240,0,Math.PI*2); x.fill(); x.lineWidth=16; x.strokeStyle='#111'; x.beginPath(); x.arc(256,256,222,0,Math.PI*2); x.stroke(); x.fillStyle='#111'; x.font='bold 230px Archivo, Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('07',256,276); return c; }},
    flames:{name:'Flammes', draw:function(){ var c=cv(768,512), x=c.getContext('2d'); var g=x.createLinearGradient(0,120,0,512); g.addColorStop(0,'#ffe23a'); g.addColorStop(.45,'#ff7a00'); g.addColorStop(1,'#c81a10'); x.fillStyle=g; for(var i=0;i<6;i++){ var bx=70+i*128, top=140+(i%2)*90; x.beginPath(); x.moveTo(bx-62,512); x.bezierCurveTo(bx-80,380,bx+30,330,bx-8,top); x.bezierCurveTo(bx-20,300,bx+62,350,bx+62,512); x.closePath(); x.fill(); } return c; }},
    checker:{name:'Damier', draw:function(){ var c=cv(1024,256), x=c.getContext('2d'); for(var r=0;r<4;r++) for(var q=0;q<16;q++){ x.fillStyle=(r+q)%2?'#111':'#fff'; x.fillRect(q*64,r*64,64,64); } return c; }},
    bolt:{name:'Éclair', draw:function(){ var c=cv(512,512), x=c.getContext('2d'); poly(x,[[300,0],[110,300],[240,300],[170,512],[420,200],[290,200],[380,0]]); x.fillStyle='#ffd400'; x.fill(); x.lineWidth=14; x.lineJoin='round'; x.strokeStyle='#111'; x.stroke(); return c; }},
    star:{name:'Étoile', draw:function(){ var c=cv(512,512), x=c.getContext('2d'); var pts=[]; for(var i=0;i<10;i++){ var a=-Math.PI/2+i*Math.PI/5, r=i%2?100:240; pts.push([256+Math.cos(a)*r,256+Math.sin(a)*r]); } poly(x,pts); x.fillStyle='#fff'; x.fill(); x.lineWidth=12; x.lineJoin='round'; x.strokeStyle='#111'; x.stroke(); return c; }},
    chevron:{name:'Chevrons', draw:function(){ var c=cv(1024,512), x=c.getContext('2d'); x.fillStyle='#da291c'; [0,400].forEach(function(o){ poly(x,[[o,0],[o+240,0],[o+560,256],[o+240,512],[o,512],[o+320,256]]); x.fill(); }); return c; }},
    stripes:{name:'Bandes', draw:function(){ var c=cv(1024,512), x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,150,1024,80); x.fillRect(0,290,1024,80); return c; }},
    speed:{name:'Traits de vitesse', draw:function(){ var c=cv(1024,384), x=c.getContext('2d'); x.fillStyle='#fff'; [[0,60,34],[0,180,26],[0,290,18]].forEach(function(l){ poly(x,[[0,l[1]-l[2]/2],[1024,l[1]-4],[1024,l[1]+4],[0,l[1]+l[2]/2]]); x.fill(); }); return c; }}
  };
  function textCanvas(str, color){
    var m = cv(64,64).getContext('2d'); m.font = 'bold 200px Archivo, Arial, sans-serif';
    var w = Math.min(2048, Math.max(300, Math.ceil(m.measureText(str).width) + 90));
    var c = cv(w, 280), x = c.getContext('2d');
    x.font = 'bold 200px Archivo, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.lineJoin = 'round'; x.lineWidth = 22; x.strokeStyle = '#0a0a0a'; x.strokeText(str, w/2, 150);
    x.fillStyle = color || '#ffffff'; x.fillText(str, w/2, 150);
    return c;
  }
  function tex(src){ var t = new THREE.CanvasTexture(src); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; return t; }
  function b64ToBuffer(b64){ var bin = atob(b64), len = bin.length, u8 = new Uint8Array(len); for(var i=0;i<len;i++) u8[i] = bin.charCodeAt(i); return u8.buffer; }

  function create(host, opts){
    opts = opts || {};
    var renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

    /* studio environment */
    var pmrem = new THREE.PMREMGenerator(renderer), env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(16,10,16), new THREE.MeshStandardMaterial({color:0x0a0a0a, side:THREE.BackSide, roughness:1, metalness:0})));
    function lightbox(w,h,d,x,y,z,i){ var m = new THREE.MeshBasicMaterial(); m.color.setScalar(i); var b = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), m); b.position.set(x,y,z); env.add(b); }
    lightbox(7,0.2,1.8, 0,4.6,0, 10); lightbox(0.2,3,7, -7.8,2,0, 5); lightbox(0.2,3,7, 7.8,2,0, 5); lightbox(5,2,0.2, 0,2.2,-7.8, 3.5); lightbox(5,1.2,0.2, 0,1.5,7.8, 2.5);
    var pl = new THREE.PointLight(0xffffff, 1, 40); pl.position.set(0,3,0); env.add(pl);
    scene.environment = pmrem.fromScene(env, 0.04).texture; pmrem.dispose();
    var key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(4,8,5); key.castShadow = true;
    key.shadow.mapSize.set(2048,2048); key.shadow.camera.near = 1; key.shadow.camera.far = 40;
    key.shadow.camera.left = -5; key.shadow.camera.right = 5; key.shadow.camera.top = 5; key.shadow.camera.bottom = -5; key.shadow.radius = 4; key.shadow.bias = -0.0005;
    scene.add(key);
    var rim = new THREE.PointLight(0xda291c, 1.4, 16); rim.position.set(-5,2,-5); scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(40,40), new THREE.ShadowMaterial({opacity:0.6})); ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);

    /* vehicle */
    var car = new THREE.Group(); scene.add(car);
    var paint = new THREE.MeshPhysicalMaterial({color:new THREE.Color(opts.paint || '#da291c'), metalness:0.25, roughness:0.38, clearcoat:1, clearcoatRoughness:0.06, envMapIntensity:1.0});
    var glass = new THREE.MeshPhysicalMaterial({color:0x0a0c10, metalness:0.6, roughness:0.05, transparent:true, opacity:0.45, envMapIntensity:1.3, side:THREE.DoubleSide, depthWrite:false});
    var decalables = [], wheels = [], ready = false, bbox = null;
    var target = new THREE.Vector3(0,1.0,0), radius = 9;
    function onModel(gltf){
      var root = gltf.scene;
      root.traverse(function(o){
        if(!o.isMesh) return;
        o.castShadow = true; o.receiveShadow = true;
        var m = o.material, name = ((m && m.name) || '').toUpperCase();
        if(name.indexOf('PAINT') === 0){ o.material = paint; decalables.push(o); }
        else if(name.indexOf('GLASS') === 0){ o.material = glass; o.castShadow = false; }
        else if(m){
          m.envMapIntensity = 0.6;
          if(name.indexOf('LIGHTS') === 0){ m.emissive = new THREE.Color(0xffffff); m.emissiveMap = m.map; m.emissiveIntensity = 0.5; }
          if(name.indexOf('CUTOUT') === 0){ m.alphaTest = 0.4; m.transparent = false; m.side = THREE.DoubleSide; }
        }
        if(/wheel/i.test(o.name)) wheels.push(o);
      });
      var b = new THREE.Box3().setFromObject(root), c = b.getCenter(new THREE.Vector3());
      root.position.set(-c.x, -b.min.y, -c.z);
      car.add(root); car.updateMatrixWorld(true);
      bbox = new THREE.Box3().setFromObject(car);
      var size = bbox.getSize(new THREE.Vector3());
      target.set(0, size.y*0.42, 0); radius = Math.max(size.x, size.z) * 1.75;
      ready = true; host.classList.add('model-ready');
      if(opts.onReady) opts.onReady();
    }
    if(!THREE.GLTFLoader || !THREE.DecalGeometry) throw new Error('librairies 3D manquantes (GLTFLoader / DecalGeometry)');
    var loader = new THREE.GLTFLoader();
    function fail(e){ host.classList.add('nogl'); if(opts.onError) opts.onError(e); }
    if(opts.modelB64){ try{ loader.parse(b64ToBuffer(opts.modelB64), '', onModel, fail); }catch(e){ fail(e); } }
    else if(opts.model){ loader.load(opts.model, onModel, undefined, fail); }

    /* decals (stickers projected onto the bodywork) */
    var stickers = [], selected = null, raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2(), dirty = null;
    var outlineGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(1,1)), outlineMat = new THREE.LineBasicMaterial({color:0xda291c});
    function sideName(n){ if(Math.abs(n.x) > 0.7) return n.x > 0 ? 'côté droit' : 'côté gauche'; if(n.y > 0.75) return 'toit'; if(n.z < -0.6) return n.y > 0.35 ? 'capot' : 'avant'; if(n.z > 0.6) return 'arrière'; return 'carrosserie'; }
    function orientationOf(st){ var d = new THREE.Object3D(); d.position.copy(st.point); d.lookAt(st.point.clone().add(st.normal)); d.rotateZ(st.angle); return d; }
    function rebuild(st){
      st.meshes.forEach(function(m){ car.remove(m); m.geometry.dispose(); }); st.meshes = [];
      var d = orientationOf(st), orient = d.rotation.clone();
      var size = new THREE.Vector3(st.size*st.aspect, st.size, Math.max(0.18, st.size*0.4));
      decalables.forEach(function(mesh){
        var geo;
        try{ geo = new THREE.DecalGeometry(mesh, st.point, orient, size); }catch(e){ return; }
        if(!geo.attributes.position || geo.attributes.position.count === 0){ geo.dispose(); return; }
        var m = new THREE.Mesh(geo, st.mat); m.renderOrder = 5; m.userData.sticker = st; car.add(m); st.meshes.push(m);
      });
      st.outline.position.copy(st.point).addScaledVector(st.normal, 0.02); st.outline.quaternion.copy(d.quaternion); st.outline.scale.set(st.size*st.aspect, st.size, 1);
    }
    function select(st){
      if(selected && selected !== st) selected.outline.visible = false;
      selected = st || null; if(selected) selected.outline.visible = true;
      if(opts.onSelect) opts.onSelect(selected);
    }
    function placeAt(st, hit){
      var n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
      st.normal.copy(n); st.point.copy(hit.point); st.side = sideName(n); dirty = st;
    }
    function addSticker(texture, name){
      if(!ready) return null;
      var img = texture.image, aspect = (img && img.width && img.height) ? img.width/img.height : 1;
      var mat = new THREE.MeshStandardMaterial({map:texture, transparent:true, roughness:0.45, metalness:0.05, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-6, polygonOffsetUnits:-6, envMapIntensity:0.5});
      var st = {name:name, mat:mat, meshes:[], size:Math.min(0.8, 1.5/aspect), aspect:aspect, angle:0, flip:false, normal:new THREE.Vector3(-1,0,0), point:new THREE.Vector3(), side:'côté gauche'};
      st.outline = new THREE.LineSegments(outlineGeo, outlineMat); st.outline.visible = false; car.add(st.outline);
      stickers.push(st);
      raycaster.setFromCamera(new THREE.Vector2(0, -0.05), camera);
      var hits = raycaster.intersectObjects(decalables, false);
      if(hits.length){ placeAt(st, hits[0]); }
      else { st.point.set(bbox.min.x, (bbox.max.y - bbox.min.y)*0.55, 0.3); st.normal.set(-1,0,0); dirty = st; }
      rebuild(st); dirty = null;
      select(st); autoSpin = false; idle = 0; host.classList.add('touched');
      if(opts.onChange) opts.onChange();
      return st;
    }
    function removeSticker(st){
      var i = stickers.indexOf(st); if(i < 0) return;
      stickers.splice(i,1); st.meshes.forEach(function(m){ car.remove(m); m.geometry.dispose(); }); car.remove(st.outline); st.mat.dispose();
      if(selected === st) select(null);
      if(opts.onChange) opts.onChange();
    }
    function applyFlip(st){ st.mat.map.repeat.x = st.flip ? -1 : 1; st.mat.map.offset.x = st.flip ? 1 : 0; st.mat.map.needsUpdate = true; }

    /* pointer: drag a sticker, otherwise orbit */
    var theta = 0.9, phi = 1.2;
    var mode = null, lx = 0, ly = 0, moved = false, idle = 0, autoSpin = !opts.reduce;
    var el = renderer.domElement; el.style.touchAction = 'none'; el.style.cursor = 'grab';
    function setRay(e){ var r = el.getBoundingClientRect(); ndc.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1); raycaster.setFromCamera(ndc, camera); }
    function stickerMeshes(){ var a = []; stickers.forEach(function(s){ a = a.concat(s.meshes); }); return a; }
    el.addEventListener('pointerdown', function(e){
      el.setPointerCapture(e.pointerId); setRay(e); moved = false; lx = e.clientX; ly = e.clientY; autoSpin = false; idle = 0; host.classList.add('touched');
      var sh = raycaster.intersectObjects(stickerMeshes(), false);
      if(sh.length){ select(sh[0].object.userData.sticker); mode = 'drag'; el.style.cursor = 'move'; }
      else { mode = 'orbit'; el.style.cursor = 'grabbing'; }
    });
    el.addEventListener('pointermove', function(e){
      if(mode === 'drag' && selected){ setRay(e); var bh = raycaster.intersectObjects(decalables, false); if(bh.length){ placeAt(selected, bh[0]); moved = true; } }
      else if(mode === 'orbit'){ theta -= (e.clientX-lx)*0.0065; phi = Math.min(1.5, Math.max(0.25, phi-(e.clientY-ly)*0.005)); if(Math.abs(e.clientX-lx)+Math.abs(e.clientY-ly) > 3) moved = true; lx = e.clientX; ly = e.clientY; }
    });
    function up(){ if(mode === 'orbit' && !moved) select(null); if(mode === 'drag' && moved && opts.onChange) opts.onChange(); mode = null; el.style.cursor = 'grab'; }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', function(e){ e.preventDefault(); radius = Math.min(16, Math.max(4.5, radius+e.deltaY*0.006)); autoSpin = false; idle = 0; }, {passive:false});

    function setCam(){ camera.position.set(target.x+radius*Math.sin(phi)*Math.sin(theta), target.y+radius*Math.cos(phi), target.z+radius*Math.sin(phi)*Math.cos(theta)); camera.lookAt(target); }
    function resize(){ var w = host.clientWidth, h = host.clientHeight; if(!w||!h) return; renderer.setSize(w,h,false); camera.aspect = w/h; camera.updateProjectionMatrix(); }
    window.addEventListener('resize', resize); resize();
    var running = false, last = 0, raf = 0;
    function frame(t){
      if(!running) return;
      var dt = Math.min(0.05,(t-last)/1000) || 0; last = t;
      if(mode === null && !opts.reduce){ idle += dt; if(idle > 6) autoSpin = true; }
      if(autoSpin){ theta += dt*0.3; wheels.forEach(function(w){ w.rotation.x -= dt*1.6; }); }
      if(dirty){ rebuild(dirty); dirty = null; }
      setCam(); renderer.render(scene, camera); raf = requestAnimationFrame(frame);
    }
    function resume(){ if(running) return; running = true; last = performance.now(); resize(); raf = requestAnimationFrame(frame); }
    function pause(){ running = false; cancelAnimationFrame(raf); }
    resume();

    var library = Object.keys(LIB).map(function(id){ var c = LIB[id].draw(); return {id:id, name:LIB[id].name, canvas:c}; });
    var paintName = opts.paintName || 'Rosso Corsa', paintHex = opts.paint || '#da291c';
    return {
      library: library,
      isReady: function(){ return ready; },
      setPaint: function(hex, name){ paint.color.set(hex); paintHex = hex; paintName = name || hex; if(opts.onChange) opts.onChange(); },
      addFromLibrary: function(id){ var it = library.filter(function(l){ return l.id===id; })[0]; if(!it) return null; return addSticker(tex(it.canvas), it.name); },
      addText: function(str, color){ str = (str||'').trim(); if(!str) return null; return addSticker(tex(textCanvas(str, color)), 'Texte « '+str+' »'); },
      addImageURL: function(url, name, cb){
        var im = new Image(); im.onload = function(){
          var s = Math.min(1, 1024/Math.max(im.width, im.height)), c = cv(Math.max(1,Math.round(im.width*s)), Math.max(1,Math.round(im.height*s)));
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); var st = addSticker(tex(c), name || 'Image'); if(cb) cb(st);
        }; im.onerror = function(){ if(cb) cb(null); }; im.src = url;
      },
      addLogo: function(cb){ if(!opts.logo){ if(cb) cb(null); return; } this.addImageURL(opts.logo, 'Logo VGC', cb); },
      selected: function(){ return selected; },
      setSize: function(v){ if(selected){ selected.size = v; dirty = selected; } },
      setAngle: function(deg){ if(selected){ selected.angle = deg*Math.PI/180; dirty = selected; } },
      toggleFlip: function(){ if(selected){ selected.flip = !selected.flip; applyFlip(selected); } },
      remove: function(){ if(selected) removeSticker(selected); },
      clear: function(){ stickers.slice().forEach(removeSticker); },
      count: function(){ return stickers.length; },
      describe: function(){
        var lines = ['Véhicule : '+(opts.modelName || 'nspeedo')+' (modèle réel du catalogue)', 'Peinture : '+paintName+' ('+paintHex+')', 'Stickers : '+(stickers.length || 'aucun')];
        stickers.forEach(function(s,i){ lines.push('  '+(i+1)+'. '+s.name+' — '+s.side+', taille '+s.size.toFixed(2)+' m, rotation '+Math.round(s.angle*180/Math.PI)+'°'+(s.flip?', miroir':'')); });
        return lines.join('\n');
      },
      pause: pause, resume: resume, resize: resize
    };
  }
  return {create:create};
})();
