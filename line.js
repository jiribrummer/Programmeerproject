// JavaScript Document


// copied from d3 website to test (not functional yet)

var margin = {top: 20, right: 250, bottom: 70, left: 50},
    width = 1150 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
	
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

//http://bl.ocks.org/DStruths/9c042e3a6b66048b5bd4	
var color = d3.scale.ordinal().range(["#48A36D",  "#56AE7C",  "#64B98C", "#72C39B", "#80CEAA", "#80CCB3", "#7FC9BD", "#7FC7C6", "#7EC4CF", "#7FBBCF", "#7FB1CF", "#80A8CE", "#809ECE", "#8897CE", "#8F90CD", "#9788CD", "#9E81CC", "#AA81C5", "#B681BE", "#C280B7", "#CE80B0", "#D3779F", "#D76D8F", "#DC647E", "#E05A6D", "#E16167", "#E26962", "#E2705C", "#E37756", "#E38457", "#E39158", "#E29D58", "#E2AA59", "#E0B15B", "#DFB95C", "#DDC05E", "#DBC75F", "#E3CF6D", "#EAD67C", "#F2DE8A"]);  

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

function plotLine(plotdata, d, i) {
	console.log(plotdata)
	console.log(d)
  svg.append("path")
      .datum(plotdata)
      .attr("class", "line")
      .attr("d", line)
	  .attr("id", 'tag'+d.emolabels.replace(/\s+/g, ''))
	  .style("opacity", 0)
	  .style('stroke', color(i));
	    

    svg.selectAll("dot")
        .data(plotdata)
    .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.jaar); })
        .attr("cy", function(d) { return y(d.aantal); })
		.style("fill", color(i))
		.style("opacity", 0)
		.attr("id", 'tag2'+d.emolabels.replace(/\s+/g, ''))
		.on("click", function(){
		});
		
    svg.append("text")
        .attr("x", 900)
        .attr("y", 0 +14*i)
        .attr("class", "legend")
        .style("fill", color(i))
        .text(d.emolabels)
		.attr("id", 'tag3'+d.emolabels.replace(/\s+/g, ''))
        .on("click", function(){
			
			var active   = d.active ? false : true,
            newOpacityLine = active ? 0.4 : 0;  
			newOpacityCircle = active ? 1 : 0;            // ************
			newWeight = active ? 'bold' : 'normal';
			newDecoration = active ? 'underline' : 'none';   
            // Hide or show the elements based on the ID
            d3.select("#tag"+d.emolabels.replace(/\s+/g, '')) // *********
                .transition().duration(100)          // ************
                .style("opacity", newOpacityLine);       // ************
			d3.selectAll("#tag2"+d.emolabels.replace(/\s+/g, ''))
                .transition().duration(100)          // ************
                .style("opacity", newOpacityCircle);       // ************
            d3.select("#tag3"+d.emolabels.replace(/\s+/g, '')) // *********
                .transition().duration(100)          // ************
                .style("text-decoration", newDecoration)       // ************
				.style("font-weight", newWeight);

            // Update whether or not the elements are active
            d.active = active;                       // ************
            updategraph()
			});                                       // ************
       
}

// Working on
function updategraph() {
	console.log('werkt')
	d3.selectAll(".line")[0].forEach(function(d) {
		console.log('nummer')
	})
}
  

function calculateEmotions(overviewdata, alldata, emolabels, emolevel) {
	totalEmotions = countTotalEmotions(overviewdata, alldata, emolevel)
	//console.log(totalEmotions)
	var emoData = {} // Make empty JSON data to add emotions
	//console.log(emoData)
	emolabels.forEach(function(d,i) { 
	console.log(d)
	
		specEmotion = countSpecifiedEmotion(overviewdata, alldata, d.emolabels, emolevel, emoData);
		console.log(specEmotion)
	
		plotdata = calculateRelativeFrequency(specEmotion, totalEmotions, d.emolabels)
		console.log(plotdata)
		console.log(plotdata[d.emolabels])
		
		
		
		console.log('hier')
		
		//plotLine(plotdata[d.emolabels], d, i)
	})
	console.log(plotdata);
	return plotdata
	
}

function determineDomain(plotdata, emolabels) {
		console.log(emolabels[0].emolabels)
		var xDomain = d3.extent(plotdata[emolabels[0].emolabels], function(e) { return e.jaar; })
		console.log(xDomain)
		
		console.log(plotdata)
		emolabels.forEach(function(d) {
			console.log(plotdata[d.emolabels])
			var tempDomain = d3.extent(plotdata[d.emolabels], function(e) { return e.jaar; })
			console.log(tempDomain)
			if(tempDomain[0] < xDomain[0]){
				xDomain[0] = tempDomain[0]
			}
			if(tempDomain[1] > xDomain[1]){
				xDomain[1] = tempDomain[1]
			}			
		console.log(tempDomain)
		})
		
		x.domain(xDomain);
		
		// y Domain
		console.log(emolabels[0].emolabels)
		var yDomain = d3.extent(plotdata[emolabels[0].emolabels], function(e) { return e.aantal; })
		console.log(yDomain)
		
		console.log(plotdata)
		emolabels.forEach(function(d) {
			console.log(plotdata[d.emolabels])
			var tempDomain = d3.extent(plotdata[d.emolabels], function(e) { return e.aantal; })
			console.log(tempDomain)
			if(tempDomain[0] < yDomain[0]){
				yDomain[0] = tempDomain[0]
			}
			if(tempDomain[1] > yDomain[1]){
				yDomain[1] = tempDomain[1]
			}			
		console.log(tempDomain)
		})
		

		y.domain(yDomain);

}


// Main function
function main(error, overviewdata, alldata, emolabels) {
	console.log(emolabels)
	prepareData(overviewdata)
	//console.log(addToJson(overviewdata, 'Woede'))
	console.log("============")
	
	var labels = emolabels

	calculateEmotions(overviewdata, alldata, labels, 'Emotie')
	
	determineDomain(plotdata, emolabels)
	
	emolabels.forEach(function(d,i) { 
		console.log(i)
		//determineDomain(plotdata, emolabels, d)
		plotLine(plotdata[d.emolabels], d, i)
	})
	


  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
	svg.append("text")
      .attr("y", 560)
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
