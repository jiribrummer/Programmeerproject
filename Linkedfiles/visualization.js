// ============================================
// Name				Jiri Brummer
// Student number	10277897
// Course			Programmeerproject

// University		University of Amsterdam
// ============================================


// =========================
// License
// =========================

//Copyright 2015 Jiri Brummer

//Licensed under the Apache License, Version 2.0 (the "License");
//you may not use this file except in compliance with the License.
//You may obtain a copy of the License at

    //http://www.apache.org/licenses/LICENSE-2.0

//Unless required by applicable law or agreed to in writing, software
//distributed under the License is distributed on an "AS IS" BASIS,
//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.


// =========================
// Global variables
// =========================

// Set up color range. Data from http://bl.ocks.org/DStruths/9c042e3a6b66048b5bd4	
var color = d3.scale.ordinal().range(["#48A36D",  "#56AE7C",  "#64B98C", "#72C39B", 
"#80CEAA", "#80CCB3", "#7FC9BD", "#7FC7C6", "#7EC4CF", "#7FBBCF", "#7FB1CF", "#80A8CE", 
"#809ECE", "#8897CE", "#8F90CD", "#9788CD", "#9E81CC", "#AA81C5", "#B681BE", "#C280B7", 
"#CE80B0", "#D3779F", "#D76D8F", "#DC647E", "#E05A6D", "#E16167", "#E26962", "#E2705C", 
"#E37756", "#E38457", "#E39158", "#E29D58", "#E2AA59", "#E0B15B", "#DFB95C", "#DDC05E", 
"#DBC75F", "#E3CF6D", "#EAD67C", "#F2DE8A"]);  

// Selected filter when entering site
var inputEmolevel = ["Lichaamsdeel"]


// =========================
// Main functions
// =========================

// Function to refesh all data when new filter is selected
function refreshAll(inputEmolevel) {

	// Load data en wait to execute main function until all data is loaded
	queue()
		.defer(d3.tsv, 'Data/overviewData_big.txt') // Data with background information
		.defer(d3.tsv, 'Data/alldata_big.txt') // Data of all texts
		.defer(d3.tsv, 'Data/emolabels.txt') // All emotion labels
		.await(main); // Wait for all data sets to be loaded to execute main function
	
	// Filter data with selected filter(s)	
	function filterEmolevel(alldata, filter) {
		filteredlist = []
		alldata.forEach(function(d) {
			filter.forEach(function(e) {
				if(d.emolevel == e) {
					filteredlist.push(d)
				}
			})
		})
		return(filteredlist)
	}
	
	// Visualization functions
	function main(error, overviewdata, alldata_raw, emolabels) {
		// Make copy of data so the raw data can be used for calculation
		// when domain of line graph is changed by interactivity
		alldata = filterEmolevel(alldata_raw, inputEmolevel)
		lineGraph(overviewdata, alldata, emolabels, inputEmolevel)
		createBrush(overviewdata, alldata, emolabels, '#bubblegraph1_brush')
		createBrush(overviewdata, alldata, emolabels, '#bubblegraph2_brush')
		bubbleClouds(emolabels, overviewdata, alldata, "#bubblegraph1", [1614, 1615, 1617, 1625, 1637])
		bubbleClouds(emolabels, overviewdata, alldata, "#bubblegraph2", [1780, 1785, 1788, 1791, 1797])
	}}
	
	// Call function on html page
	function changedFilter(id) {
		shouldAdd = "True"
		// Check if filter is already selected
		inputEmolevel.forEach(function(d, i){
			// If selected, remove from list and change appearence
			if(d == id) {
				inputEmolevel.splice(i, 1);
				shouldAdd = "False"
				document.getElementById(id).style.fontWeight = 'normal'
				document.getElementById(id).style.borderWidth = "0px"
				}
			})
			// If not selected, add to list and change appearence
			if(shouldAdd == "True"){
				inputEmolevel.push(id)
				document.getElementById(id).style.fontWeight = 'bold'
				document.getElementById(id).style.borderWidth = "3px"	
				document.getElementById(id).style.borderColor = "#800000"
				document.getElementById(id).style.borderStyle = "solid"		
				}
			// Check if any filter is selected. Only execute refresh if 
			// any filter is selected
			counter = 0
			inputEmolevel.forEach(function(f){
				counter += 1})
			if(counter > 0){
				// Remove current svg's before creating new ones
				d3.select("#linegraph").selectAll("svg").remove()
				d3.select("#bubblegraphcontainer").selectAll("svg").remove()
				refreshAll(inputEmolevel)
			}
}


