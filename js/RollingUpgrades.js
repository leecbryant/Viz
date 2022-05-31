function rollingUpgrader() { 
    let rollingTree =
    {
        "name": "Load Balancer",
        "children": [
            { 
                "name": "Instance 1",
            },
            { 
                "name": "Instance 2",
                dead: false
            },
            { 
                "name": "Instance 3",
                dead: false
            },
            { 
                "name": "Instance 4",
                dead: false
            }
        ]
    };

    var margin = {top: 120, right: 90, bottom: 30, left: getDivStyle('#RollingUpgrades', 'width') / 2.5},
        width = getDivStyle('#RollingUpgrades', 'width') - margin.left - margin.right - 17,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#RollingUpgrades").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate("
            + margin.left + "," + margin.top + ")");

    var i = 0,
        duration = 750,
        root;

    // declares a tree layout and assigns the size
    var treemap = d3.tree().size([height, width]);

    // Assigns parent, children, height, depth
    root = d3.hierarchy(rollingTree, function(d) { return d.children; });
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse after the second level
    root.children.forEach(collapse);

    update(root);

    // Collapse the node and all it's children
    function collapse(d) {
    if(d.children) {
        d._children = d.children
        d._children.forEach(collapse)
        d.children = null
    }
    }

    function update(source) {

        // Assigns the x and y position for the nodes
        var rollingTree = treemap(root);

        // Compute the new tree layout.
        var nodes = rollingTree.descendants(),
            links = rollingTree.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(function(d){ d.y = d.depth * 180});

        // ****************** Nodes section ***************************

        // Update the nodes...
        var node = svg.selectAll('g.RollingUpgradeNode')
            .data(nodes, function(d) {return d.id || (d.id = ++i); });

        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'RollingUpgradeNode')
            .attr("transform", function(d) {
            return "translate(" + source.x0 + "," + source.y0 + ")";
        })
        .on('click', click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'RollingUpgradeNode')
            .attr('r', 1e-6)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", function(d) {
                return d.children || d._children ? -13 : 13;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) { return d.data.name; });

        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate
            .attr("transform", function(d) { 
                return "translate(" + d.x + "," + d.y + ")";
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.RollingUpgradeNode')
            .attr('r', 10)
            .style("stroke", datum => datum.data.dead ? "#b54343" : "#4BB543")
            .attr('cursor', 'pointer');


        // Remove any exiting nodes
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.x + "," + source.y + ")";
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
        .attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')

        // ****************** links section ***************************

        // Update the links...
        var link = svg.selectAll('path.link')
            .data(links, function(d) { return d.id; });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', function(d) {
                return diagonal(d)
            });

        // UPDATE
        var linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate
            .attr("style", function (d) {
                return (d.data.dead ? "stroke: #b54343;" : "stroke: #4BB543;") + `stroke-width: ${getRandomWidth(d.data.dead)}px;`;
            })
            .attr('d', function(d){ return diagonal(d, d.parent) });

        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function(d) {
                return diagonal(d)
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach(function(d){
            d.x0 = d.x;
            d.y0 = d.y;
        });

        function diagonal(d) {
            return "M" + d.x + "," + d.y
                    + "C" + d.x + "," + (d.y + d.parent.y) / 2
                    + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
                    + " " + d.parent.x + "," + d.parent.y;
        }

        // Toggle children on click.
        function click(event, d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
                } else {
                d.children = d._children;
                d._children = null;
                }
            update(d);
        }
    }

    let j = 0;
    function killServer() {
        setTimeout(function () {
            rollingTree.children[j === 0 ? rollingTree.children.length - 1 : j - 1].dead = false;
            rollingTree.children[j].dead = true;
            update(root)
            j++;
            if(j === rollingTree.children.length) {
                setTimeout(function () {
                    j = 0;
                    reset();
                }, 5000);
            } else {
                killServer();
            }
        }, 5000);
    }

    function reset() {
        for(let i = 0; i < rollingTree.children.length; i++) {
            rollingTree.children[i].dead = false;
        }
        update(root);
        setTimeout(function () {
            killServer();
        }, 5000);
    }


    killServer(killServer, 5000);

    function getDivStyle(div, attr) {
        var width = d3.select(div)
        .style(attr)
        .slice(0, -2)

        // return as an integer
        return Math.round(Number(width))
    }

    function getRandomWidth(isDead) {
        return isDead ? 1 : Math.floor(Math.random() * 10) + 3;
    }
}

rollingUpgrader();