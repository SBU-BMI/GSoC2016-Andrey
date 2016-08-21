var data = [];
var offsets = {};
var API_URL = 'https://health.data.ny.gov/resource/';
var DATASETNAMES = {
    2009: 's8d9-z734',
    2010: 'dpew-wqcg',
    2011: 'n5y9-zanf',
    2012: 'rv8x-4fm3',
    2013: 'tdf6-7fpk',
    2014: 'pzzw-8zdv'
};

function countySelector() {
    return document.getElementById('countyInput');
}

function sampleSize() {
    return document.getElementById('sizeInput').value;
}

function county() {
    return countySelector().value;
}

var random      = (max)  => Math.floor(Math.random() * max);
var baseUrl     = (year) => `${API_URL}${DATASETNAMES[year]}.json`;
var countUrl    = (year) => `${baseUrl(year)}?$select=count(*)`;
var setOffset   = (year) => getJSON(countUrl(year)).then((response) => offsets[year] = random(response[0].count));
var concatData  = (year) => getJSON(dataUrl(year)).then((response) => data = data.concat(response));
var getData     = (year) => setOffset(year).then((response) => concatData(year));
var baseDataUrl = (year) => `${baseUrl(year)}?$limit=${sampleSize()}`;

function toKeyValue( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

function getSearchParams() {
    var prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr != "" ? toKeyValue(prmstr) : {};
}

function setCountyFromParams() {
    var params = getSearchParams();
    if (params.county){
        countySelector().value = params.county;
    }
}

function dataUrl (year) {     
    return (county() && county() != 'Random')
    ? `${baseDataUrl(year)}&hospital_county=${county()}`
    : `${baseDataUrl(year)}&$offset=${offsets[year]}`;
}

var load = () => {
    data = [];    

    Promise.resolve().then(() => Promise.all(Object.keys(DATASETNAMES).map(getData)))
    .then(() => {
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
            var chart = dc.pieChart(`#${name}`);
            chart.width(200)
                .height(200)
                .dimension(dimension)
                .group(counts)
                .innerRadius(20);
            if (orderingFunction){
                chart.ordering(orderingFunction);
            }
            d3.selectAll(`a#reset_${name}`).on('click', function () {
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

        var createBarChart = function(
            fieldName, xDomain, barPadding, xLabel, xValues,
            xScaleLinear = true
        ){
            var dimension = ndx.dimension(dc.pluck(fieldName));
            var counts = dimension.group().reduceCount();
            var chart = dc.barChart(`#${fieldName}`);
            chart
                .width(300)
                .height(200)
                .dimension(dimension)
                .group(counts)
                .elasticY(true)
                .centerBar(true)
                .barPadding(barPadding)
                .xAxisLabel(xLabel)
                .yAxisLabel('Count')
                .margins({top: 10, right: 20, bottom: 50, left: 50});

            if (xScaleLinear){
                chart.x(d3.scale.linear().domain(xDomain))
                chart.xAxis().tickValues(xValues);
            }
            else{
                chart.x(d3.scale.ordinal().domain(xDomain));
                chart.xUnits(dc.units.ordinal); // Tell dc.js that we're using an ordinal x-axis
            }

            d3.selectAll(`a#reset_${fieldName}`).on('click', function () {
                chart.filterAll();
                dc.redrawAll();
            });
        }

        createBarChart('length_of_stay', [0,11], 5, 'Length of stay, days', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
        createBarChart('year', [2008, 2015], 3, 'Year', [2009, 2010, 2011, 2012, 2013, 2014]);
        createBarChart('age_group_start', [-10, 80], 5, 'Age group', [0, 18, 30, 50, 70]);
        createBarChart('admit_day_of_week', ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], 1, 'Admission day of week', [0, 18, 30, 50, 70], false);

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
    })
};
