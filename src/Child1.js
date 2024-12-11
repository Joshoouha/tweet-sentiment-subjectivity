import React, { Component } from "react";
import "./Child1.css";
import * as d3 from "d3";

class Child1 extends Component {
  state = {
    selectedColor: 'Sentiment',
    selectedData: [],
  };

  handleColorChange = event => {
    this.setState({selectedColor: event.target.value});
  }

  componentDidUpdate() {
    this.getModel(this.props.json_data);
  }

  getModel(data) {
    const modelData = data.slice(0, 300);

    const monthOrder = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let months = Array.from(new Set(modelData.map(d => d.Month)));
    months = months.sort((a,b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    console.log('Months: ', months);

    const width = 1000;
    const height = 500;
    const margin = {top: 30, right: 20, bottom: 10, left: 10};

    const svg = d3.select('#mysvg')
      .attr('width', width)
      .attr('height', height)
      .select('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // yScale and Color Scale
    const yScale = d3.scaleBand()
      .domain(months)
      .range([margin.top, height - margin.bottom]);

    const sentimentColorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["red", "#ECECEC", "green"]);
    const subjectivityColorScale = d3.scaleLinear().domain([0,1]).range(["#ECECEC","#4467C4"]);

    // Months label
    svg.selectAll('.month-label')
      .data(months)
      .join('text')
      .attr('class', 'month-label')
      .attr('x', margin.left)
      .attr('y', d => yScale(d))
      .text(d => d)
      .style('font-weight', 'bold')
      .style('font-size', '20px');

    // Add the circles to the svg
    svg.selectAll('circle')
      .data(modelData)
      .join(
        enter => {
          const appendCircles = enter.append('circle')
            .attr('r', 8)
            .attr('fill', d => this.state.selectedColor === 'Sentiment'
                ? sentimentColorScale(d.Sentiment)
                : subjectivityColorScale(d.Subjectivity)
              )
            .on('click', (event, d) => {
              const isAlreadySelected = this.state.selectedData.includes(d);

              if (isAlreadySelected){
                this.setState(prevState => ({
                  selectedData: prevState.selectedData.filter(item => item !== d)
                }))

                d3.select(event.currentTarget)
                  .attr('stroke', 'none')
                  .attr('stroke-width', 0);
                  
                console.log("Updated State: ", this.state.selectedData);
              } else {
                this.setState((prevState) => ({
                  selectedData: [d, ...prevState.selectedData]
                }))
                d3.select(event.currentTarget)
                  .attr('stroke', 'black')
                  .attr('stroke-width', 2);
                console.log("Updated State: ", this.state.selectedData);
              }
            });
          
          d3.forceSimulation(modelData)
            .force('y', d3.forceY(d => yScale(d.Month)).strength(0.3))
            .force('collision', d3.forceCollide(9))
            .on('tick', () => {
              appendCircles.attr('cx', d => d.x + 400)
                .attr('cy', d => d.y);
            });
        },
        update => update.attr('fill', d => this.state.selectedColor === 'Sentiment' 
          ? sentimentColorScale(d.Sentiment)
          : subjectivityColorScale(d.Subjectivity)
        ),
        exit => exit.remove(),
      );
    
    // Adding legend
    const legendWidth = 30;
    const legendHeight = 200;
    const numSteps = 10;
    const stepHeight = legendHeight / numSteps;
    const legendX = width - margin.right - 200;
    const legendY = margin.top;

    const colorSteps = d3.range(numSteps).map(i => i / (numSteps - 1));

    svg.selectAll('.legend-rect')
      .data(colorSteps)
      .join('rect')
      .attr('class', 'legend-rect')
      .attr('x', legendX)
      .attr('y', (d, i) => legendY + legendHeight - (i + 1) * stepHeight)
      .attr('width', legendWidth)
      .attr('height', stepHeight)
      .attr('fill', d => this.state.selectedColor === 'Sentiment'
        ? sentimentColorScale(d * 2 - 1)
        : subjectivityColorScale(d)
      );

    svg.selectAll('.top-label')
      .data([this.state.selectedColor === 'Sentiment' ? 'Positive' : 'Subjective'])
      .join('text')
      .attr('class', 'top-label')
      .attr('x', legendX + legendWidth + 5)
      .attr('y', legendY + 12)
      .text(d => d);

    svg.selectAll('.bottom-label')
      .data([this.state.selectedColor === 'Sentiment' ? 'Negative' : 'Objective'])
      .join('text')
      .attr('class', 'bottom-label')
      .attr('x', legendX + legendWidth + 5)
      .attr('y', legendY + legendHeight)
      .text(d => d);
  }

  render() {
    return(
      <div className='child1'>
        <div id='dropdown'>
          <label for='color-by-dropdown'>Color By: </label>
          <select id='color-by-dropdown' value={this.state.selectedColor} onChange={this.handleColorChange}>
            <option value='Sentiment'>Sentiment</option>
            <option value='Subjectivity'>Subjectivity</option>
          </select>
        </div>
        <div id='model'>
          <svg id="mysvg">
            <g></g>
          </svg>
        </div>
        <div id='selected-tweets'>
        {this.state.selectedData.length > 0 && (
          <div>
            {this.state.selectedData.map((d) => (
              <p>{d.RawTweet}</p>
            ))}
          </div>
        )}
        </div>
      </div>
    );
  }
}

export default Child1;