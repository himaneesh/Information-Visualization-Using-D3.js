window.onload = function() {
    var datas=[];
    var geo ={}
    var map = new Map();
    var dData = {}
    var rMap=new Map();
    var dMap=new Map();
    function loadData() {
        return Promise.all([
            //Read csv from D3
            d3.csv("aiddata.csv"),
            d3.json("countries.geo.json")
        ]).then(datasets => {

            datas = datasets[0]
            geo=datasets[1]
            return datasets
        })
    }

    function getConifg() {
        var width = 800;
        var height = 480;
        var margin = {
            left: 50,
            right: 10,
            top: 20,
            bottom: 100
        };
        var bodyHeight = height - margin.top - margin.bottom;
        var bodyWidth = width - margin.left - margin.right;

        var svg = d3.select("body").append("svg").attr("width",width).attr("height",height).attr("id", "Chart")
            .append("g")
            .attr("transform", "translate("+[margin.left,margin.top]+")");

        return { width, height, margin, bodyHeight, bodyWidth, svg };
    }
    function getScales(chartData, config) {
        var { bodyWidth, bodyHeight } = config;
        var { data, countries, purpose } = chartData;
        var maximumReceived = d3.max(data, (d) => {
            return d.Amount;
        });
        var yScale= d3.scalePoint()
            .range([0,bodyHeight])
            .domain(purpose.map(d => d.Code))
            .padding(3);

        var cScale = d3.scaleOrdinal()
            .domain(purpose.map(d => d.Code))
            .range(d3.schemeSet1);

        var xScale = d3.scalePoint() //d3.scaleBand()
            .range([0, bodyWidth])
            .domain(countries)
            .padding(1);

        var rScale = d3.scaleLinear()
            .domain([11122,maximumReceived])
            .range([1,15]);

        return { xScale, yScale, rScale, cScale };
    }

    function drawAxes(chartData, scales, config){
        var {xScale, yScale } = scales
        var {svg, margin, height, bodyHeight} = config;
        var { data, countries, purpose } = chartData;


        let axisX = d3.axisBottom(xScale);

        svg.append("g")
            .call(axisX)
            .style("transform",
                "translate(0px"+","+bodyHeight+"px)"
            )
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.6em")
            .attr("dy", ".13em")
            .attr("transform", "rotate(-55)");

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", 350)
            .attr("y", 450)
            .text("Countries");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left+5)
            .attr("x",20 - (height / 2))
            .attr("dy", "0.5em")
            .style("text-anchor", "middle")
            .text("Purpose Code");

        var axisY = d3.axisLeft(yScale);
        svg.append("g")
            .call(axisY);

        countries.forEach(d => {
            svg
                .append("line")
                .style("stroke", "#999")
                .style("stroke-dasharray", ("4, 4"))
                .attr("y1", bodyHeight)
                .attr("y2", 0)
                .attr("x1", xScale(d))
                .attr("x2", xScale(d))
        });
    }
    function dCircles(chartData, scales, config){
        var { data, countries, purpose } = chartData;
        var { bodyWidth, bodyHeight, svg } = config;
        let { xScale, yScale, rScale, cScale } = scales;
        var circle = svg.selectAll("circle")
            .data(data);

        var circleEnter = circle
            .enter()
            .append("circle")
            .attr("cx", (d) => xScale(d.Country))
            .attr("cy", (d) => yScale(d.Code))
            .attr("r", (d) => rScale(d.Amount))
            .attr("fill", (d) => cScale(d.Code));



        var rect = svg.selectAll(".bar")
            .data(data);

    }
    function groupByPurpose(data) {
        var purpose = {};
        var result = data.reduce((result, d) => {
            var pc = d.coalesced_purpose_code;
            var recipientData = result[d.recipient] || {
                "Country": d.recipient
            };
            var code = purpose[pc] || {
                "Code":pc,
                "Frequency":0,
                "Name":d["coalesced_purpose_name"]
            };
            code.Frequency += 1;
            purpose[pc] = code;
            var prevAmount = Number(recipientData[pc] || 0);
            recipientData[pc] = prevAmount + Number(d.commitment_amount_usd_constant);
            result[d.recipient] = recipientData;
            return result;
        });

        var purposeArr = Object.keys(purpose).map(key => purpose[key]);
        purposeArr.sort(function(a,b)  {
            return d3.descending(a.Frequency,b.Frequency);
        });
        purposeArr = purposeArr.slice(0,5);
        var newData = [];
        var countries = [];
        Object.keys(result).forEach(key => {
            countries.push(result[key].Country);
            purposeArr.forEach(p => {
                newData.push({
                    "Country":result[key].Country,
                    "Code": p.Code,
                    "Amount": Number(result[key][p.Code]) || 0,
                    "Name": p.Name
                })
            })
        });
        return {data: newData, countries: countries, purpose: purposeArr}
    }
    function processData() {
        var data = groupByPurpose(datas);
        var config = getConifg();
        var scales = getScales(data, config);
        drawAxes(data, scales, config);
        dCircles(data, scales, config)
    }
    loadData().then(processData)

}