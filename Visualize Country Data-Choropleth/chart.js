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
            d3.csv("a.csv"),
            d3.json("countries.geo.json")
        ]).then(datasets => {

            datas = datasets[0]
            geo=datasets[1]
            return datasets
        })
    }


    function processData(){
        var map1 = new Map();
        var j=0;
        for(var i=0;i<datas.length;i++){
            if(!map1.has(datas[i].donor)) {
                map1.set(datas[i].donor,j)
                j++;
            }
        }
        // iterate over map with key and value
        for (let [k, v] of map1) {
           // console.log(k, v);
            map.set(k,v);
        }
        getDonor()
    }


    function getDonor(){
        let barChartdata = []
        //group by donors and sum the donor amount
        //refernces https://bl.ocks.org/phoebebright/raw/3176159/
        //references https://amber.rbind.io/blog/2017/05/02/d3nest/
        var donorData = d3.nest()
            .key(function(datas) {
                //group by donor
                return datas.donor;
            })
            //sum the USD amount
            .rollup(function(datas) {
                return d3.sum(datas, function(g) {
                    return g.commitment_amount_usd_constant;
                });
            }).entries(datas);


        var recivedData = d3.nest()
            .key(function(datas) {
                return datas.recipient;
            })
            .rollup(function(datas) {
                return d3.sum(datas, function(g) {
                    return g.commitment_amount_usd_constant;
                });
            }).entries(datas);

        for(let i = 0; i < donorData.length; i++){
            for(let j = 0; j < recivedData.length; j++){
                if(donorData[i].key == recivedData[j].key) {
                    donorData[i]["value2"] = recivedData[j]['value']
                }
            }
        }
        for(let k = 0; k < donorData.length; k++){
            if(!donorData[k].value2) {
                donorData[k]["value2"] = 0;
            }
        }
        dData = donorData;
        recivedData.forEach(function mapData(value) {
            rMap.set(value.key,value.value);
        });

        donorData.forEach(function mapData(value) {
            dMap.set(value.key,value.value);
        });




        plotGeo()
    }
    function plotGeo() {
       // console.log("Inside plotgeo")

        var width =1700
        var height=700
        var padding =20
        var marginLeft = 80;


        var populationById = {};
// Define the div for the tooltip
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        geo.features.forEach(function(d) {
          //  console.log(d.properties.name)
            var v1;
            var v2;

            if (d.properties.name == 'United States of America'  && dMap.get("United States")) {
                v1 = dMap.get("United States")
            }
            else if(!dMap.get(d.properties.name))
                v1=0;
            else {
                v1 = dMap.get(d.properties.name)
            }

            if (d.properties.name == 'United States of America'  && rMap.get("United States")) {
                v2 = rMap.get("United States")
            }
            else
            if(!rMap.get(d.properties.name))
                v2=0;
            else {
                v2 = rMap.get(d.properties.name)
            }
            console.log("Countres "+d.properties.name)

            console.log("v1"+v1)
            console.log("v2"+v2)
            //console.log("v2"+v2)
            d.donorReceive = [v1,v2]

        });

        var svg = d3.select("body").append("svg").attr("width",width).attr("height",height)


        var projection1 = d3.geoMercator()
            .scale(100)
            .center([0,20])
            .translate([width/3, height / 2]);
        var path1 = d3.geoPath().projection(projection1);


        var projection2 = d3.geoMercator()
            .scale(100)
            .center([0,20])
            .translate([(width -500), height / 2]);
        var path2 = d3.geoPath().projection(projection2);
        // Data and color scale
        var data = d3.map();
        var colorScale = d3.scaleLinear()
            .domain([0,480548936.5,116126438286])
            .range(d3.schemeGreens[3]);
        var colorScale2 = d3.scaleLinear()
            .domain([0,55999999,116176338066])
            .range(d3.schemeReds[3]);

      // Draw the map
      svg.append("g")
            .selectAll("path.donor")
            .data(geo.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection1)
            )
            // set the color of each country
            .attr("fill", function (d) {
                if(d.donorReceive[0]==0) return "white"
                else
                return colorScale(d.donorReceive[0]);
            }).on("mouseover", function(d) {
          div.transition()
              .duration(200)
              .style("opacity", .9);
          div.html(d.properties.name + "<br/>"  + d.donorReceive[0])
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
            })
          .on("mouseout", function(d) {
              div.transition()
                  .duration(500)
                  .style("opacity", 0);
          });

        // Draw the map
        svg.append("g")
            .selectAll("path.rec")
            .data(geo.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection2)
            )
            // set the color of each country
            .attr("fill", function (d) {
                if(d.donorReceive[1]==0) return "white"
                else
                return colorScale2(d.donorReceive[1]);
            }).on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.properties.name + "<br/>"  + d.donorReceive[1])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });


        var g = svg.append("g")
            .attr("class", "legendThreshold")
            .attr("transform", "translate(40,40)");
        g.append("text")
            .attr("class", "caption")
            .attr("x", 0)
            .attr("y", -10)
            .text("Donor");
        var labels1 = ["0-1000000", "1000000-10000000","10000000-100000000",'100000000-1000000000','1000000000-100000000000'];
        var legend1 = d3.legendColor()
            .labels(function (d) { return labels1[d.i]; })
            .shapePadding(3)
            .scale(colorScale);
        svg.select(".legendThreshold")
            .call(legend1);

        var gg = svg.append("g")
            .attr("class", "legendThreshold1")
            .attr("transform", "translate(40,200)");
        g.append("text")
            .attr("class", "caption")
            .attr("x", 0)
            .attr("y", 150)
            .text("Received");
        var labels123 =["0-1000000", "1000000-10000000","10000000-100000000",'100000000-1000000000','1000000000-100000000000'];
        var legend12 = d3.legendColor()
            .labels(function (d) { return labels123[d.i]; })
            .shapePadding(3)
            .scale(colorScale2);
        svg.select(".legendThreshold1")
            .call(legend12);

    }

        loadData().then(processData)
}