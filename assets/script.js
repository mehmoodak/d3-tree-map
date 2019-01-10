let svgAttributes = {
  width: 960,
  height: 570,
  margins: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
};

let legendAttributes = {
  width: 450,
  height: 200,
  columnWidth: 150,
  rowHeight: 25,
  rect: {
    width: 15,
    height: 15,
  },
};

let svgData = {
  title: "Kickstarter Pledges",
  url:
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json",
  description: "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
  data: null,
};

// Get Color
let accent = d3.scaleOrdinal(d3.schemePaired);

/**
 * Load data to show in the graph
 *
 * @param {string} url
 */
(function getData(url = svgData.url) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      svgData.data = data;
      drawGraph(svgData.data);
      showLegend();
      log();
    });
})();

/**
 * Draw Graph and show tooltip based on the data
 */
function drawGraph() {
  // Handles mouseover of tooltip
  function handleMouseOver(d) {
    document.querySelector("#tooltip .name").innerText = d.data.name;
    document.querySelector("#tooltip .category").innerText = d.data.category;
    document.querySelector("#tooltip .value").innerText = d.data.value;

    tooltip
      .style("display", "inline-block")
      .style("top", () => d3.event.pageY + 10 + "px")
      .style("left", () => d3.event.pageX + 10 + "px")
      .attr("data-value", d.data.value);
  }

  // Handles mouseout of tooltip
  function handleMouseOut(d, i) {
    tooltip.style("display", "none");
  }

  // Show title and description of the graph
  (function showText() {
    document.getElementById("title").innerText = svgData.title;
    document.getElementById("description").innerText = svgData.description;
  })();

  // Main SVG of the graph
  let svg = d3
    .select("#graph")
    .append("svg")
    .attr("id", "treemap")
    .attr("width", svgAttributes.width + svgAttributes.margins.left + svgAttributes.margins.right)
    .attr(
      "height",
      svgAttributes.height + svgAttributes.margins.top + svgAttributes.margins.bottom,
    );

  // Set Parameters of the Tree Map Graph
  let treemap = () =>
    d3
      .treemap()
      .size([svgAttributes.width, svgAttributes.height])
      .paddingInner(0)
      .round(true)(
      d3
        .hierarchy(svgData.data)
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value),
    );

  // Initialize Tree Map
  let root = treemap();

  // Tooltip
  let tooltip = d3.select("#tooltip");

  // Leaves - Childrens of the treemap graph
  const leaf = svg
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  // Show childrens of treemap via rect
  leaf
    .append("rect")
    .attr("class", "tile")
    .attr("fill", d => {
      while (d.depth > 1) d = d.parent;
      return accent(d.data.name);
    })
    .attr("data-name", d => d.data.name)
    .attr("data-category", d => d.data.category)
    .attr("data-value", d => d.data.value)
    .attr("fill-opacity", 1)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .on("mousemove", handleMouseOver)
    .on("mouseout", handleMouseOut);

  // Show text inside of each children
  leaf
    .append("text")
    .attr("class", "tile-text")
    .selectAll("tspan")
    .data(function(d) {
      return d.data.name.split(/(?=[A-Z][^A-Z])/g);
    })
    .enter()
    .append("tspan")
    .attr("x", 4)
    .attr("y", function(d, i) {
      return 13 + i * 10;
    })
    .text(function(d) {
      return d;
    });
}

/**
 * Show Legend of the Graph
 */
function showLegend() {
  // Get x attribute of legend
  function getX(i) {
    return (i % 3) * legendAttributes.columnWidth;
  }

  // Get y attribute of legend
  function getY(i) {
    return Math.floor(i / 3) * legendAttributes.rowHeight;
  }

  // Data to show in legend
  let categories = svgData.data.children.map(category => category.name);

  // Main svg for legend
  let legend = d3
    .select("#graph-info")
    .append("svg")
    .attr("id", "legend")
    .attr("width", legendAttributes.width)
    .attr("height", legendAttributes.height);

  // Calculate places of each legend item
  let legendElement = legend
    .append("g")
    .attr("id", "legend-item-wrapper")
    .attr("transform", "translate(0, 30)")
    .selectAll("g")
    .data(categories)
    .enter()
    .append("g")
    .attr("transform", (d, i) => {
      let y = getY(i);
      let x = getX(i);
      return `translate(${x},${y})`;
    });

  // show rect of each category
  legendElement
    .append("rect")
    .attr("class", "legend-item")
    .attr("width", legendAttributes.rect.width)
    .attr("height", legendAttributes.rect.height)
    .attr("fill", d => accent(d));

  // show text of each category
  legendElement
    .append("text")
    .text(d => d)
    .attr("transform", "translate(25,14)")
    .style("fill", "white")
    .style("font-size", "14px");
}

/**
 * Show Logs
 */
function log() {
  console.log("svgData", svgData);
}
