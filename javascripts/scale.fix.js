var metas = document.getElementsByTagName('meta');
var i;
if (navigator.userAgent.match(/iPhone/i)) {
    for (i = 0; i < metas.length; i++) {
        if (metas[i].name == "viewport") {
            metas[i].content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
        }
    }
    document.addEventListener("gesturestart", gestureStart, false);
}

function gestureStart() {
    for (i = 0; i < metas.length; i++) {
        if (metas[i].name == "viewport") {
            metas[i].content = "width=device-width, minimum-scale=0.25, maximum-scale=1.6";
        }
    }
}

function toggleLine() {
    lines = document.getElementsByClassName("line");

    if (lines[0].style.display == "none") {
        for (var i = 0; i < lines.length; i++) {
            lines[i].style.display = "block";
        }
    } else {
        for (var i = 0; i < lines.length; i++) {
            lines[i].style.display = "none";
        }
    }
}

document.getElementById("lineBtn").addEventListener("click", toggleLine);

var keywords = ["Scientist", "Cloud", "business", "New", "hings", "DevOps", "Machine Learning", "IBM", "ht", "DEAL", "KDN", "DataScience", "analytics", "Opines", "MachineLearning", "abdsc", "Internet", "Hadoop", "Business", "Io", "EMC", "Ways", "Analytics", "Learn", "Learning", "Spark", "H", "Apache", "Python"];

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


    for (var i = 0; i < data.length; i++) {
        keywords.push(data[i][0].keyword);
    }

    console.log(keywords);

function toggleSingleLine(keyword) {
    line = document.getElementById("line_" + keyword);
    console.log(line);
    if (line.style.display == "none") {
        line.style.display = "block";
    } else {
        line.style.display = "none";
    }
}


keywords.forEach(function( v,i ) {
      document.getElementById(v).addEventListener("click", function(){
        toggleSingleLine(v);
    });
});


});