// =========================
// Line graph
// =========================

function lineGraph(overviewdata, alldata, emolabels) {

	// Set up variables for line graph
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
	
	// Variable to store which lines are selected.
	var activeLines = []
	
	// Place SVG object in created div
	var svg = d3.select("#linegraph").append("svg")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom)
  	.append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	// Shape data in right form, calculate frequencies and determine domain
	prepareData(overviewdata)
	var labels = emolabels
	calculateEmotions(overviewdata, alldata, labels)
	determineDomain(plotdata, emolabels, x, y)
	
	// For every emotion, plot line
	emolabels.forEach(function(d,i) { 
		plotLine(plotdata[d.emolabels], d, i, plotdata, svg, line, x, y, activeLines, yAxis)
	})

	// Set up axes and legend
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
	  .attr("id", "y-axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Frequency (%)");
}

// Function to plot line 
function plotLine(plotdata, d, i, alldata, svg, line, x, y, activeLines, yAxis) {

	// Add line
	svg.append("path")
		.datum(plotdata)
		.attr("class", "line")
		.attr("d", line)
		// Every line gets unique id
		.attr("id", 'tag'+d.emolabels.replace(/\s+/g, ''))
		// Initially lines are hidden
		.style("opacity", 0) 
		.style('stroke', color(i));
	    
	// Add points to line
	svg.selectAll("dot")
    	.data(plotdata)
    .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.jaar); })
        .attr("cy", function(d) { return y(d.aantal); })
		.style("fill", color(i))
		//Initial points are hidden and points get unique id
		.style("opacity", 0) // 
		.attr("id", 'tag2'+d.emolabels.replace(/\s+/g, ''))
	
	// Add legend
    svg.append("text")
        .attr("x", 900)
        .attr("y", 0 +14*i)
        .attr("class", "legend")
        .style("fill", color(i))
        .text(d.emolabels)
		// Legend items get unique id
		.attr("id", 'tag3'+d.emolabels.replace(/\s+/g, ''))
		
		// Click function to make legend dynamic
        .on("click", function(){				
			var active   = d.active ? false : true,
			// Lines and dots become visible when clicked on
            newOpacityLine = active ? 0.4 : 0;
			newOpacityCircle = active ? 1 : 0; 
			newWeight = active ? 'bold' : 'normal';
			newDecoration = active ? 'underline' : 'none';
			
            // Hide or show the elements based on the id
            d3.select("#tag"+d.emolabels.replace(/\s+/g, ''))
                .transition().duration(100)
                .style("opacity", newOpacityLine);
			d3.selectAll("#tag2"+d.emolabels.replace(/\s+/g, ''))
                .transition().duration(100)
                .style("opacity", newOpacityCircle);
			
			// Change appearence of legenditem
            d3.select("#tag3"+d.emolabels.replace(/\s+/g, ''))
                .transition().duration(100)
                .style("text-decoration", newDecoration)
				.style("font-weight", newWeight);

            // Update list of activelines 
            d.active = active;
			if(d.active) {
				activeLines.push(d['emolabels'])
			}
			else {
				activeLines.splice(activeLines.indexOf(d['emolabels']),1)
			}
			
			// Determine new domain and adjust y axis
			determineDomain2(alldata,activeLines, x, y)
			d3.select("#y-axis")
            	.transition().duration(100)
				.call(yAxis)
			
			// Draw lines and circles
			activeLines.forEach(function(i){
            	d3.select("#tag"+i.replace(/\s+/g, ''))
					.attr('d', line)
				d3.selectAll('#tag2'+i.replace(/\s+/g, ''))
					.attr("cy", function(d) { return y(d.aantal); });
			})
		});
}

