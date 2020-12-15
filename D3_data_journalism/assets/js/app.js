// @TODO: YOUR CODE HERE!

//define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

//define chart margins as an object
var margin = {
    top:60,
    right:60,
    bottom:60,
    left:60
};

//chart dimensions
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

//select body, append SVG, set dimensions
var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

//group area, set its margins
var chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

//default axis titles
var defaultXAxis = "poverty";
var defaultYAxis = "healthcare";

//update xscale on click
function updateXScale(data, xaxis){
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d=>d[xaxis])* .7, d3.max(data, d=>d[xaxis])*1.3])
        .range([0, chartWidth]);

    return xLinearScale;
}

//update yscale on click
function updateYScale(data, yaxis){
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d=>d[yaxis])* .7, d3.max(data, d=>d[yaxis])*1.3])
        .range([chartHeight, 0]);

    return yLinearScale;
}

//update xaxis on click
function updateXAxis(xscale, xaxis){
    var xAxis = d3.axisBotttom(xscale);

    xaxis.transition().duration(1000).call(xAxis);

    return xAxis;
}

//update yaxis on click
function updateYAxis(yscale, yaxis){
    var yAxis = d3.axisLeft(yscale);

    yaxis.transition().duration(1000).call(yAxis);

    return yAxis;
}

//update circles on click
function updateCircles(circleGroup, xscale, xaxis, yscale, yaxis){
    circleGroup.transition()
        .duration(1000)
        .attr("cx", d => xscale(d[xaxis]))
        .attr("cy", d=>yscale(d[yaxis]));

    return circleGroup;
}

//update text on click
function updateText(textGroup,xscale, xaxis, yscale, yaxis){
    textGroup.transition()
        .duration(1000)
        .attr("x", d => xscale(d[xaxis]))
        .attr("y", d=>yscale(d[yaxis]));

    return textGroup;
}

//stylize x values for tooltips
function styleX(value, xAxis){
    //change based on variable chosen
    if(xAxis === 'poverty'){
        return `${value}%`;
    } else if(xAxis === 'income'){
        return `$${value}`;
    } else{
        return `${value}`;
    }

}

//updating circles group with new tooltip
function updateToolTip(xaxis, yaxis, circleGroup) {

    //select x label
    if (xaxis === 'poverty') {
        var xLabel = "Poverty:";
    }
    else if (xaxis === 'income') {
        var xLabel = "Median Income:";
    }
    else {
        var xLabel = "Age:";
    }

    //select y label
    if (yaxis === 'healthcare') {
        var yLabel = "No Healthcare:"
    }
    else if (yaxis === 'obesity') {
        var yLabel = "Obesity:"
    }
    else {
        var yLabel = "Smokers:"
    }

    //create tooltip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
            return (`${d.state}<br>${xLabel} ${styleX(d[defaultXAxis], defaultXAxis)}<br>${yLabel} ${d[defaultYAxis]}%`);
        });

    circleGroup.call(toolTip);

    //add events
    circleGroup.on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);

    return circleGroup;
}

