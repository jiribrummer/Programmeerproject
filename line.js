// JavaScript Document


// Set up variables

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
	
// Place SVG object in created Div
var svg = d3.select("#linegraph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set up color range. Data from http://bl.ocks.org/DStruths/9c042e3a6b66048b5bd4	
var color = d3.scale.ordinal().range(["#48A36D",  "#56AE7C",  "#64B98C", "#72C39B", "#80CEAA", "#80CCB3", "#7FC9BD", "#7FC7C6", "#7EC4CF", "#7FBBCF", "#7FB1CF", "#80A8CE", "#809ECE", "#8897CE", "#8F90CD", "#9788CD", "#9E81CC", "#AA81C5", "#B681BE", "#C280B7", "#CE80B0", "#D3779F", "#D76D8F", "#DC647E", "#E05A6D", "#E16167", "#E26962", "#E2705C", "#E37756", "#E38457", "#E39158", "#E29D58", "#E2AA59", "#E0B15B", "#DFB95C", "#DDC05E", "#DBC75F", "#E3CF6D", "#EAD67C", "#F2DE8A"]);  


// Load data and run main function


// Load data en wait to execute main function until all data is loaded
queue()
    .defer(d3.tsv, 'Data/overviewData.txt') // Data with background information
    .defer(d3.tsv, 'Data/alldata.txt') // Data of all texts
	.defer(d3.tsv, 'Data/emolabels.txt') // All emotion labels
    .await(main); // Wait for all data sets to be loaded to execute main function

// Shape overview data in correct format
function prepareData(overviewdata) {
	overviewdata.forEach(function(d) {
		d.aantal = +d.aantal; // Make integers of string
		d.jaar = +d.jaar;	// Make integers of string
})};

// Function to create a json file with the name of a given emotion
function addToJson(overviewdata, varname, dataToAdd) {
		dataToAdd[varname] = [] // Add name of given emotion
	overviewdata.forEach(function(d) {
		dataToAdd[varname].push({'jaar' : d.jaar, 'aantal' : 0}) // Set all counts 0 for every year
	})
	return dataToAdd
}

// Function to plot line 
function plotLine(plotdata, d, i) {

	// Add line
	svg.append("path")
		.datum(plotdata)
		.attr("class", "line")
		.attr("d", line)
		.attr("id", 'tag'+d.emolabels.replace(/\s+/g, ''))
		.style("opacity", 0) // Initial line is hidden
		.style('stroke', color(i));
	    
	// Add points to line
	svg.selectAll("dot")
    	.data(plotdata)
    .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.jaar); })
        .attr("cy", function(d) { return y(d.aantal); })
		.style("fill", color(i))
		.style("opacity", 0) // Initial points are hidden
		.attr("id", 'tag2'+d.emolabels.replace(/\s+/g, ''))
		.on("click", function(){
		});
	
	// Add legend
    svg.append("text")
        .attr("x", 900)
        .attr("y", 0 +14*i)
        .attr("class", "legend")
        .style("fill", color(i))
        .text(d.emolabels)
		.attr("id", 'tag3'+d.emolabels.replace(/\s+/g, ''))
		
		// Function when clicked on text
        .on("click", function(){	
			
			var active   = d.active ? false : true,
            newOpacityLine = active ? 0.4 : 0; // Line becomes visible when active 
			newOpacityCircle = active ? 1 : 0;  // Dots become visible when active
			newWeight = active ? 'bold' : 'normal';
			newDecoration = active ? 'underline' : 'none';
			
            // Hide or show the elements based on the ID
            d3.select("#tag"+d.emolabels.replace(/\s+/g, ''))
                .transition().duration(100)
                .style("opacity", newOpacityLine);
			d3.selectAll("#tag2"+d.emolabels.replace(/\s+/g, ''))
                .transition().duration(100)
                .style("opacity", newOpacityCircle);
            d3.select("#tag3"+d.emolabels.replace(/\s+/g, ''))
                .transition().duration(100)
                .style("text-decoration", newDecoration)
				.style("font-weight", newWeight);

            // Update whether or not the elements are active
            d.active = active;
            //updategraph()
			});
       
}

// ==================
// Still working on
// ==================
function updategraph() {
	console.log('werkt')
	d3.selectAll(".line")[0].forEach(function(d) {
		console.log('nummer')
	})
}
  
// Calculates relative frequency of all emotions
function calculateEmotions(overviewdata, alldata, emolabels, emolevel) {
	totalEmotions = countTotalEmotions(overviewdata, alldata, emolevel) // Counts total emotions
	var emoData = {} // Make empty JSON data to add emotions
	
	// Loops over all emotions
	emolabels.forEach(function(d,i) { 
	
		specEmotion = countSpecifiedEmotion(overviewdata, alldata, d.emolabels, emolevel, emoData); // Counts total of specific emotion
		plotdata = calculateRelativeFrequency(specEmotion, totalEmotions, d.emolabels) // Calculates frequency of specified emotion
	})
	return plotdata
}