// Shape overview data in correct format
function prepareData(overviewdata) {
	overviewdata.forEach(function(d) {
		// Make integers of string
		d.aantal = +d.aantal; 
		d.jaar = +d.jaar;
	})
};

function addToJson(overviewdata, varname, dataToAdd) {
	dataToAdd[varname] = [] 
	overviewdata.forEach(function(d) {
		 // Set all counts 0 for every year
		dataToAdd[varname].push({'jaar' : d.jaar, 'aantal' : 0})
	})
	return dataToAdd
}
  
// Calculates relative frequency of all emotions
function calculateEmotions(overviewdata, alldata, emolabels) {
	// First Count total emotions
	totalEmotions = countTotalEmotions(overviewdata, alldata) 
	// Make empty JSON data to add emotions
	var emoData = {}
	emolabels.forEach(function(d,i) { 
		// Count number of givem emotion
		specEmotion = countSpecifiedEmotion(overviewdata, alldata, d.emolabels, emoData); 
		// Calculate reletive frequency
		plotdata = calculateRelativeFrequency(specEmotion, totalEmotions, d.emolabels)
	})
	return plotdata
}


function determineDomain(plotdata, emolabels, x, y) {
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
		
	// Do the same for y domain
	var yDomain = d3.extent(plotdata[emolabels[0].emolabels], function(e) { return e.aantal; })
	emolabels.forEach(function(d) {
		var tempDomain = d3.extent(plotdata[d.emolabels], function(e) { return e.aantal; })
		if(tempDomain[0] < yDomain[0]){
			yDomain[0] = tempDomain[0]
		}
		if(tempDomain[1] > yDomain[1]){
			yDomain[1] = tempDomain[1]
		}			
	})
	y.domain(yDomain);
}

// Same function as determineDomain, except the input is different
function determineDomain2(plotdata, emolabels, x, y) {
	// This line is different
	var xDomain = d3.extent(plotdata[emolabels[0]], function(e) { return e.jaar; })
	emolabels.forEach(function(d) {			
		var tempDomain = d3.extent(plotdata[d], function(e) { return e.jaar; })
		if(tempDomain[0] < xDomain[0]){
			xDomain[0] = tempDomain[0]
		}
		if(tempDomain[1] > xDomain[1]){
			xDomain[1] = tempDomain[1]
		}			
	})
	x.domain(xDomain);
		
	var yDomain = d3.extent(plotdata[emolabels[0]], function(e) { return e.aantal; })
		emolabels.forEach(function(d) {
			var tempDomain = d3.extent(plotdata[d], function(e) { return e.aantal; })
			if(tempDomain[0] < yDomain[0]){
				yDomain[0] = tempDomain[0]
			}
			if(tempDomain[1] > yDomain[1]){
				yDomain[1] = tempDomain[1]
			}			
		})
	y.domain(yDomain);
}

// Count frequency of specified emotion
function countSpecifiedEmotion(overviewdata, alldata, emolabel, dataToAdd) {
	// Make json format
	jsondata = addToJson(overviewdata, emolabel, dataToAdd)
	alldata.forEach(function(d) {
		// Check for specified emotion
		if(d.emolabel == emolabel) {
			// Loop over overview data
			overviewdata.forEach(function(e) {
				// Check for corresponding id
				if(e.id == d.id.substr(0,13)) {
					// Loop over data where the count is stored
					for (var key in jsondata[emolabel]) {
						// Add 1 to corresponding year
						if (jsondata[emolabel][key].jaar == e.jaar) {
							jsondata[emolabel][key].aantal += 1
						}
					}
				}})
			}
		});
	return jsondata
}

