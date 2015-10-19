console.log("Assignment 3");

//Set up drawing environment with margin conventions
var margin = {t:20,r:20,b:50,l:50};
var width = document.getElementById('plot').clientWidth - margin.l - margin.r,
    height = document.getElementById('plot').clientHeight - margin.t - margin.b;

var plot = d3.select('#plot')
    .append('svg')
    .attr('width',width + margin.l + margin.r)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','plot-area')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//Start importing data
d3.csv('/data/world_bank_2012.csv', parse, dataLoaded); //import data from csv, create an assessor function called parse, and a callback called dataLoaded.

function parse(d){   //parse creates array d from the csv file, with d.heading pointers to grab individual object properties

    //Eliminate records for which gdp per capita isn't available

    //Check "primary completion" and "urban population" columns
    //if figure is unavailable and denoted as "..", replace it with undefined
    //otherwise, parse the figure into numbers

    if (d['GDP per capita, PPP (constant 2011 international $)']=='..') {
        return;
    }


    return {
        pComplete: d["Primary completion rate, total (% of relevant age group)"]!='..'? +d["Primary completion rate, total (% of relevant age group)"]:undefined,
        urbPop: +d['Urban population (% of total)']!='..'? +d['Urban population (% of total)']:undefined,
        gdpPerCap:+d['GDP per capita, PPP (constant 2011 international $)']!='..'? +d['GDP per capita, PPP (constant 2011 international $)']:undefined
    };



}

function dataLoaded(error, rows){   //uses input array error, and data array called rows.
    //with data loaded, we can now mine the data

    var minpComplete = d3.min(rows, function(e){return e.pComplete}); //function argument name is arbitrary- not related to d above!
    var maxpComplete = d3.max(rows, function(e){return e.pComplete});
    console.log(rows, maxpComplete, minpComplete);

    var minurbPop = d3.min(rows, function(f){return f.urbPop}); //function argument name is arbitrary- not related to d above!
    var maxurbPop = d3.max(rows, function(f){return f.urbPop});
    console.log(rows, maxurbPop, minurbPop);


    var minGdpPerCap = d3.min(rows, function(f){return f.gdpPerCap}); //function argument name is arbitrary- not related to d above!
    var maxGdpPerCap = d3.max(rows, function(f){return f.gdpPerCap});
    console.log(rows, maxGdpPerCap, minGdpPerCap);
    //with mined information, set up domain and range for x and y scales
    //Log scale for x, linear scale for y
    //scaleX = d3.scale.log()...


//dummy numbers need to be replaced once data domain is known!
    var scaleX = d3.scale.log().domain([minGdpPerCap,maxGdpPerCap]).range([0,width]),
        scaleY = d3.scale.linear().domain([0,maxpComplete]).range([height,0]);

//Initialize axes to the selected group
//Consult documentation here https://github.com/mbostock/d3/wiki/SVG-Axes
    var axisX = d3.svg.axis()
        .orient('bottom')
        .tickSize(-height)
        .tickValues([0,1e+4,5e+4,1e+5])
        .scale(scaleX);
    var axisY = d3.svg.axis()
        .orient('left')
        .tickSize(-width)
        .tickValues([0,25,50,75,100])
        .scale(scaleY);

    //Draw axisX and axisY


//move to dataLoaded when done - here for setup and debugging only!
    plot.append('g')
        .attr('class','axis axis-x')
        .attr('transform','translate('+0+','+height+')')
        .call(axisX);

    plot.append('g')
        .attr('class','axis axis-y')
        .call(axisY);



    //draw <line> elements to represent countries
    //each country should have two <line> elements, nested under a common <g> element

    rows.forEach(function(element,index)
    {
        varLineGroup = plot.append('g');

        if (element.pComplete) {

            varLineGroup.append('line')
                .attr('class', 'line')
                .attr('x1', scaleX(element.gdpPerCap))
                .attr('y1', scaleY(0))
                .attr('x2', scaleX(element.gdpPerCap))
                .attr('y2', scaleY(element.pComplete))
                .attr('stroke', 'red')
                .attr('stroke-weight', 3);
        }

        if (element.urbPop) {
            varLineGroup.append('line')
                .attr('class', 'line')
                .attr('x1', scaleX(element.gdpPerCap))
                .attr('y1', scaleY(0))
                .attr('x2', scaleX(element.gdpPerCap))
                .attr('y2', scaleY(element.urbPop))
                .attr('stroke', 'blue')
                .attr('stroke-weight', 3);
        }

    })
}

