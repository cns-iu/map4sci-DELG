//console.log("Hello world")

//var d3 = require("d3");
import * as d3 from 'd3'
//console.log(d3.__version__);

//var scl = d3.scaleLinear().domain([1, 10]).range([1, 500]);
//console.log(scl(5));

//var data = require('./topics_compute_mlst');
//import * as data from 'topics_compute_mlst'
//import topics_compute_mlst;
//console.log(data.org_to_alphanum);

//d3.json("/Users/abureyanahmed/DELG/tweets.json", function(data) {
//        console.log(data);
//    }
//);

//const fs = require('fs')
import * as fs from 'fs'

var org_to_alphanum = null;
var alphanum_to_org = null;
var my_edges = null;
var label_to_id = null;
var id_to_label = null;
var edge_distance = null;
var nodes_to_levels = null;
var nodes_to_files = null;
var crd_x = null;
var crd_y = null

var previousCrossingIndex = null;
var prevResLength = null;
var forceFactor = 1;
fs.readFile('crossings_initial.js', 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  //console.log(data)
  eval(data)
})

fs.readFile('area_coverage_mingwei.js', 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  //console.log(data)
  eval(data)
})

var edgeLengthAddition = null;
var subdivision_length = null;
var subdivision_factor = null;
var addEdgePhase = true;
var my_count = 0;
var crossing_step_cnt=0;
var crossing_step_speed=20;
//crossing_step_type="circular";
var crossing_step_type="straight";
//intervalTime = 500;
//intervalTime = 100;
//intervalTime = 50; //***
//intervalTime = 20;
//intervalTime = 10;
var intervalTime = 5;
//steps_before_fix_position = 1;
//steps_before_fix_position = 50;
var steps_before_fix_position = 50000;
var edge_distance_org = null;
var eps_movement = null;
var safeMode = null;
var safeModeIter = null;
var locked = null;
var t0 = null;
var myGraph = null;
var font_size = null;
var node_to_links = null;

function ideal_edge_length_preservation(links, ideal_lengths){
  let total_difference = 0;
  for (let i = 0; i < links.length; i++) {
    let x1 = links[i].source.x;
    let y1 = links[i].source.y;
    let x2 = links[i].target.x;
    let y2 = links[i].target.y;
    let dist = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    let diff = Math.abs(ideal_lengths[i] - dist);
    total_difference += Math.pow(diff / ideal_lengths[i], 2);
  }
  let average_difference = Math.sqrt(total_difference / links.length);
  //return 1-average_difference;
  return average_difference;
}

//const data = fs.readFileSync('crossings_initial.js',
//            {encoding:'utf8', flag:'r'});
 
// Display the file data
//console.log(data);
//eval(data)


fs.readFile('topics_compute_mlst.js', 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  //console.log(data)
  eval(data)
  //console.log(alphanum_to_org)
  fs.readFile('DELG_code.js', 'utf8' , (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    //console.log(data)
    eval(data)
  })
})

