var data = [];

d3.json('https://health.data.ny.gov/resource/s8d9-z734.json', function(error, data2009){
d3.json('https://health.data.ny.gov/resource/dpew-wqcg.json', function(error, data2010){
d3.json('https://health.data.ny.gov/resource/n5y9-zanf.json', function(error, data2011){
d3.json('https://health.data.ny.gov/resource/rv8x-4fm3.json', function(error, data2012){
d3.json('https://health.data.ny.gov/resource/tdf6-7fpk.json', function(error, data2013){
d3.json('https://health.data.ny.gov/resource/pzzw-8zdv.json', function(error, data2014){

    data = data.concat(data2009);
    data = data.concat(data2010);
    data = data.concat(data2011);
    data = data.concat(data2012);
    data = data.concat(data2013);
    data = data.concat(data2014);

    var yearFormat = d3.time.format('%Y'),
        dayOfWeekFormat = d3.time.format('%a');


    _.each(data, function(d) {
        d.year = yearFormat(new Date(d.discharge_year));
        d.day = dayOfWeekFormat(new Date(d.discharge_day_of_week));
        d.length_of_stay = +d.length_of_stay;
    });

    var ndx = crossfilter(data);

    var yearDim = ndx.dimension(dc.pluck('year')),
        dayDim = ndx.dimension(dc.pluck('discharge_day_of_week')),
        stayDim = ndx.dimension(dc.pluck('length_of_stay')); 

    var all = ndx.groupAll();

    var countPerYear = yearDim.group().reduceCount(),
        countPerDay = dayDim.group().reduceCount(),
        countPerStay = stayDim.group().reduceCount();

    var yearChart = dc.pieChart('#chart-ring-year'),   
        dayChart = dc.pieChart('#chart-ring-day'),   
        stayChart = dc.barChart('#chart-stay-count'),
        dataCount = dc.dataCount('#data-count');   
    
    yearChart
        .width(150)
        .height(150)
        .dimension(yearDim)
        .group(countPerYear)
        .innerRadius(20);

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

    dataCount
        .dimension(ndx)
        .group(all);

    d3.selectAll('a#resetAll').on('click', function () {
        dc.filterAll();
        dc.renderAll();
    });

    d3.selectAll('a#resetYear').on('click', function () {
        yearChart.filterAll();
        dc.redrawAll();
    });

    d3.selectAll('a#resetWeekday').on('click', function () {
        dayChart.filterAll();
        dc.redrawAll();
    });

    d3.selectAll('a#resetStay').on('click', function () {
        stayChart.filterAll();
        dc.redrawAll();
    });

    dc.renderAll();
})})})})})});