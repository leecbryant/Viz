function RollingImagesUpgrader() { 
  let rollingImagesTree =
  {
      "name": "Load Balancer",
      "children": [
          { 
            "name": "Instance 1",
            dead: false,
            pending: false,
            "children": [
                {
                    "name": "ASY",
                }
              ]
          },
          { 
            "name": "Instance 2",
            dead: false,
            pending: false,
            "children": [
                {
                    "name": "ASY",
                }
              ]
          },
          { 
            "name": "Instance 3",
            dead: false,
            pending: false,
            "children": [
                {
                    "name": "ASY",
                }
              ]
          },
          { 
            "name": "Instance 4",
            dead: false,
            pending: false,
            "children": [
                {
                    "name": "ASY",
                }
              ]
          }
      ]
  };

  var margin = {top: 80, right: 90, bottom: 30, left: getDivStyle('#RollingImagesUpgrades', 'width') / 2.5},
      width = getDivStyle('#RollingImagesUpgrades', 'width') - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var svg = d3.select("#RollingImagesUpgrades").append("svg")
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
  root = d3.hierarchy(rollingImagesTree, function(d) { return d.children; });
  root.x0 = height / 2;
  root.y0 = 0;

  // Collapse after the second level

  update(root);

  function update(source) {

      // Assigns the x and y position for the nodes
      var rollingImagesTree = treemap(root);

      // Compute the new tree layout.
      var nodes = rollingImagesTree.descendants(),
          links = rollingImagesTree.descendants().slice(1);

      // Normalize for fixed-depth.
      nodes.forEach(function(d){ d.y = d.depth * 180});

      // ****************** Nodes section ***************************

      // Update the nodes...
      var node = svg.selectAll('g.RollingImagesUpgradesNode')
          .data(nodes, function(d) {return d.id || (d.id = ++i); });

      // Enter any new modes at the parent's previous position.
      var nodeEnter = node.enter().append('g')
          .attr('class', 'RollingImagesUpgradesNode')
          .attr("transform", function(d) {
          return "translate(" + source.x0 + "," + source.y0 + ")";
      })
      .on('click', click);

      // Add Circle for the nodes
      nodeEnter.append('circle')
          .attr('class', 'RollingImagesUpgradesNode')
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
      nodeUpdate.select('circle.RollingImagesUpgradesNode')
          .attr('r', 10)
          .attr("style", function (d) {
            if(d.data.dead) {
              return "stroke: #b54343;";
            } 

            if(d.data.pending) {
              return "stroke: #FFCC00;";
            }

            return "stroke: #4BB543;";
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
          .attr("style", function (d) {
            let stroke = `stroke-width: ${getRandomWidth(d.data.dead || d.data.pending)}px;`;
            if(d.data.dead) {
              return stroke + "stroke: #b54343;";
            } 

            if(d.data.pending) {
              return stroke + "stroke: #FFCC00;";
            }

              return stroke + "stroke: #4BB543;";
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
          rollingImagesTree.children[j === 0 ? rollingImagesTree.children.length - 1 : j - 1].pending = false;
          rollingImagesTree.children[j].pending = true;
          rollingImagesTree.children[j === 0 ? rollingImagesTree.children.length - 1 : j - 1].children[0].dead = false;
          rollingImagesTree.children[j].children[0].dead = true;
          update(root)
          j++;
          if(j === rollingImagesTree.children.length) {
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
      for(let i = 0; i < rollingImagesTree.children.length; i++) {
          rollingImagesTree.children[i].pending = false;
          rollingImagesTree.children[i].children[0].dead = false;
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

RollingImagesUpgrader();