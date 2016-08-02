var data = [];
const LIMIT = 10;

const DATASETNAMES = {
    2009: 's8d9-z734',
    2010: 'dpew-wqcg',
    2011: 'n5y9-zanf',
    2012: 'rv8x-4fm3',
    2013: 'tdf6-7fpk',
    2014: 'pzzw-8zdv'
} 

function getRandom(max) {
  return Math.floor(Math.random() * max);
}
var randomOffsets = {};

d3.json(`https://health.data.ny.gov/resource/${DATASETNAMES[2009]}.json?$select=count(*)`, function(err, counted2009){
    randomOffsets[2009] = getRandom(counted2009[0].count);
d3.json(`https://health.data.ny.gov/resource/${DATASETNAMES[2010]}.json?$select=count(*)`, function(err, counted2010){
    randomOffsets[2010] = getRandom(counted2010[0].count);
d3.json(`https://health.data.ny.gov/resource/${DATASETNAMES[2011]}.json?$select=count(*)`, function(err, counted2011){
    randomOffsets[2011] = getRandom(counted2011[0].count);
d3.json(`https://health.data.ny.gov/resource/${DATASETNAMES[2012]}.json?$select=count(*)`, function(err, counted2012){
    randomOffsets[2012] = getRandom(counted2012[0].count);
d3.json(`https://health.data.ny.gov/resource/${DATASETNAMES[2013]}.json?$select=count(*)`, function(err, counted2013){
    randomOffsets[2013] = getRandom(counted2013[0].count);
d3.json(`https://health.data.ny.gov/resource/${DATASETNAMES[2014]}.json?$select=count(*)`, function(err, counted2014){
    randomOffsets[2014] = getRandom(counted2014[0].count);

// for offline testing purposes
// d3.json('data.json', function(error, data){

d3.json(`https://health.data.ny.gov/resource/${DATASETNAMES[2009]}.json?$limit=${LIMIT}&$offset=` + randomOffsets[2009], function(error, data2009){
d3.json(`https://health.data.ny.gov/resource/${DATASETNAMES[2010]}.json?$limit=${LIMIT}&$offset=` + randomOffsets[2010], function(error, data2010){
d3.json(`https://health.data.ny.gov/resource/${DATASETNAMES[2011]}.json?$limit=${LIMIT}&$offset=` + randomOffsets[2011], function(error, data2011){
d3.json(`https://health.data.ny.gov/resource/${DATASETNAMES[2012]}.json?$limit=${LIMIT}&$offset=` + randomOffsets[2012], function(error, data2012){
d3.json(`https://health.data.ny.gov/resource/${DATASETNAMES[2013]}.json?$limit=${LIMIT}&$offset=` + randomOffsets[2013], function(error, data2013){
d3.json(`https://health.data.ny.gov/resource/${DATASETNAMES[2014]}.json?$limit=${LIMIT}&$offset=` + randomOffsets[2014], function(error, data2014){

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
        d.length_of_stay = +d.length_of_stay;
        if (d.age_group){
            d.age_group_start = +d.age_group.substring(0,2);
        }
    });

    // main magic!
    var ndx = crossfilter(data);

    // creates dimension, measures (counts per dimensions), chart init and configuration, reset button
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
    createPieChart('admit_day_of_week', dayOfWeekOrdering);
    createPieChart('facility_name');
    createPieChart('gender');
    createPieChart('race');
    createPieChart('ethnicity');
    createPieChart('type_of_admission');
    createPieChart('patient_disposition');
    createPieChart('ccs_diagnosis_description');
    createPieChart('ccs_procedure_description');
    createPieChart('apr_drg_description');
    createPieChart('apr_mdc_description');
    createPieChart('apr_severity_of_illness_description');
    createPieChart('apr_risk_of_mortality');
    createPieChart('apr_medical_surgical_description');
    createPieChart('emergency_department_indicator');
    createPieChart('age_group');
    createPieChart('source_of_payment_1');
    createPieChart('source_of_payment_2');
    createPieChart('source_of_payment_3');
    
    // length of stay
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
    
    // years
    var yearDim = ndx.dimension(dc.pluck('year')); 
    var countPerYear = yearDim.group().reduceCount();
    var yearChart = dc.barChart('#chart-year');
    yearChart
        .width(300)
        .height(180)
        .dimension(yearDim)
        .group(countPerYear)
        .x(d3.scale.linear().domain([2007,2015]))
        .elasticY(true)
        .centerBar(true)
        .barPadding(3)
        .xAxisLabel('Year')
        .yAxisLabel('Count')
        .margins({top: 10, right: 20, bottom: 50, left: 50});
    stayChart.xAxis().tickValues([2008, 2009, 2010, 2011, 2012, 2013, 2014]);
    d3.selectAll('a#resetYear').on('click', function () {
        yearChart.filterAll();
        dc.redrawAll();
    });

    // age groups
    var ageDim = ndx.dimension(dc.pluck('age_group_start')); 
    var countPerAge = ageDim.group().reduceCount();
    var ageChart = dc.barChart('#chart-agegroup');
    ageChart
        .width(300)
        .height(180)
        .dimension(ageDim)
        .group(countPerAge)
        .x(d3.scale.linear().domain([-10,80]))
        .elasticY(true)
        .centerBar(true)
        .barPadding(5)
        .xAxisLabel('Age group')
        .yAxisLabel('Count')
        .margins({top: 10, right: 20, bottom: 50, left: 50});
    ageChart.xAxis().tickValues([0, 18, 30, 50, 70]);
    d3.selectAll('a#resetAgeGroup').on('click', function () {
        ageChart.filterAll();
        dc.redrawAll();
    });

    // day of week
    var dayDim = ndx.dimension(dc.pluck('admit_day_of_week')); 
    var countPerDay = dayDim.group().reduceCount();
    var dayChart = dc.barChart('#chart-day');
    dayChart
        .width(300)
        .height(180)
        .dimension(dayDim)
        .group(countPerDay)
        .x(d3.scale.ordinal().domain(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']))
        .xUnits(dc.units.ordinal) // Tell dc.js that we're using an ordinal x-axis
        .elasticY(true)
        .centerBar(true)
        .barPadding(1)
        .xAxisLabel('Day of week')
        .yAxisLabel('Count')
        .margins({top: 10, right: 20, bottom: 50, left: 50});
    // dayChart.xAxis().tickValues(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
    d3.selectAll('a#resetDay').on('click', function () {
        dayChart.filterAll();
        dc.redrawAll();
    });

    // count widget (count all records and selected)
    var all = ndx.groupAll();
    var dataCount = dc.dataCount('#data-count');   
    dataCount
        .dimension(ndx)
        .group(all);
    
    // button 'Reset all'
    d3.selectAll('a#resetAll').on('click', function () {
        dc.filterAll();
        dc.renderAll();
    });

    // render all the things!
    dc.renderAll();

    sparcsDc = {};

    sparcsDc.helloFromDc = function(){
        console.log('hello from SPARCS :)');
        return false;
    }

    sparcsDc.getTop = function(fieldName, topCount){
        var dimension = ndx.dimension(function(d){return d[fieldName] ? d[fieldName] : "";});
        var counts = dimension.group().reduceCount();
        
        console.log(counts.top(topCount));       
    }


})})})})})})
})})})})})})
// })
;