// Quite similar to specific emotion but is stored in different format
function countTotalEmotions(overviewdata, alldata) {
	var jsondataTotal = {}
	addToJson(overviewdata, 'total', jsondataTotal)
	alldata.forEach(function(d) {
		overviewdata.forEach(function(e) {
			if(e.id == d.id.substr(0,13)) {
				for (var key in jsondataTotal['total']) {
					if (jsondataTotal['total'][key].jaar == e.jaar) {
						jsondataTotal['total'][key].aantal += 1
					}
				}
			}
		})
	});
	return jsondataTotal
}

// Function to calculate relative frequency of specified emotion
function calculateRelativeFrequency(specifiedEmotion, totalEmotion, labels) {
	for (var i in specifiedEmotion[labels]) {
		// If count is not 0, calculate the relative frequency
		if (specifiedEmotion[labels][i].aantal != 0) {
			specifiedEmotion[labels][i].aantal = (specifiedEmotion[labels][i].aantal / totalEmotion['total'][i].aantal * 100)
		}
	}
	return specifiedEmotion
}


// =============================
// Burshes for bubble cloud
// =============================

function createBrush(overviewdata, alldata, emolabels, id) {
	// Get time data
	var data = []
	overviewdata.forEach(function(d) {
		data.push(d.jaar)
	})

	// Code below initially copied from d3 site but adjusted to work properly
	// Set up variables
	var margin = {top: 20, right: 50, bottom: 20, left: 50},
    width = 560 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

	var x = d3.scale.linear()
   	 	.range([0, width])
		.domain(d3.extent(data));

	var brush = d3.svg.brush()
    	.x(x)
    	.extent([.3, .5])
    	.on("brushstart", brushstart)
    	.on("brush", brushmove)
    	.on("brushend", brushend);

	// Add brush to svg element
	var svg = d3.select(id).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height/2 + ")")
		.call(d3.svg.axis().scale(x).orient("bottom"));

	var circle = svg.append("g").selectAll("circle")
		.data(data)
	  .enter().append("circle")
		.attr("transform", function(d) { return "translate(" + x(d) + "," + height / 2 + ")"; })
		.attr("id", function(d) {return d})
		.attr("r", 3.5);
	
	var brushg = svg.append("g")
		.attr("class", "brush")
		.call(brush);
		
	brushg.selectAll(".resize")
		.style('stroke', 1)
		.style('fill', "#666")
		.style('visibility', 'visible');

	brushg.selectAll("rect")
		.attr("height", height);
	
	brushstart();
	brushmove();
	
	function brushstart() {
	  svg.classed("selecting", true);
	}
	
	function brushmove() {
	  var s = brush.extent();
	  circle.classed("selected", function(d) { return s[0] <= d && d <= s[1]; });
	}
	
	// After brush is move, update data for wordcloud
	function brushend() {
		svg.classed("selecting", !d3.event.target.empty());  
		var itemlist = [];
		// Get all years that are selected with brush and store in itemlist
		var selected_elements = svg.selectAll(".selected")[0];
		selected_elements.forEach(function(d) {itemlist.push(d.id)}); 
		// Update bubbleclouds
		bubbleClouds(emolabels, overviewdata, alldata, id.substring(0, 13) , itemlist)
		// Remove current wordcloud, because data are changed.
		d3.select(id.substring(0, 13) + "Wordcloud").selectAll("svg").remove()
		}
}

// ============================
// Bubbleclouds
// ============================


