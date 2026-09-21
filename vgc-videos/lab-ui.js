  var stage = document.getElementById('labStage'), lab = null;
  var readout = document.getElementById('readout'), labSel = document.getElementById('labSel');
  var labState = {paint:'Rosso Corsa', hex:'#da291c'};
  function ro(){ readout.innerHTML = '<span>Véhicule <b>Speedo · nspeedo1</b></span><span>Peinture <b>'+esc(labState.paint)+'</b></span><span>Stickers <i>'+(lab ? lab.count() : 0)+'</i></span>'; }
  function showSel(st){
    if(!st){ labSel.hidden = true; return; }
    labSel.hidden = false;
    document.getElementById('labSelName').textContent = st.name;
    document.getElementById('labSize').value = st.size;
    document.getElementById('labRot').value = Math.round(st.angle*180/Math.PI);
  }
  function initLab(){
    try{
      if(!window.THREE || !window.VGC3D) throw new Error('three missing');
      lab = VGC3D.create(stage, {model:'models/nspeedo.glb', modelB64:(window.VGC_MODEL_B64 && window.VGC_MODEL_B64.length > 100) ? window.VGC_MODEL_B64 : '', modelName:'Speedo (nspeedo1)', paint:'#da291c', paintName:'Rosso Corsa', logo:'img/logo-vgc.png', reduce:reduce, onSelect:showSel, onChange:ro, onReady:function(){ document.querySelector('.lab-ctl').classList.add('ready'); ro(); }, onError:function(e){ var fb = stage.querySelector('.lab-fallback'); if(fb) fb.textContent = "Le modèle 3D n’a pas pu être chargé : " + (e && e.message ? e.message : e); }});
      var labIO = new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting) lab.resume(); else lab.pause(); }); },{threshold:0.05});
      labIO.observe(stage);
      var lib = document.getElementById('declib');
      lib.innerHTML = '<button class="dec" type="button" data-logo="1" title="Logo VGC"><img src="img/logo-vgc.png" alt="Logo VGC"></button>' + lab.library.map(function(l){ return '<button class="dec" type="button" data-dec="'+l.id+'" title="'+esc(l.name)+'" aria-label="'+esc(l.name)+'"></button>'; }).join('');
      lab.library.forEach(function(l){ var b = lib.querySelector('[data-dec="'+l.id+'"]'); var c = document.createElement('canvas'); c.width = 96; c.height = 96; var x = c.getContext('2d'); var r = Math.min(80/l.canvas.width, 80/l.canvas.height); var w = l.canvas.width*r, h = l.canvas.height*r; x.drawImage(l.canvas, (96-w)/2, (96-h)/2, w, h); b.appendChild(c); });
      lib.addEventListener('click', function(e){ var b = e.target.closest('.dec'); if(!b) return; if(b.dataset.logo) lab.addLogo(); else lab.addFromLibrary(b.dataset.dec); ro(); });
      document.getElementById('labTextBtn').addEventListener('click', function(){ var v = document.getElementById('labText').value; if(lab.addText(v)) document.getElementById('labText').value = ''; ro(); });
      document.getElementById('labText').addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); document.getElementById('labTextBtn').click(); } });
      document.getElementById('labFile').addEventListener('change', function(){
        var f = this.files && this.files[0]; if(!f) return; var rd = new FileReader();
        rd.onload = function(){ lab.addImageURL(rd.result, f.name.replace(/\.[^.]+$/,''), ro); }; rd.readAsDataURL(f); this.value = '';
      });
      document.getElementById('labSize').addEventListener('input', function(){ lab.setSize(+this.value); });
      document.getElementById('labRot').addEventListener('input', function(){ lab.setAngle(+this.value); });
      document.getElementById('labFlip').addEventListener('click', function(){ lab.toggleFlip(); });
      document.getElementById('labDel').addEventListener('click', function(){ lab.remove(); ro(); });
      document.getElementById('labReset').addEventListener('click', function(){ lab.clear(); ro(); });
      document.getElementById('labSend').addEventListener('click', function(e){ e.preventDefault(); openTicket('Livery', 'Bonjour, voici mon brief livery fait sur le site :\n\n'+lab.describe()+'\n\nVéhicule concerné : '); });
      ro();
    }catch(err){ stage.classList.add('nogl'); var fb = stage.querySelector('.lab-fallback'); if(fb) fb.textContent = "La 3D n’a pas pu démarrer : " + (err && err.message ? err.message : err); }
  }
  if(document.readyState === 'complete') initLab(); else window.addEventListener('load', initLab);
  document.getElementById('swatches').addEventListener('click', function(e){
    var b = e.target.closest('.sw'); if(!b) return;
    labState.paint = b.dataset.name; labState.hex = b.dataset.paint;
    if(lab) lab.setPaint(b.dataset.paint, b.dataset.name);
    ro();
    this.querySelectorAll('.sw').forEach(function(x){ x.setAttribute('aria-pressed', x===b?'true':'false'); });
  });
