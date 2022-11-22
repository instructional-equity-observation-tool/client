import React, { useState, useRef, useEffect, Component } from 'react';
import Chart from 'react-apexcharts'
import ReactApexChart from "react-apexcharts";


class ApexChart extends React.Component {
    constructor(props) {
        super(props);

        //gets props: questioningTime and labledQuestions
        console.log("Got to Apex Chart File");
        console.log("Inputted questioningTime: ");
        console.log(props.questioningTime);
        console.log("Inputted labledQuestions: ");
        console.log(props.labledQuestions);

        this.state = {

            series: [44, 55, 13, 43, 22],
            options: {
                chart: {
                    width: 380,
                    type: 'pie',
                },
                labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
                    responsive: [{
                    breakpoint: 480,
                        options: {
                            chart: {
                            width: 200
                        },
                        legend: {
                            position: 'bottom'
                            }
                        }
                    }]
            },
        };
    }


    render() {
      return (
            <div id="chart">
                <ReactApexChart options={this.state.options} series={this.state.series} type="pie" width={380} />
            </div>
        );
    }
}

export default ApexChart;