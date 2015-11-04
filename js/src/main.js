/* jshint browserify: true */
'use strict';

// Grab an existing namespace object, or create a blank object if it doesn't exist.
// Add the modules.
// Only need to require the top-level modules, browserify
// will walk the dependency graph and load everything correctly.
var flowingcharts = window.flowingcharts || 
{
    BoundingBox : require('./geom/BoundingBox'),
    canvas : require('./canvas/util')
};

require('./plugins/jqueryplugin');

// Replace/Create the global namespace
window.flowingcharts = flowingcharts;

var bb = new flowingcharts.BoundingBox();
window.console.log(bb);
var bb2 = new flowingcharts.BoundingBox("bah",567,867,2345);
window.console.log(bb2);
var t = bb.intersects("test")