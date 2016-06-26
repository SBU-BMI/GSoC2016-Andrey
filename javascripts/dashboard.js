d3.json('../data.json', function(error, data){
 
    var yearFormat = d3.time.format('%Y');

    _.each(data, function(d) {
        d.dischargeYear = yearFormat(new Date(d.discharge_year));
    });

    var ndx = crossfilter(data);

    var yearDim  = ndx.dimension(function(d) {return d.dischargeYear;});

    var all = ndx.groupAll();

    var countPerYear = yearDim.group().reduceCount();

    var yearChart   = dc.pieChart('#chart-ring-year');   
    
    yearChart
        .width(150)
        .height(150)
        .dimension(yearDim)
        .group(countPerYear)
        .innerRadius(20);

    
    dc.renderAll();
});