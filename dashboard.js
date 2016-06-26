var data = [];

// current workaround for multiple data loading 
// d3.json('data.json', function(error, data2009){
d3.json('https://health.data.ny.gov/resource/s8d9-z734.json', function(error, data2009){
d3.json('https://health.data.ny.gov/resource/dpew-wqcg.json', function(error, data2010){
d3.json('https://health.data.ny.gov/resource/n5y9-zanf.json', function(error, data2011){
d3.json('https://health.data.ny.gov/resource/rv8x-4fm3.json', function(error, data2012){
d3.json('https://health.data.ny.gov/resource/tdf6-7fpk.json', function(error, data2013){
d3.json('https://health.data.ny.gov/resource/pzzw-8zdv.json', function(error, data2014){

    // concatenate all data into one 
    data = data.concat(data2009);
    data = data.concat(data2010);
    data = data.concat(data2011);
    data = data.concat(data2012);
    data = data.concat(data2013);
    data = data.concat(data2014);

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

    //---------------------------------------------------------- Health Service Area
    var areaDim = ndx.dimension(function(d){return d.hospital_service_area ? d.hospital_service_area : "";});
    var countPerArea = areaDim.group().reduceCount();
    var areaChart = dc.pieChart('#chart-ring-area');   
    areaChart
        .width(150)
        .height(150)
        .dimension(areaDim)
        .group(countPerArea)
        .innerRadius(20);
    d3.selectAll('a#resetArea').on('click', function () {
        areaChart.filterAll();
        dc.redrawAll();
    });
    //---------------------------------------------------------- years
    var yearDim = ndx.dimension(dc.pluck('year'));
    var countPerYear = yearDim.group().reduceCount();
    var yearChart = dc.pieChart('#chart-ring-year');   
    yearChart
        .width(150)
        .height(150)
        .dimension(yearDim)
        .group(countPerYear)
        .innerRadius(20);
    d3.selectAll('a#resetYear').on('click', function () {
        yearChart.filterAll();
        dc.redrawAll();
    });
    //---------------------------------------------------------- day of week
    var dayDim = ndx.dimension(dc.pluck('discharge_day_of_week'));
    var countPerDay = dayDim.group().reduceCount();
    var dayChart = dc.pieChart('#chart-ring-day');  
    dayChart
        .width(150)
        .height(150)
        .dimension(dayDim)
        .group(countPerDay)
        .innerRadius(20)
        .ordering(function (d) {
            var order = {
                'MON': 0, 'TUE': 1, 'WED': 2, 'THU': 3,
                'FRI': 4, 'SAT': 5, 'SUN': 6
            }
            return order[d.key];
            }
        );
    d3.selectAll('a#resetWeekday').on('click', function () {
        dayChart.filterAll();
        dc.redrawAll();
    });
    //---------------------------------------------------------- length of stay
    var stayDim = ndx.dimension(dc.pluck('length_of_stay')); 
    var countPerStay = stayDim.group().reduceCount();
    var stayChart = dc.barChart('#chart-stay-count'),
        dataCount = dc.dataCount('#data-count');   
    stayChart
        .width(300)
        .height(180)
        .dimension(stayDim)
        .group(countPerStay)
        .x(d3.scale.linear().domain([0,10]))
        .elasticY(true)
        .centerBar(true)
        .barPadding(5)
        .xAxisLabel('Days of stay')
        .yAxisLabel('Count')
        .margins({top: 10, right: 20, bottom: 50, left: 50});
    stayChart.xAxis().tickValues([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    d3.selectAll('a#resetStay').on('click', function () {
        stayChart.filterAll();
        dc.redrawAll();
    });
    // count widget (count all records and selected)
    var all = ndx.groupAll();
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
})})})})})
;