// Function to determine the domain to plot
function determineDomain(plotdata, emolabels) {
		// Set first emotion data as x-domain
		var xDomain = d3.extent(plotdata[emolabels[0].emolabels], function(e) { return e.jaar; })

		// Loop over all emotions
		emolabels.forEach(function(d) {
			
			// Store min and max
			var tempDomain = d3.extent(plotdata[d.emolabels], function(e) { return e.jaar; })
			
			// Check if domain needs to be changed. If so, do
			if(tempDomain[0] < xDomain[0]){
				xDomain[0] = tempDomain[0]
			}
			if(tempDomain[1] > xDomain[1]){
				xDomain[1] = tempDomain[1]
			}			
		})
		
		// Set x-domain
		x.domain(xDomain);
		
		// Set first emotion data as y-domain
		var yDomain = d3.extent(plotdata[emolabels[0].emolabels], function(e) { return e.aantal; })

		// Loop over all emotions
		emolabels.forEach(function(d) {
			
			// Store min and max
			var tempDomain = d3.extent(plotdata[d.emolabels], function(e) { return e.aantal; })

			// Check if domain needs to be changed. If so, do
			if(tempDomain[0] < yDomain[0]){
				yDomain[0] = tempDomain[0]
			}
			if(tempDomain[1] > yDomain[1]){
				yDomain[1] = tempDomain[1]
			}			
		})
		
		// Set y-domain
		y.domain(yDomain);
}

// Count frequency of specified emotion
function countSpecifiedEmotion(overviewdata, alldata, emolabel, emolevel, dataToAdd) {
	
	
	jsondata = addToJson(overviewdata, emolabel, dataToAdd)
	
	// Loop over all data
	alldata.forEach(function(d) {

		// Check for specified emotion
		if(d.emolabel == emolabel && d.emolevel == emolevel) {
			
			// Loop over overview data
			overviewdata.forEach(function(e) {
				
				// Check for corresponding id
				if(e.id == d.id.substr(0,13)) {
					
					// Loop over data where the count is stored
					for (var key in jsondata[emolabel]) {
						
						// Add 1 to corresponding year
						if (jsondata[emolabel][key].jaar == e.jaar) {
							jsondata[emolabel][key].aantal = jsondata[emolabel][key].aantal + 1
						}
					}
				}})
			}
		});
	return jsondata
}

// Function to count total of emotions
function countTotalEmotions(overviewdata, alldata, emolevel) {
	var jsondataTotal = {}
	
	// Create object with counts of 0
	addToJson(overviewdata, 'total', jsondataTotal)
	
	// Loop over all data
	alldata.forEach(function(d) {

		if(d.emolevel == emolevel) {

			overviewdata.forEach(function(e) {
				
				// Check for corresponding id's
				if(e.id == d.id.substr(0,13)) {

					// Check for corresponding year and add 1 to count
					for (var key in jsondataTotal['total']) {
						if (jsondataTotal['total'][key].jaar == e.jaar) {
							jsondataTotal['total'][key].aantal = jsondataTotal['total'][key].aantal + 1
						}
					}
				}})
			}
		});

	return jsondataTotal
}

// Function to calculate relative frequency of specified emotion
function calculateRelativeFrequency(specifiedEmotion, totalEmotion, labels) {
	
	// Loop over counts of specified emotions
	for (var i in specifiedEmotion[labels]) {
		
		// If count is not 0, calculate the relative frequency
		if (specifiedEmotion[labels][i].aantal != 0) {
			specifiedEmotion[labels][i].aantal = (specifiedEmotion[labels][i].aantal / totalEmotion['total'][i].aantal * 100)
		}
	}
	return specifiedEmotion
}


// Main function
function main(error, overviewdata, alldata, emolabels) {

	prepareData(overviewdata)
	var labels = emolabels
	calculateEmotions(overviewdata, alldata, labels, 'Emotie')
	determineDomain(plotdata, emolabels)
	
	// Plot all emotions
	emolabels.forEach(function(d,i) { 
		plotLine(plotdata[d.emolabels], d, i)
	})

	// Set up axes
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




//=================================

// copied from d3 site to test

var diameter = 560,
    format = d3.format(",d")

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

window.onload = function() {

var svg = d3.select("#bubblegraph").append("svg")
    .attr("width", 2*diameter)
    .attr("height", diameter)
    .attr("class", "bubble");


	console.log('start1')
	root = createBubblecloudData([1746], plotdata, emolabels)
	console.log(root)
	console.log(plotdata)
var node = svg.selectAll(".node")
      .data(bubble.nodes(classes(root))
      .filter(function(d) {  return !d.children; }))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	
	console.log(node)
  node.append("title")
      .text(function(d) { return d.className + ": " + format(d.value); });

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d, i) {console.log(d.className); return color(i); })

  node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.className.substring(0, d.r / 3); });
	  console.log('Finish1')	
;



// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  var classes = [];

  function recurse(name, node) {
	  console.log(node)
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: name, className: node.name, value: node.size});
  }

  recurse(null, root);
  return {children: classes};
}

d3.select(self.frameElement).style("height", diameter + "px");




}
}

function calculateBubbleData(years, plotdata, emotion){
	var number = 0
	years.forEach(function(y) {
		console.log(y)
		plotdata[emotion].forEach(function(d) {
			if(d.jaar == y){
				number += d.aantal
				console.log(number)}
		})
	})
	return number/years.length
}

function createBubblecloudData(years, plotdata, emolabels) {
	var jsonData = {name: "Data", children: []}
	emolabels.forEach(function(d) { console.log(d)
		number = calculateBubbleData(years, plotdata, d.emolabels)
		jsonData.children.push({name:d.emolabels, size: Math.round(number * 100) / 100})
	})
	console.log(jsonData)
	return jsonData
}
