window.onload = function() {
    var datas=[];

    function loadData() {
            d3.csv("co2.csv",function(d) {
                return {
                    date: new Date(d.year),
//Convert from string to float
                    average: parseFloat(d.average)
                };

            }).then(function(d){
               console.log(d)
                datas=d;
               datas.sort(function (a,b) {
                   return a.date - b.date
               })
                showData()
               console.log(datas)
            });
    }

    function showData() {
        console.log("Inside showwdata")
        console.table(datas, ["date", "average"]);

        var svgWidth = 600, svgHeight = 400;
        var margin = { top: 20, right: 20, bottom: 30, left: 50 };
        var width = svgWidth - margin.left - margin.right;
        var height = svgHeight - margin.top - margin.bottom;




        //set scales---------------------
        xscale = d3.scaleTime()
            .domain(
                d3.extent(datas, function(d) { return d.date; }),
            )
            .range([0, width]);




        console.log("scale --"+xscale(2012));
        yscale = d3.scaleLinear()
            .domain(d3.extent(datas, function(d) { return d.average; }))
            .range([height, 0]);



        console.log("yscale --"+yscale(315.70));


        //Define line generator
        var line = d3.line()
            .x(function(d) { return xscale(d.date); })
            .y(function(d) { return yscale(d.average); });
        //--------------------------------------
//Create SVG element
        var svg = d3.select("body")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);



        var g = svg.append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")"
            );

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xscale))
            .select(".domain")
            .remove();

        g.append("g")
            .call(d3.axisLeft(yscale))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Price ($)");
//Create line

        g.append("path").datum(datas).attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        g.append("line").attr("class", "line safeLevel")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", yscale(200))
            .attr("y2", yscale(200)).attr("fill","red")
        ;
    }
        loadData()
}