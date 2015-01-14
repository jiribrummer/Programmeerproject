// JavaScript Document


// copied from d3 website to test (not functional yet)

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
	
var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.jaar); })
    .y(function(d) { return y(d.aantal); });

var svg = d3.select("#linegraph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// End of copied code.


// Load in data and run main function

console.log('start');

queue()
    .defer(d3.tsv, 'Data/overviewData.txt') // 
    .defer(d3.tsv, 'Data/testdata.txt') // 
	.defer(d3.tsv, 'Data/emolabels.txt') // 
    .await(main); // 


// Main function
function main(error, overviewdata, testdata, emolabels) {
	overviewdata.forEach(function(d) {
		d.aantal = +d.aantal;
		console.log(d.jaar)
		d.jaar = +d.jaar;
	});
	
	console.log('1');
	console.log(overviewdata);
	console.log('2');
	console.log(testdata);
	console.log('3');
	console.log(overviewdata);
	console.log('3,5');
	
	calculateEmotions(overviewdata, testdata, 'Woede', 'Lichaamsdeel');
	
	console.log('4');
	console.log(overviewdata);
	console.log('5');

  	
	x.domain(d3.extent(overviewdata, function(d) { return d.jaar; }));
	y.domain(d3.extent(overviewdata, function(d) { return d.aantal; }));

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
	svg.append("text")
      .attr("y", 460)
	  .attr("x", 910)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Year");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Frequency");

  svg.append("path")
      .datum(overviewdata)
      .attr("class", "line")
      .attr("d", line);
	  
	  
}


// Create variables
function createVariables(emolabels) {
	
}

	

// Calculate frequency of emotions to plot
function calculateEmotions(overviewdata, testdata, emolabel, emolevel) {
	console.log('in calcEm');
	testdata.forEach(function(d) {
		//console.log('in forEach');
		//console.log(d.emolabel)
		if(d.emolabel == emolabel && d.emolevel == emolevel) {
			//console.log('in if');
			//console.log(d.id.substr(0,13))
			//console.log('check')
			overviewdata.forEach(function(e) {
				//console.log(e.id)
				if(e.id == d.id.substr(0,13)) {
					//console.log('------------')
					//console.log(e.aantal)
					//console.log(e)
					e.aantal = e.aantal + 1
					//console.log(e.aantal)
					//console.log(e)
					//console.log(overviewdata)
					//console.log('============')
				}})
		}
		});
	//console.log(overviewdata);
	//console.log('End calcEm');
}
