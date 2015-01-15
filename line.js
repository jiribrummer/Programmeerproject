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

function prepareData(overviewdata) {
	overviewdata.forEach(function(d) {
		d.aantal = +d.aantal;
		d.jaar = +d.jaar;	
})};

function createEmptyJson(overviewdata) {
	var data = []
	overviewdata.forEach(function(d) {
		data.push({'jaar' : d.jaar, 'aantal' : 0})
	})
	return data
}



// Main function
function main(error, overviewdata, testdata, emolabels) {
	
	prepareData(overviewdata)
	//console.log(createEmptyJson(overviewdata, 'Blijdschap'))
	console.log("============")
	
	totalEmotions = countTotalEmotions(overviewdata, testdata, 'Lichaamsdeel')
	console.log(totalEmotions)
	specEmotion = countSpecifiedEmotion(overviewdata, testdata, 'Angst', 'Lichaamsdeel');
	
	plotdata = calculateRelativeFrequency(specEmotion, totalEmotions)

	x.domain(d3.extent(plotdata, function(d) { return d.jaar; }));
	y.domain(d3.extent(plotdata, function(d) { return d.aantal; }));

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
      .text("Frequency (%)");

  svg.append("path")
      .datum(plotdata)
      .attr("class", "line")
      .attr("d", line);
	  
	  console.log(overviewdata)
	  console.log('finish')
}

// Calculate frequency of emotions to plot
function countSpecifiedEmotion(overviewdata, testdata, emolabel, emolevel) {
	console.log('----==============--------------')
	jsondata = createEmptyJson(overviewdata)
	console.log(jsondata)
	testdata.forEach(function(d) {
		//console.log('in forEach');
		//console.log(d.emolabel)
		if(d.emolabel == emolabel && d.emolevel == emolevel) {
			
			//console.log('in if');
			//console.log(jsondata)
			//console.log(d.id.substr(0,13))
			//console.log('check')
			overviewdata.forEach(function(e) {
				//console.log(e.id)
				if(e.id == d.id.substr(0,13)) {
					//console.log('------------')
					for (var key in jsondata) {
						//console.log(jsondata[key].jaar)
						if (jsondata[key].jaar == e.jaar) {
							jsondata[key].aantal = jsondata[key].aantal + 1
						}
					}
				}})
		}
		});
	console.log(overviewdata);
	console.log(jsondata);
	console.log('End calcEm');
	return jsondata
}

function countTotalEmotions(overviewdata, testdata, emolevel) {
	console.log('----=====++++=======--------------')
	jsondata = createEmptyJson(overviewdata)
	console.log(jsondata)
	testdata.forEach(function(d) {
		//console.log('in forEach');
		//console.log(d.emolabel)
		if(d.emolevel == emolevel) {
			
			console.log('in if');
			console.log(jsondata)
			//console.log(d.id.substr(0,13))
			//console.log('check')
			overviewdata.forEach(function(e) {
				//console.log(e.id)
				if(e.id == d.id.substr(0,13)) {
					console.log('------------')
					for (var key in jsondata) {
						//console.log(jsondata[key].jaar)
						if (jsondata[key].jaar == e.jaar) {
							jsondata[key].aantal = jsondata[key].aantal + 1
						}
					}
				}})
		}
		});
	console.log(overviewdata);
	console.log(jsondata);
	console.log('End calcEm');
	return jsondata
}

function calculateRelativeFrequency(specifiedEmotion, totalEmotion) {
	
	for (var i in specifiedEmotion) {
		console.log('=-=-=-=-=-=-=-=-=')
		console.log(specifiedEmotion[i].aantal)
		console.log(totalEmotion[i].aantal)
		if (specifiedEmotion[i].aantal != 0) {
			specifiedEmotion[i].aantal = (specifiedEmotion[i].aantal / totalEmotion[i].aantal * 100)
		}
		console.log(specifiedEmotion[i].aantal)
		console.log('=-=-=-=-=-=-=-=-=')
	}
	return specifiedEmotion
}