//Import data from csv, and create chart
d3.csv("./assets/data/data.csv").then(function(data){

    console.log(data);

    //parse data
    data.forEach(function(d){
        d.obesity = + d.obesity;
        d.income = + d.income;
        d.smokes = + d.smokes;
        d.age = + d.age;
        d.healthcare = + d.healthcare;
        d.poverty = + d.poverty;
    });

    //create scales
    var xscale = updateXScale(data, defaultXAxis);
    var yscale = updateYScale(data, defaultYAxis);

    //axis functions
    var bottomAxis = d3.axisBotttom(xscale);
    var leftAxis = d3.axisLeft(yscale);

    //append x&y axis
    var xAxis = chartGroup.append("g").classed("translate", `translate(0, ${chartHeight})`).call(bottomAxis);
    var yAxis = chartGroup.append("g").classed("y-axis", true).call(leftAxis);

    //append initial circles
    var circleGroup = chartGroup.selectAll("circle")
                                .data(data)
                                .enter()
                                .append("circle")
                                .classed("stateCircle", true)
                                .attr("cx", dx => xLinearScale(dx[defaultXAxis]))
                                .attr("cy", dy => yLinearScale(dy[defaultYAxis]))
                                .attr("r", 8)
                                .attr("opacity", ".4");

    //append initial text
    var textGroup = chartGroup.selectAll(".stateText")
                                .data(data)
                                .enter()
                                .append("text")
                                .classed("stateText", true)
                                .attr("cx", dx => xLinearScale(dx[defaultXAxis]))
                                .attr("cy", dy => yLinearScale(dy[defaultYAxis]))
                                .text(function(d){ return d.abbr });

    var xLabelGroup = chartGroup.append("g").attr("transform", `translate(${chartWidth/2}, ${chartHeight + margin.top})`);

    var povertyLabel = xLabelGroup.append("text")
                                .classed("active", true)
                                .attr("x", 0)
                                .attr("y", 20)
                                .attr("value", "poverty")
                                .text("Poverty (%)");

    var ageLabel = xLabelGroup.append("text")
                            .classed("inactive", true)
                            .attr("x", 0)
                            .attr("y", 40)
                            .attr("value", "age")
                            .text("Median Age (yrs)");

    var incomeLabel = xLabelGroup.append("text")
                                .classed("inactive", true)
                                .attr("x", 0)
                                .attr("y", 60)
                                .attr("value", "income")
                                .text("Median Household Income");

    var yLabelGroup = chartGroup.append("g").attr("transform", `translate(${0}, ${chartHeight/2})`);

    var healthcareLabel = yLabelGroup.append("text")
                                .classed("active", true)
                                .attr("x", 0)
                                .attr("y", 0-20)
                                .attr("value", "healthcare")
                                .text("Lacking Healthcare (%)");

    var smokesLabel = yLabelGroup.append("text")
                            .classed("inactive", true)
                            .attr("x", 0)
                            .attr("y", 0-40)
                            .attr("value", "smokes")
                            .text("Smokes (%)");

    var obesityLabel = yLabelGroup.append("text")
                                .classed("inactive", true)
                                .attr("x", 0)
                                .attr("y", 0-60)
                                .attr("value", "obesity")
                                .text("Obese (%)");
    
    var circleGroup = updateToolTip(defaultXAxis, defaultYAxis, circleGroup)

    //xaxis listener
    xLabelGroup.selectAll("text").on("click", function(){
        //get value
        var value = d3.select(this).attr("value");

        //if value is not current xAxis
        if(value != defaultXAxis){
            //update
            defaultXAxis = value;
            xLinearScale = updateXScale(data, defaultXAxis);
            xAxis = updateXAxis(xLinearScale, xAxis);
            circleGroup = updateCircles(circleGroup, xLinearScale, defaultXAxis, yLinearScale, defaultYAxis);
            textGroup = updateText(textGroup, xLinearScale, defaultXAxis, yLinearScale, defaultYAxis);
            
            //update tooltips
            circleGroup = updateToolTip(defaultXAxis, defaultYAxis, circleGroup);

            //update status of each label from active to inactive/inactive to active depending on case
            if(defaultXAxis == "poverty"){
                povertyLabel.classed("active", true).classed("inactive", false);
                ageLabel.classed("active", false).classed("inactive", true);
                incomeLabel.classed("active", false).classed("inactive", true);
            }else if(defaultXAxis == "age"){
                povertyLabel.classed("active", false).classed("inactive", true);
                ageLabel.classed("active", true).classed("inactive", false);
                incomeLabel.classed("active", false).classed("inactive", true);
            }else{
                povertyLabel.classed("active", false).classed("inactive", true);
                ageLabel.classed("active", false).classed("inactive", true);
                incomeLabel.classed("active", true).classed("inactive", false);
            }
        }
    });

    //yaxis listener
    yLabelGroup.selectAll("text").on("click", function(){
        //get value
        var value = d3.select(this).attr("value");

        //if value is not current yAxis
        if(value != defaultYAxis){
            //update
            defaultYAxis = value;
            yLinearScale = updateYScale(data, defaultYAxis);
            yAxis = updateYAxis(yLinearScale, yAxis);
            circleGroup = updateCircles(circleGroup, xLinearScale, defaultXAxis, yLinearScale, defaultYAxis);
            textGroup = updateText(textGroup, xLinearScale, defaultXAxis, yLinearScale, defaultYAxis);
            
            //update tooltips
            circleGroup = updateToolTip(defaultXAxis, defaultYAxis, circleGroup);

            //update status of each label from active to inactive/inactive to active depending on case
            if(defaultYAxis == "obesity"){
                obesityLabel.classed("active", true).classed("inactive", false);
                smokesLabel.classed("active", false).classed("inactive", true);
                healthcareLabel.classed("active", false).classed("inactive", true);
            }else if(defaultYAxis == "smokes"){
                obesityLabel.classed("active", false).classed("inactive", true);
                smokesLabel.classed("active", true).classed("inactive", false);
                healthcareLabel.classed("active", false).classed("inactive", true);
            }else{
                obesityLabel.classed("active", false).classed("inactive", true);
                smokesLabel.classed("active", false).classed("inactive", true);
                healthcareLabel.classed("active", true).classed("inactive", false);
            }
        }
    });
});