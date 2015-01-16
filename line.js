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
	
var color = d3.scale.category10();

// End of copied code.


// Load in data and run main function

console.log('start');

// Load data en wait to execute main function until all data is loaded
queue()
    .defer(d3.tsv, 'Data/overviewData.txt') // Data with background information
    .defer(d3.tsv, 'Data/alldata.txt') // Data with all texts
	.defer(d3.tsv, 'Data/emolabels.txt') // All emotion labels
    .await(main); // Wait for all data sets to be loaded to execute main function

// Shape overview data in correct format
function prepareData(overviewdata) {
	overviewdata.forEach(function(d) {
		d.aantal = +d.aantal; // Make integers of string
		d.jaar = +d.jaar;	// Make integers of string
})};

// Function to create a json file with the name of an given emotion
function addToJson(overviewdata, varname, dataToAdd) {
	//console.log(varname)
		dataToAdd[varname] = [] // Add name of given emotion
	//console.log(dataToAdd)
	overviewdata.forEach(function(d) {
		dataToAdd[varname].push({'jaar' : d.jaar, 'aantal' : 0}) // Set all counts 0 for every year
	})
	//console.log(dataToAdd)
	return dataToAdd
}

function plotLine(plotdata, i) {

  svg.append("path")
      .datum(plotdata)
      .attr("class", "line")
      .attr("d", line)
	  .style("opacity", 0.4);
	  
	  
	  

    svg.selectAll("dot")
        .data(plotdata)
    .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.jaar); })
        .attr("cy", function(d) { return y(d.aantal); })
		.style("fill", "steelblue");

                
		
	
}

function calculateEmotions(overviewdata, alldata, emolabels, emolevel) {
	totalEmotions = countTotalEmotions(overviewdata, alldata, emolevel)
	//console.log(totalEmotions)
	var emoData = {} // Make empty JSON data to add emotions
	//console.log(emoData)
	for (var i in emolabels) { 
	console.log(emolabels[i].emolabels)
	
		specEmotion = countSpecifiedEmotion(overviewdata, alldata, emolabels[i].emolabels, emolevel, emoData);
		//console.log(specEmotion)
	
		plotdata = calculateRelativeFrequency(specEmotion, totalEmotions, emolabels[i].emolabels)
		//console.log(plotdata[emolabels[i]])
		
		x.domain(d3.extent(plotdata[emolabels[i].emolabels], function(d) { return d.jaar; }));
		y.domain(d3.extent(plotdata[emolabels[i].emolabels], function(d) { return d.aantal; }));
		
		plotLine(plotdata[emolabels[i].emolabels], i)
	}
	//console.log(plotdata)
	return plotdata
}


// Main function
function main(error, overviewdata, alldata, emolabels) {
	console.log(emolabels)
	prepareData(overviewdata)
	//console.log(addToJson(overviewdata, 'Woede'))
	console.log("============")
	
	var labels = emolabels
	console.log(emolabels)
	calculateEmotions(overviewdata, alldata, labels, 'Emotie')

	
	
	


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

	
	
	console.log('finish')
}

// Calculate frequency of emotions to plot
function countSpecifiedEmotion(overviewdata, alldata, emolabel, emolevel, dataToAdd) {
	//console.log('----==============--------------')
	jsondata = addToJson(overviewdata, emolabel, dataToAdd)
	//console.log(jsondata)
	alldata.forEach(function(d) {
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
					for (var key in jsondata[emolabel]) {
						//console.log(jsondata[emolabel][key].jaar)
						if (jsondata[emolabel][key].jaar == e.jaar) {
							jsondata[emolabel][key].aantal = jsondata[emolabel][key].aantal + 1
						}
					}
				}})
		}
		});
	//console.log(overviewdata);
	//console.log(jsondata);
	//console.log('End calcEm');
	return jsondata
}

function countTotalEmotions(overviewdata, alldata, emolevel) {
	//console.log('----=====++++=======--------------')
	//console.log(jsondataTotal)
	var jsondataTotal = {}  
	console.log('')
	addToJson(overviewdata, 'total', jsondataTotal)
	console.log(jsondataTotal)
	alldata.forEach(function(d) {
		//console.log('in forEach');
		//console.log(d.emolabel)
		if(d.emolevel == emolevel) {
			
			//console.log('in if');
			//console.log(jsondata)
			//console.log(d.id.substr(0,13))
			//console.log('check')
			overviewdata.forEach(function(e) {
				//console.log(e.id)
				if(e.id == d.id.substr(0,13)) {
					//console.log('------------')
					for (var key in jsondataTotal['total']) {
						//console.log(jsondata[emolabel][key].jaar)
						if (jsondataTotal['total'][key].jaar == e.jaar) {
							jsondataTotal['total'][key].aantal = jsondataTotal['total'][key].aantal + 1
						}
					}
				}})
		}
		});
	console.log(overviewdata);
	console.log(jsondataTotal);
	console.log('End calcEm');
	return jsondataTotal
}

function calculateRelativeFrequency(specifiedEmotion, totalEmotion, labels) {
	console.log(specifiedEmotion)
	console.log(specifiedEmotion)
	for (var i in specifiedEmotion[labels]) {
		//console.log('=-=-=-=-=-=-=-=-=')
		//console.log(specifiedEmotion[labels][i].aantal)
		//console.log(totalEmotion['total'][i].aantal)
		if (specifiedEmotion[labels][i].aantal != 0) {
			specifiedEmotion[labels][i].aantal = (specifiedEmotion[labels][i].aantal / totalEmotion['total'][i].aantal * 100)
		}
		//console.log(specifiedEmotion[i].aantal)
		//console.log('=-=-=-=-=-=-=-=-=')
	}
	console.log(specifiedEmotion)
	return specifiedEmotion
}
