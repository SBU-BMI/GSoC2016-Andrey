var data = [];

// current workaround for multiple data loading 
d3.json('data.json', function(error, data2009){
// d3.json('https://health.data.ny.gov/resource/s8d9-z734.json', function(error, data2009){
// d3.json('https://health.data.ny.gov/resource/dpew-wqcg.json', function(error, data2010){
// d3.json('https://health.data.ny.gov/resource/n5y9-zanf.json', function(error, data2011){
// d3.json('https://health.data.ny.gov/resource/rv8x-4fm3.json', function(error, data2012){
// d3.json('https://health.data.ny.gov/resource/tdf6-7fpk.json', function(error, data2013){
// d3.json('https://health.data.ny.gov/resource/pzzw-8zdv.json', function(error, data2014){

    // concatenate all data into one 
    data = data.concat(data2009);
    // data = data.concat(data2010);
    // data = data.concat(data2011);
    // data = data.concat(data2012);
    // data = data.concat(data2013);
    // data = data.concat(data2014);

    // data cleanup 
    var yearFormat = d3.time.format('%Y');
    var dayOfWeekFormat = d3.time.format('%a');
    _.each(data, function(d) {
        d.year = yearFormat(new Date(d.discharge_year));
        d.day = dayOfWeekFormat(new Date(d.discharge_day_of_week));
        d.length_of_stay = +d.length_of_stay;
    });

    // main magic!
    var ndx = crossfilter(data);

    // Below follows lot of controls.
    // Each code block creates: dimension, measures (counts per dimensions), chart init and configuration, reset button
    var createPieChart = function(name, orderingFunction){
        var dimension = ndx.dimension(function(d){return d[name] ? d[name] : "";});
        var counts = dimension.group().reduceCount();
        var chart = dc.pieChart('#' + name);   
        chart.width(150)
            .height(150)
            .dimension(dimension)
            .group(counts)
            .innerRadius(20);
        if (orderingFunction){
            chart.ordering(orderingFunction);
        }
        d3.selectAll('a#reset_' + name).on('click', function () {
            chart.filterAll();
            dc.redrawAll();
        });
    };

    var dayOfWeekOrdering = function (d) {
        return {'MON': 0, 'TUE': 1, 'WED': 2, 'THU': 3, 'FRI': 4, 'SAT': 5, 'SUN': 6}[d.key];
    };

    createPieChart('hospital_service_area');
    createPieChart('hospital_county');
    createPieChart('year');
    createPieChart('discharge_day_of_week', dayOfWeekOrdering);
    
    //---------------------------------------------------------- length of stay
    var stayDim = ndx.dimension(dc.pluck('length_of_stay')); 
    var countPerStay = stayDim.group().reduceCount();
    var stayChart = dc.barChart('#chart-stay-count');
    stayChart
        .width(300)
        .height(180)
        .dimension(stayDim)
        .group(countPerStay)
        .x(d3.scale.linear().domain([0,10]))
        .elasticY(true)
        .centerBar(true)
        .barPadding(5)
        .xAxisLabel('Value')
        .yAxisLabel('Count')
        .margins({top: 10, right: 20, bottom: 50, left: 50});
    stayChart.xAxis().tickValues([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    d3.selectAll('a#resetStay').on('click', function () {
        stayChart.filterAll();
        dc.redrawAll();
    });
    // count widget (count all records and selected)
    var all = ndx.groupAll();
    var dataCount = dc.dataCount('#data-count');   
    dataCount
        .dimension(ndx)
        .group(all);
    // reset all selections
    d3.selectAll('a#resetAll').on('click', function () {
        dc.filterAll();
        dc.renderAll();
    });
    // render all the things!
    dc.renderAll();
})
// })})})})})
;