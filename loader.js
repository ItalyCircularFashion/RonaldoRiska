/* loader.js — aggiunge dinamicamente project-data.js e area-progetti.js
   Includi con: <script src="loader.js"></script>  prima di </body>
   Non serve data-area: l'area viene rilevata automaticamente dall'URL */
(function(){
  function addScript(src, onload){
    var s=document.createElement('script');
    s.src=src; if(onload) s.onload=onload;
    document.body.appendChild(s);
  }
  addScript('project-data.js', function(){
    addScript('area-progetti.js');
  });
})();
