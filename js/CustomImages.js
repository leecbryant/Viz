function sbs() {
    let sbsRoleTree =
      {
        "name": "Load Balancer",
        "children": [
            { 
                "name": "ASY",
                dead: false,
                initiate: false,
                terminate: false,
            },
            { 
                "name": "ASY1",
                dead: true,
                initiate: false,
                terminate: false,
            },
        ]
      };
  
    var margin = {top: 120, right: 90, bottom: 30, left: getDivStyle('#CustomImages', 'width') / 2.5},
        width = getDivStyle('#CustomImages', 'width') - margin.left - margin.right - 17,
        height = 500 - margin.top - margin.bottom;
  
    var svg = d3.select("#CustomImages").append("svg")
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
    root = d3.hierarchy(sbsRoleTree, function(d) { return d.children; });
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
        var sbsRoleTree = treemap(root);
  
        // Compute the new tree layout.
        var nodes = sbsRoleTree.descendants(),
            links = sbsRoleTree.descendants().slice(1);
  
        // Normalize for fixed-depth.
        nodes.forEach(function(d){ d.y = d.depth * 180});
  
        // ****************** Nodes section ***************************
  
        // Update the nodes...
        var node = svg.selectAll('g.sbsRoleNodes')
            .data(nodes, function(d) {return d.id || (d.id = ++i); });
  
        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'sbsRoleNodes')
            .attr("transform", function(d) {
            return "translate(" + source.x0 + "," + source.y0 + ")";
        })
        .on('click', click);
  
        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'sbsRoleNodes')
            .attr('r', 1e-6)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });
  
        // Add labels for the nodes
        nodeEnter.append('text')
            .attr("style", "color: #fff;")
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
  
        nodeUpdate
          .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")";
          });
  
        // Update the node attributes and style
        nodeUpdate.select('circle.sbsRoleNodes')
          .attr('r', 10)
          .attr("style", datum => {
            if(datum.data.dead) 
              return "display:none"
            else {
              if(datum.data.initiate || datum.data.terminate) {
                return "fill: #fff; stroke: #FFCC00; stroke-width: 5px;";
              } else {
                return "fill: #fff; stroke: #4BB543; stroke-width: 5px;";
              }
            }
          })
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
            .attr("style", datum => {
              if(datum.data.dead) 
                return "display:none"
              else {
                if(datum.data.initiate || datum.data.terminate) {
                  return "stroke: #FFCC00; stroke-width: 5px;";
                } else {
                  return "stroke: #4BB543; stroke-width: 5px;";
                }
              }
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
  
    function initiateServer() {
        if(j === 0) {
          sbsRoleTree.children[j + 1].initiate = true;
          sbsRoleTree.children[j + 1].dead = false;
        } else {
          sbsRoleTree.children[j - 1].initiate = true;
          sbsRoleTree.children[j - 1].dead = false;
        }
  
        update(root)
  
        setTimeout(validateServer, 5000);
    }
  
    function validateServer() {
      if(j === 0) {
        sbsRoleTree.children[j + 1].initiate = false;
      } else {
        sbsRoleTree.children[j - 1].initiate = false;
      }
  
      update(root);
  
      setTimeout(terminateServer, 1000);
    }
  
    function terminateServer() {
      sbsRoleTree.children[j].terminate = !sbsRoleTree.children[j].terminate;
  
      update(root);
  
      setTimeout(killServer, 5000);
    }
  
    function killServer() {
      sbsRoleTree.children[j].dead = !sbsRoleTree.children[j].dead;
      sbsRoleTree.children[j].terminate = !sbsRoleTree.children[j].terminate;
  
      update(root);
  
      j = j === 0 ? 1 : 0;
  
      setTimeout(initiateServer, 5000);
    }
  
    setTimeout(initiateServer, 5000);
  
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
  
  sbs();