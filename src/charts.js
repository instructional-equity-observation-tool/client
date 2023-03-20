import React, { useState, useRef, useEffect, Component } from 'react';
import Chart from 'react-apexcharts'
import ReactApexChart from "react-apexcharts";
import convertMsToTime from './App'

const MyCharts = ({prop1}) => {


    //testing to see if prop passed
    let thing1 = prop1;

    console.log("Recieved thing 1: " + thing1);


    //sample data for bar chart
  const series = [ //data on the y-axis
    {
      name: "Temperature in Celsius",
      data: ["1","2"]
    }
  ];
  const options = { //data on the x-axis
    chart: { id: 'bar-chart'},
    xaxis: {
      categories: ["Category 1", "Category 2"]
    }
  };

  return (
    <div>
      <Chart
        options={options}
        series={series}
        type="bar"
        width="450"
      />
    </div>
  )
}

export default MyCharts;