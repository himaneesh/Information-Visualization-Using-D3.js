
window.onload = function() {
    let store = {};
    function loadData() {
        return Promise.all([
            //Read csv from D3
            d3.csv("a.csv")
        ]).then(datasets => {
            store = datasets[0];
            return store;
        })
    }

    function getDonor(){
        let barChartdata = []
        //group by donors and sum the donor amount
        //refernces https://bl.ocks.org/phoebebright/raw/3176159/
        //references https://amber.rbind.io/blog/2017/05/02/d3nest/
        var donorData = d3.nest()
            .key(function(store) {
                //group by donor
                return store.donor;
            })
            //sum the USD amount
            .rollup(function(store) {
                return d3.sum(store, function(g) {
                    return g.commitment_amount_usd_constant;
                });
            }).entries(store);

        var dMap = new Map();
        donorData.forEach(function mapData(value) {
            dMap.set(value.key,value.value);
        });


        var recivedData = d3.nest()
            .key(function(store) {
                return store.recipient;
            })
            .rollup(function(store) {
                return d3.sum(store, function(g) {
                    return g.commitment_amount_usd_constant;
                });
            }).entries(store);

        var rMap = new Map();
        recivedData.forEach(function mapData(value) {
            rMap.set(value.key,value.value);
        });

        var topData = donorData.sort(function(a, b) {
            return b.value - a.value;
        });

        for(let i = 0; i < donorData.length; i++){
            for(let j = 0; j < recivedData.length; j++){
                if(donorData[i].key == recivedData[j].key) {
                    donorData[i]["value2"] = recivedData[j]['value']
                }
            }
        }
            for(let j = 0; j < donorData.length; j++){
                if(!donorData[j].value2) {
                    donorData[j]["value2"] = 0;
                }
            }
                return donorData.slice(0,15);
    }
    function drawbarChart(data,value){

// Define the div for the tooltip
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        var container = d3.select('#chart'),
            //width of the chart
            width = 1200,
            height = 500,
            margin = {top: 30, right: 20, bottom: 50, left: 120},
            barPadding = .2;

        var svg = container
            .append("svg")
            .attr("width", width+100)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);


        //x axis width
        var xScale0 = d3.scaleBand().range([0, width ]).padding(barPadding).domain(data.map(d => d.key));
        var xScale1 = d3.scaleBand().domain(['Donor', 'Recieved','Difference']).range([0, xScale0.bandwidth()]);

        var yScale = d3.scaleLinear().range([height - margin.top - margin.bottom, 0])
            .domain([0, d3.max(data, d => d.value > d.value2 ? d.value : d.value2)]);;


            //generators
        var xAxis = d3.axisBottom(xScale0).tickPadding(5)
        var yAxis = d3.axisLeft(yScale).ticks(10).tickPadding(10);



        var key = svg.selectAll(".key")
            .data(data)
            .enter().append("g")
            .attr("class", "key")
            .attr("transform", d => `translate(${xScale0(d.key)},0)`);

        /* Add field1 bars */
        key.selectAll(".bar.value")
            .data(d => [d])
            .enter()
            .append("rect")
            .attr("class", "bar value")
            .style("fill","#5D9AD3")
            .attr("x", d => xScale1('Donor'))
            .attr("y", d => yScale(d.value))
            .attr("width", xScale1.bandwidth())
            .on("mouseover", function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div	.html(d.key + "<br/>"  + d.value)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .attr("height", d => {
                let h =  height - margin.top - margin.bottom - yScale(d.value);
                return h;
            });

        /* Add field2 bars */
        key.selectAll(".bar.value2")
            .data(d => [d])
            .enter()
            .append("rect")
            .attr("class", "bar value2")
            .style("fill","#EE7D2E")
            .attr("x", d => xScale1('Recieved'))
            .attr("y", d => yScale(d.value2))
            .attr("width", xScale1.bandwidth())
            .on("mouseover", function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div	.html(d.key + "<br/>"  + d.value2)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .attr("height", d => {
                let h = height - margin.top - margin.bottom - yScale(d.value2);
                return h;
            });


        /* Add field3(difference) bars */
        key.selectAll(".bar.value3")
            .data(d => [d])
            .enter()
            .append("rect")
            .attr("class", "bar value2")
            .style("fill","#5fee10")
            .attr("x", d => xScale1('Difference'))
            .attr("y", d => yScale(Math.abs(d.value2-d.value)))
            .attr("width", xScale1.bandwidth())
            .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div	.html(d.key + "<br/>"  + Math.abs(d.value2-d.value))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .attr("height", d => {
                let h = height - margin.top - margin.bottom - yScale(Math.abs(d.value2-d.value));
                return h;
            });


        // Add the X Axis
        svg.append("g")
            .attr("class", "x")
            .attr("transform", `translate(0,${height+10 - margin.top - margin.bottom})`)
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("class", "y")
            .call(yAxis);

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", 700)
            .attr("y", 460)
            .text("Countries");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left+5)
            .attr("x",20 - (height / 2))
            .attr("dy", "0.5em")
            .style("text-anchor", "middle")
            .text("Amount");
    }

    function drawLegend(data,val){
        var width = 500;
        var height = 75;
        var container = d3.select('.legend4'),
            barPadding = .5;
        /////////D3 Horizonal Lengend 1///////////////////////////
        var svgLegned4 = container.append("svg")
            .attr("width", width)
            .attr("height", height - 50)

        var dataL = 0;
        var offset = 80;
        var legendVals2 = ["Donor", "Receiver", "Difference"]
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        var legend4 = svgLegned4.selectAll('.legends4')
            .data(legendVals2)
            .enter().append('g')
            .attr("class", "legends4")
            .attr("transform", function (d, i) {
                if (i === 0) {
                    dataL = d.length + offset
                    return "translate(0,0)"
                } else {
                    var newdataL = dataL
                    dataL +=  d.length + offset
                    return "translate(" + (newdataL) + ",0)"
                }
            })

        legend4.append('rect')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function (d, i) {
                return color(i)
            })

        legend4.append('text')
            .attr("x", 20)
            .attr("y", 10)
            //.attr("dy", ".35em")
            .text(function (d, i) {
                return d
            })
            .attr("class", "textselected")
            .style("text-anchor", "start")
            .style("font-size", 15)
    }
    function showData() {
        donorData = getDonor()
        drawbarChart(donorData,'value')
        drawLegend(donorData,'value')
    }
    loadData().then(showData);
};
