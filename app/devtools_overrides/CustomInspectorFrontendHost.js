(function(){

  var clipboard = require('clipboard');

  function CustomInspectorFrontendHost(){

  }

  CustomInspectorFrontendHost.prototype = {

    copyText: function(text) {
      clipboard.writeText(text)
    }

  }

  window.InspectorFrontendHost = new CustomInspectorFrontendHost()

})()
