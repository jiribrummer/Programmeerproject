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
	
var activeLines = []
	
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
    .defer(d3.tsv, 'Data/overviewData_big.txt') // Data with background information
    .defer(d3.tsv, 'Data/alldata_big.txt') // Data of all texts
	.defer(d3.tsv, 'Data/emolabels.txt') // All emotion labels
    .await(main); // Wait for all data sets to be loaded to execute main function

// Shape overview data in correct format
function prepareData(overviewdata) {
	console.log(overviewdata)
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
function plotLine(plotdata, d, i, alldata) {

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
			
			console.log(plotdata)
			
			var active   = d.active ? false : true,
			

            newOpacityLine = active ? 0.4 : 0; // Line becomes visible when active 
			newOpacityCircle = active ? 1 : 0;  // Dots become visible when active
			newWeight = active ? 'bold' : 'normal';
			newDecoration = active ? 'underline' : 'none';
			//activeLines = active ? activeLines.push(d[emolabels]) : activeLines.push(d[emolabels]);
			
            // Hide or show the elements based on the ID
			console.log(d.emolabels)
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
			console.log(d.active);
			if(d.active) {
				console.log('nu actief')
				console.log(activeLines)
				activeLines.push(d['emolabels'])
				console.log(activeLines)
			}
			else {
				activeLines.splice(activeLines.indexOf(d['emolabels']),1)
			}
			determineDomain2(alldata,activeLines)
			console.log(y.domain)
			d3.select("#y-axis")
            .transition().duration(100)
			.call(yAxis)
			activeLines.forEach(function(i){
				console.log(i);
            	d3.select("#tag"+i.replace(/\s+/g, ''))
				.attr('d', line)
				d3.selectAll('#tag2'+i.replace(/\s+/g, ''))
				.attr("cy", function(d) { return y(d.aantal); });
			})

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
		console.log(emolabels[0])
		console.log(plotdata)
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


// Function to determine the domain to plot
function determineDomain2(plotdata, emolabels) {
		// Set first emotion data as x-domain
		console.log(emolabels[0])
		console.log(plotdata)
		var xDomain = d3.extent(plotdata[emolabels[0]], function(e) { return e.jaar; })

		// Loop over all emotions
		emolabels.forEach(function(d) {
			
			// Store min and max
			var tempDomain = d3.extent(plotdata[d], function(e) { return e.jaar; })
			
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
		var yDomain = d3.extent(plotdata[emolabels[0]], function(e) { return e.aantal; })

		// Loop over all emotions
		emolabels.forEach(function(d) {
			
			// Store min and max
			var tempDomain = d3.extent(plotdata[d], function(e) { return e.aantal; })

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
	console.log(overviewdata)
	prepareData(overviewdata)
	var labels = emolabels
	calculateEmotions(overviewdata, alldata, labels, 'Emotie')
	determineDomain(plotdata, emolabels)
	
	// Plot all emotions
	emolabels.forEach(function(d,i) { 
		plotLine(plotdata[d.emolabels], d, i, plotdata)
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
	  .attr("id", "y-axis")
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

var svg = d3.select("#bubblegraph1").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");


	console.log('start1')
	var years1 = [1746]
	root = createBubblecloudData(years1, plotdata, emolabels)
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
      .text(function(d) {return d.className + ": " + d.value; });

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d, i) {return color(i); })
	  .on("click", function(d, i){
		  console.log(d.className)
		  console.log(color(i))
		  console.log('wc1')
		  console.log(years1)
		var inputwords = createWords2(overviewdata, alldata, years1, d.className)
		console.log(inputwords)
		createWordcloud(inputwords, color(i), "#wordcloud1")  
	  })

  node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .text(function(d) { return (d.className + ": " + d.value).substring(0, d.r / 3); })
	  .on("click", function(d, i){
		  console.log(d.className)
		  console.log(color(i))
		  console.log('wc1')
		  console.log(years1)
		var inputwords = createWords2(overviewdata, alldata, years1, d.className)
		console.log(inputwords)
		createWordcloud(inputwords, color(i), "#wordcloud1") ;
	  })
	  console.log('Finish1')	
;

var svg = d3.select("#bubblegraph2").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

	years2 = [1754]
	console.log('start1')
	root = createBubblecloudData(years2, plotdata, emolabels)
	console.log(root)
	console.log(plotdata)
	console.log
var node = svg.selectAll(".node")
      .data(bubble.nodes(classes(root))
      .filter(function(d) {  return !d.children; }))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	
	console.log(node)
  node.append("title")
      .text(function(d) {return d.className + ": " + d.value; });

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d, i) {return color(i); })
	  .on("click", function(d, i){
		var inputwords = createWords2(overviewdata, alldata, years2, d.className)
		console.log(inputwords)
		console.log('wc2')
		console.log(years2)
		createWordcloud(inputwords, color(i), "#wordcloud2")  
	  })

  node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .text(function(d) { return (d.className + ": " + d.value).substring(0, d.r / 3); });
	  console.log('Finish1')	
;


// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  var classes = [];

  function recurse(name, node) {
	  //console.log(node)
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: name, className: node.name, value: node.size});
  }

  recurse(null, root);
  return {children: classes};
}

d3.select(self.frameElement).style("height", diameter + "px");





console.log('klaarnu')

createbrush(overviewdata)

}
}



