var parseDate = d3.time.format('%Y-%m-%d').parse;
var data = [];
var flatData = [];
var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds


function generateColors(keywords) {
    var colors = {};
    for (var i = 0; i < keywords.length; i++) {
        colors[keywords[i]] = randomColor();
    }
    return colors;
}

function getDiffDays(data) {
    data.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });
    firstDate = new Date(flatData[0].date);
    secondDate = new Date(flatData[flatData.length - 1].date);
    diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
    console.log(diffDays);
    return diffDays;
}

function classes(root) {
    var classes = [];

    classes = root.map(function(d) {
        return {
            keyword: d.keyword,
            value: d.count
        };
    });

    return {
        children: classes
    };
}

d3.json('data/data.json', function(error, rawData) {
    if (error) {
        console.error(error);
        return;
    }

    for (var i = 0; i < rawData.length; i++) {
        var item = rawData[i].map(function(d) {
            return {
                date: parseDate(d.date),
                keyword: d.keyword,
                count: d.count
            };
        });
//        console.log(item);
        item.sort(function(a, b) {
            return new Date(a.date) - new Date(b.date);
        });

        data.push(item);
    }

    console.log("generating flatData")

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            flatData.push(data[i][j]);
        }
    }

    console.log(flatData)

    var keywords = [];

    for (var i = 0; i < data.length; i++) {
        keywords.push(data[i][0].keyword);
    }

    var colors = generateColors(keywords);


    var margin = {
        top: 80,
        bottom: 80,
        left: 80,
        right: 80
    }

    var chartWidth = 660 - margin.right - margin.left,
        chartHeight = 500 - margin.top - margin.bottom;

    var xScale = d3.time.scale()
        .domain(d3.extent(flatData, function(d) {
            return d.date;
        }))
        .range([0, chartWidth]);

    var yScale = d3.scale.linear()
        .domain([0, d3.max(flatData, function(d) {
            return d.count;
        })])
        .range([chartHeight, 0]);

    var rScale = d3.scale.linear()
        .domain([0, d3.max(flatData, function(d) {
            return d.count;
        })])
        .range([2, 5]);

    var line = d3.svg.line()
        .interpolate("monotone")
        .x(function(d) {
            return xScale(d.date);
        })
        .y(function(d) {
            return yScale(d.count);
        });

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(getDiffDays(flatData));

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("right")
        .ticks(10);

    var topic_list = d3.select("div.list")
        .append("svg")
        .attr("width", chartWidth + margin.right + margin.left)
        .attr("height", Math.ceil(keywords.length / 3) * 26 + 16);

    for (var i = 0; i < keywords.length; i++) {
        topic_list.append("rect")
            .attr("x", (i % 3) * 230)
            .attr("y", Math.floor(i / 3)*26)
            .attr("width", 20)
            .attr("height", 10)
            .attr("fill", colors[keywords[i]]);


        topic_list.append("text")
            .text(keywords[i])
            .attr("x", (i % 3) * 230 + 30)
            .attr("y", Math.floor(i / 3)*26 + 10);
    }

    var svg = d3.select("div.main")
        .append("svg")
        .attr("width", chartWidth + margin.right + margin.left)
        .attr("height", chartHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //    svg.append("clipPath")
    //        .attr("id", "clip")
    //        .append("rect")
    //        .attr("width", chartWidth)
    //        .attr("height", chartHeight);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + chartWidth + ",0)")
        .call(yAxis);

    for (var i = 0; i < data.length; i++) {
        svg.append("path")
            .attr("class", "line")
            .attr("clip-path", "url(#clip)")
            .attr("d", line(data[i]));
    }

    svg.selectAll("circle")
        .data(flatData)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(d.date);
        })
        .attr("cy", function(d) {
            return yScale(d.count);
        })
        .attr("r", function(d) {
            return rScale(d.count);
        })
        .attr("fill", function(d) {
            return colors[d.keyword];
        })
        .append("title")
        .text(function(d) {
            return "keyword: " + d.keyword;
        });


});

d3.json("data/week_data.json", function(error, root) {
    if (error) throw error;

    var keywords = [];

    for (var i = 0; i < root.length; i++) {
        keywords.push(root[i].keyword);
    }

    var colors = generateColors(keywords);

    var diameter = 600,
        format = d3.format(",d");

    var bubble = d3.layout.pack()
        .sort(function comparator(a, b) {
            return b.value - a.value;
        })
        .size([diameter, diameter])
        .padding(1.5);

    var bubble_chart = d3.select("div.bubble")
        .append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");

    var node = bubble_chart.selectAll(".node")
        .data(bubble.nodes(classes(root))
            .filter(function(d) {
                return !d.children;
            }))
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    node.append("title")
        .text(function(d) {
            return d.keyword + ": " + format(d.value);
        });

    node.append("circle")
        .attr("r", function(d) {
            return d.r;
        })
        .style("fill", function(d) {
            return colors[d.keyword];
        });

    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) {
            return d.keyword;
        });
});

d3.json("data/users.json", function(error, rawData) {
    if (error) throw error;

    var data = [];
    var field = rawData["field"];
    var count = rawData["count"];

        data = rawData["users"].map(function(d) {
            return {
                name: d.name,
                username: d.username,
                id: d.id
            };
        });
    console.log(data);

    var targetP = document.getElementById("user");

    for(var i =0;i<data.length;i++){
        var br = document.createElement('br');
        var a = document.createElement('a');
        a.setAttribute('href', "https://twitter.com/" + data[i].username);
        a.appendChild(document.createTextNode(data[i].name));
        targetP.appendChild(a);
        targetP.appendChild(br);
    }
});
