var data2009 = 

// todo: load multiple years
d3.json('https://health.data.ny.gov/resource/s8d9-z734.json', function(error, data){
 
    var yearFormat = d3.time.format('%Y'),
    	dayOfWeekFormat = d3.time.format('%a');


    _.each(data, function(d) {
        d.year = yearFormat(new Date(d.discharge_year));
        d.day = dayOfWeekFormat(new Date(d.discharge_day_of_week));
    });

    var ndx = crossfilter(data);

    var yearDim = ndx.dimension(function(d) {return d.year;}),
        dayDim = ndx.dimension(dc.pluck('discharge_day_of_week')); 

    var all = ndx.groupAll();

    var countPerYear = yearDim.group().reduceCount(),
    	countPerDay = dayDim.group().reduceCount();

    var yearChart = dc.pieChart('#chart-ring-year'),   
    	dayChart = dc.pieChart('#chart-ring-day');   
    
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
    
    dc.renderAll();
});