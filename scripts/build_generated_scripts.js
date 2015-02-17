/* jshint evil:true */
/* global InspectorBackendClass */
var fs = require('fs'),
    execSync = require('child_process').execSync,
    path = require('path'),
    protocol = require(__dirname + '/../app/devtools/protocol.json');

// Mock objects
Promise = require("es6-promise").Promise;
self = this;
window = {};
WebInspector = {};

eval(fs.readFileSync(__dirname + '/../app/devtools/front_end/platform/utilities.js', 'utf8'));
eval(fs.readFileSync(__dirname + '/../app/devtools/front_end/common/Object.js', 'utf8'));
eval(fs.readFileSync(__dirname + '/../app/devtools/front_end/sdk/InspectorBackend.js', 'utf8'));

var commands = InspectorBackendClass._generateCommands(protocol);
var header = '// Auto-generated.\n' +
             '// Run `node --harmony scripts/generate-commands.js` to update.\n' +
             '\n';

fs.writeFileSync(__dirname + '/../app/devtools/front_end/InspectorBackendCommands.js', header + commands);

// Generate empty SupportedCSSProperties.js for now.
var supportedCSSPropertiesContent = 'WebInspector.CSSMetadata.initializeWithSupportedProperties({});'
fs.writeFileSync(__dirname + '/../app/devtools/front_end/SupportedCSSProperties.js', supportedCSSPropertiesContent);

// Devtools Overrides
var appBasePath = path.resolve(__dirname, '..', 'app')
var customFrontEndHostFileName = "NwjsInspectorFrontendHost.js"
var frontEndModuleConfigFilePath = appBasePath + '/devtools/front_end/host/module.json'
var frontEndModuleConfig = require(frontEndModuleConfigFilePath)

if(frontEndModuleConfig.scripts.indexOf(customFrontEndHostFileName) === -1){
  frontEndModuleConfig.scripts.unshift(customFrontEndHostFileName)
}

fs.writeFileSync(
  frontEndModuleConfigFilePath,
  JSON.stringify(frontEndModuleConfig, null, 4) + "\n"
)

var overrideFilePath = '../../../devtools_overrides/NwjsInspectorFrontendHost.js'
var linkPath = appBasePath + '/devtools/front_end/host/NwjsInspectorFrontendHost.js'
var symlinkCommand = "ln -s " +  overrideFilePath + ' ' + linkPath

if(!fs.existsSync(linkPath)){
  execSync(symlinkCommand)
}
