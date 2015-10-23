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

    //Eliminate records for which gdp per capita isn't available by exiting the function for that row of the table

    if (d['GDP per capita, PPP (constant 2011 international $)']=='..') {
        return;
    }

    //Check "primary completion" and "urban population" columns
    //if figure is unavailable and denoted as "..", replace it with undefined
    //otherwise, parse the figure into numbers

    return {
        //Use ternary logic to check whether the variable entries are equal to the ".." string. Return # or undefined accordingly
        pComplete: d["Primary completion rate, total (% of relevant age group)"]!='..'? +d["Primary completion rate, total (% of relevant age group)"]:undefined,
        urbPop: +d['Urban population (% of total)']!='..'? +d['Urban population (% of total)']:undefined,
        gdpPerCap:+d['GDP per capita, PPP (constant 2011 international $)']!='..'? +d['GDP per capita, PPP (constant 2011 international $)']:undefined
    };

}

function dataLoaded(error, rows) {   //uses input array error, and data array called rows.
                                     //with data loaded, we can now mine the data

    // save the result of d3.min in a variable for later use. Function is an anonymous function used locally,
    // that uses input e (the rows array, in this case) and returns its .pComplete variable.
    // Function argument name is arbitrary- not related to d above!
    var minpComplete = d3.min(rows, function (e) {
        return e.pComplete
    });
    var maxpComplete = d3.max(rows, function (e) {
        return e.pComplete
    });
    //write result to console to make sure it makes sense
    console.log(rows, maxpComplete, minpComplete);

    var minurbPop = d3.min(rows, function (f) {
        return f.urbPop
    });
    var maxurbPop = d3.max(rows, function (f) {
        return f.urbPop
    });
    console.log(rows, maxurbPop, minurbPop);


    var minGdpPerCap = d3.min(rows, function (f) {
        return f.gdpPerCap
    });
    var maxGdpPerCap = d3.max(rows, function (f) {
        return f.gdpPerCap
    });
    console.log(rows, maxGdpPerCap, minGdpPerCap);
    //with mined information, set up domain and range for x and y scales
    //Log scale for x, linear scale for y
    //scaleX = d3.scale.log()...


//Set X and Y scale using the min and max information above, and map onto the width and height of the parent element.
//Note that the log scale cannot have a domain value of 0.
    var scaleX = d3.scale.log().domain([minGdpPerCap, maxGdpPerCap]).range([0, width]),
        scaleY = d3.scale.linear().domain([0, 150]).range([height, 0]);

//Initialize axes to the selected group
//Consult documentation here https://github.com/mbostock/d3/wiki/SVG-Axes

    //Use a variable to save selection for future use. Use svg.axis to set axis properties
    var axisX = d3.svg.axis()
        .orient('bottom')
        .tickSize(-height) //needs to be negative because oriented toward bottom.
        .tickValues([1e+4, 5e+4, 1e+5])//logarithmic axis can't handle a zero - leave out, as Y axis has a zero label anyway
        .scale(scaleX);

    var axisY = d3.svg.axis()
        .orient('left')
        .tickSize(-width)
        .tickValues([0, 25, 50, 75, 100])
        .scale(scaleY);

    //add a group to the plot, create an axis within that group, and translate it to the right place. Call axis to create X and Y axes
    plot.append('g')
        .attr('class','axis axis-x')
        .attr('transform','translate('+0+','+height+')')
        .call(axisX);

    plot.append('g')
        .attr('class','axis axis-y')
        .call(axisY);



    //draw <line> elements to represent countries
    //each country should have two <line> elements, nested under a common <g> element

    //Append a new group to the plot and create a variable handle for future access. Give group class "countries"
    var countries = plot.append('g')
        .attr('class','countries');

    //Use selectAll to select the new group, and join it to the rows array containing the parsed data
    //Once joined, append a new group to each object in the array, of class "country" (should make one for each country in the list)
    //Store selection in a variable for later use.
    var countryGroups = countries.selectAll('g')
        .data(rows)
        .enter()
        .append('g')
        .attr('class', "country");

    //Append a line of class "primaryCompletion" to each country group from the previous step.
    countryGroups.append('line')
        .attr('class', 'primaryCompletion')
        //note that scaleX can only operate on d.gdpPerCap when it's _inside_ the anonymous function. Otherwise, returns an error.
        //set line x and y values according to the data stored in the rows array.
        .attr('x1', function(d) { return scaleX(d.gdpPerCap); })
        .attr('y1', scaleY(0))
        .attr('x2', function(d) { return scaleX(d.gdpPerCap); })
        //here, use an if statement to check that there really is a value for pComplete before plotting
        //(otherwise, undefined values returns a y coordinate of zero, which puts it at the top of the screen)
        .attr('y2', function(d) { if (d.pComplete) {return scaleY(d.pComplete); } else{return scaleY(0);} })
        //set color and stroke weight for line (could also do this in the css)
        .attr('stroke', 'red')
        .attr('stroke-weight', 3);

    //return the selection to the group level, and append a second line with different properties.
    countryGroups.append('line')
        .attr('class', 'urbanPopulation')
        .attr('x1', function(d) { return scaleX(d.gdpPerCap); })
        .attr('y1', scaleY(0))
        .attr('x2', function(d) { return scaleX(d.gdpPerCap); })
        .attr('y2', function(d) { if (d.urbPop) {return scaleY(d.urbPop); } else{return scaleY(0);} })
        .attr('stroke', 'blue')
        .attr('stroke-weight', 3);

    console.log(function(d) { return d.gdpPerCap; });

    /*Previous method for populating chart (uses forEach instead of selectAll)

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

  */
}

