import React, { useState, useRef, useEffect, Component } from 'react';
import Chart from 'react-apexcharts'
import ReactApexChart from "react-apexcharts";
import convertMsToTime from './App'

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

            series: [props.questioningTime],
            options: {
                chart: {
                    width: 380,
                    type: 'pie',
                },
                labels: ['Team A'],
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