function bubbleClouds(emolabels, overviewdata, alldata, id, years) {
	
	// Code initially copied from d3 site, but modified.
	// Set up variables
	var diameter = 560,
		format = d3.format(",d")
	
	var bubble = d3.layout.pack()
		.sort(null)
		.size([diameter, diameter])
		.padding(1.5);
	
	// Remove old bubble clouds
	d3.select(id).selectAll("svg").remove()  
	
	var svg = d3.select(id).append("svg")
		.attr("width", diameter)
		.attr("height", diameter)
		.attr("class", "bubble");
		
	// Create data for bubblecloud
	Data = createBubblecloudData(years, plotdata, emolabels)
		
	var node = svg.selectAll(".node")
		  .data(bubble.nodes(classes(Data))
		  .filter(function(d) {  return !d.children; }))
		.enter().append("g")
		  .attr("class", "node")
		  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		
	  node.append("title")
		  .text(function(d) {return d.className + ": " + d.value; });
	
	  node.append("circle")
		  .attr("r", function(d) { return d.r; })
		  .style("fill", function(d, i) {return color(i); })
		  .on("click", function(d, i){
			  	// function to create bubbleclouds based on the clicked emotion
		   		var inputwords = createwords(overviewdata, alldata, years, d.className)
				createWordcloud(inputwords, overviewdata, color(i), "#" + id.substring(1,13) + "Wordcloud")  
		  })
	
	  node.append("text")
		  .attr("dy", ".3em")
		  .style("text-anchor", "middle")
		  .text(function(d) { return (d.className + ": " + d.value + "%").substring(0, d.r / 3); })
		  .on("click", function(d, i){
				// Same as the circle node
				var inputwords = createwords(overviewdata, alldata, years, d.className)
				createWordcloud(inputwords, overviewdata, color(i), "#" + id.substring(1,13) + "Wordcloud") ;
		  })
	
	// This function literally copied from D3 bubble cloud
	// Returns a flattened hierarchy containing all leaf nodes under the Data.
	function classes(Data) {
	  var classes = [];
	  function recurse(name, node) {
		if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
		else classes.push({packageName: name, className: node.name, value: node.size});
	  }
	  recurse(null, Data);
	  return {children: classes};
	}
	d3.select(self.frameElement).style("height", diameter + "px");
}

// Calculates the frequencies of the selected years
function calculateBubbleData(years, plotdata, emotion){
	var number = 0
	years.forEach(function(y) {
		plotdata[emotion].forEach(function(d) {
			if(d.jaar == y){
				number += d.aantal
			}
		})
	})
	return number/years.length
}

// Shapes data in right form for bubble cloud
function createBubblecloudData(years, plotdata, emolabels) {
	var jsonData = {name: "Data", children: []}
	emolabels.forEach(function(d) {
		// For every emotion data is calculated and stored
		number = calculateBubbleData(years, plotdata, d.emolabels)
		jsonData.children.push({name:d.emolabels, size: Math.round(number * 100) / 100})
	})
	return jsonData
}

// Function to create wordclouds. Part form site of D3. 
function createWordcloud(words, overviewdata, emocolor, id) {
	d3.layout.cloud().size([560, 560])
    	.words(words.map(function(d) {
        	return {text: d, size: 20};
      	})
	)
   		.padding(1)
    	.rotate(function() { return ~~(Math.random()  * 20 - 10); })
    	.font("Impact")
    	.fontSize(function(d) { return d.size; })
    	.on("end", draw)
      .start();

	function draw(words) {
		// Remove old wordcloud and add new SVG  
		d3.select(id).selectAll("svg").remove()  
		d3.select(id).append("svg")
			.attr("width", 560)
			.attr("height", 560)
		  .append("g")
			.attr("transform", "translate(280,280)") 
		  .selectAll("text")
			.data(words)
		  .enter().append("text")
			.style("font-size", function(d) { return d.size + "px"; })
			.style("font-family", "Impact")
			.style("fill", emocolor)
			.attr("text-anchor", "middle")
			.attr("transform", function(d) {
			  return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
			})
			.text(function(d) { return d.text; });
  }
}

// Function to collect corresponsing words
function createwords(overviewdata, alldata, years, emotion){
	inputwords = []
	// For every year look to corresponsing emotion and collect tags
	years.forEach(function(d){
		overviewdata.forEach(function(e){
			if(d==e.jaar) {
				alldata.forEach(function(f){
					if(e.id == f.id.substr(0,13) && emotion == f.emolabel){
						inputwords.push(f.tag)
					}
				})
			}
		})
	})
	return inputwords
}


// =========================
// Initialize script
// =========================

// Executes script
refreshAll(inputEmolevel)