// JavaScript Document



// copied from d3 website to test

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%d-%b-%y").parse;

var x = d3.time.scale()
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
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

var svg = d3.select("#linegraph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



d3.tsv("Data/overviewData.txt", function(error, overviewdata) {
	overviewdata.forEach(function(d) {
		d.ID = + d.ID	;
		console.log(d.ID);
    	d.Jaar = +d.Jaar;


	  
  });
  console.log('nu');
console.log(overviewdata[1]);
console.log('nu2');
})


	  
//	  d3.tsv("Data/testdata.txt", function(error, data) {
//	console.log('Hier');
//  data.forEach(function(d) {
//	  	console.log(d.id);
//		console.log(d.id.substr(0,12));
//		  console.log(o.id);
//		  console.log('check');

  //})
	//  })

	  
	  
d3.tsv("Data/testdata.txt", function(error, data) {
	console.log('Hier')
  data.forEach(function(d) {
	  console.log(data[0])
    d.date = parseDate(d.date);
    d.close = +d.close;
  });
	console.log(data[1])
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain(d3.extent(data, function(d) { return d.close; }));

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Price ($)");

  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);
});