function calculateBubbleData(years, plotdata, emotion){
	var number = 0
	years.forEach(function(y) {
		//console.log(y)
		plotdata[emotion].forEach(function(d) {
			if(d.jaar == y){
				number += d.aantal
				//console.log(number)
				}
		})
	})
	return number/years.length
}

function createBubblecloudData(years, plotdata, emolabels) {
	var jsonData = {name: "Data", children: []}
	emolabels.forEach(function(d) {
		number = calculateBubbleData(years, plotdata, d.emolabels)
		jsonData.children.push({name:d.emolabels, size: Math.round(number * 100) / 100})
	})
	console.log(jsonData)
	return jsonData
}

function createWords(input) {
	words = []
	input.forEach(function(d) {words.push(d['emolabels'])})
	console.log(words)
	return words
}


function createWordcloud(words, emocolor, id) {



  d3.layout.cloud().size([560, 560])
      .words(words.map(function(d) {
        return {text: d, size: 20};
      }))
      .padding(1)
      .rotate(function() { return ~~(Math.random()  * 20 - 10); })
      .font("Impact")
      .fontSize(function(d) { return d.size; })
      .on("end", draw)
      .start();

  function draw(words) {
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





function createWords2(overviewdata, alldata, years, emotion){
	inputwords = []
	console.log(years)
	console.log(overviewdata)
	console.log(alldata)
	years.forEach(function(d){
		//console.log(d)
		//console.log(overviewdata)
		overviewdata.forEach(function(e){
			if(d==e.jaar) {
				//console.log(e.id)
				alldata.forEach(function(f){
					if(e.id == f.id.substr(0,13) && emotion == f.emolabel){
						//console.log(f.tag)
						inputwords.push(f.tag)
					}
				})
			}
		})
	})
	console.log(inputwords)
	return inputwords
}



// =============================
// Burshes for bubble cloud
// =============================

console.log('newstart')
function createbrush(overviewdata) {
console.log('restart')
console.log(overviewdata)
var data = []

overviewdata.forEach(function(d) {
	data.push(d.jaar)
})

console.log(data)


var margin = {top: 20, right: 50, bottom: 20, left: 50},
    width = 560 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width])
	.domain(d3.extent(data));
	
console.log(x.range)


var brush = d3.svg.brush()
    .x(x)
    .extent([.3, .5])
    .on("brushstart", brushstart)
    .on("brush", brushmove)
    .on("brushend", brushend);

var svg = d3.select("#bubblegraph1_brush").append("svg")
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
	//.style('visibility', 'visible')
	
console.log(data)

brushstart();
brushmove();

function brushstart() {
  svg.classed("selecting", true);
}

function brushmove() {
  var s = brush.extent();
  circle.classed("selected", function(d) { return s[0] <= d && d <= s[1]; });
}

function brushend() {
  svg.classed("selecting", !d3.event.target.empty());
  console.log('1');
  
  console.log(svg.selectAll(".selected"))
  //.forEach(function(d){console.log(d#)})
  console.log('2');

}

}