(function(){
    var gui = require('nw.gui');
    var clipboard = gui.Clipboard.get();

    function NwjsInspectorFrontendHost(){

    }

    NwjsInspectorFrontendHost.prototype = {
        copyText: function(text)
        {
            clipboard.set(text)
        },
    }

    window.InspectorFrontendHost = new NwjsInspectorFrontendHost()

})()
