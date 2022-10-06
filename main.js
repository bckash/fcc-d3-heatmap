
const chartWidth = 1400;
const chartHeight = 800;
const chartPadding = 100;

document.addEventListener("DOMContentLoaded", () => {
    const req = new XMLHttpRequest();
    req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json", true)
    req.send()
    req.onload = () => {

        const json = JSON.parse(req.responseText)
        const formatMonth = d3.timeParse("%B")
        const timeFormat  = d3.timeFormat("%B")
        const formatYear = d3.timeParse("%Y")

        const dataYearFirst =  formatYear(
            d3.min(json.monthlyVariance, d => d.year))
        const dataYearLast = formatYear(
            d3.max(json.monthlyVariance, d => d.year))
        const dataMonthFirst = formatMonth("January")
        const dataMonthLast = formatMonth("December")


        // X

        const xScale = d3
            .scaleTime()
            .domain([dataYearFirst, dataYearLast])
            .range([chartPadding, chartWidth-chartPadding])

        const xAxis = d3
            .axisBottom(xScale)
            .ticks(20)

        // Y

        const yScale = d3
            .scaleTime()
            .domain([dataMonthFirst, dataMonthLast])
            .range([chartHeight-chartPadding, chartPadding])

        const yAxis = d3
            .axisLeft(yScale)
            .tickFormat(timeFormat) 


        // SVG

        const svg = d3
            .select("#title")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)      
            
        svg
            .append("g")
            .attr("transform", "translate(0,"+ (chartHeight - chartPadding) +")")
            .attr("id","x-axis")
            .call(xAxis)    

        svg
            .append("g")
            .attr("transform", "translate("+chartPadding+",0)")
            .attr("id","y-axis")
            .call(yAxis)            

        // threshold scale

        const dataVarianceFirst = d3.min(
            json.monthlyVariance, d => d.variance)
        const dataVarianceLast = d3.max(
            json.monthlyVariance, d => d.variance)

        const colorDomain = ["#e4ca7a", "#cf9930", "#d97e26", "#e1631e", "#ea4415", "#f41e0b"]
        

        const dataVarianceInterval = (Math.abs(dataVarianceFirst)*1000 + dataVarianceLast*1000)/(1000*colorDomain.length)


        let rangeStep = dataVarianceFirst

        const colorRange = colorDomain.map( i=> {
            return rangeStep = (Number(rangeStep) + Number(dataVarianceInterval)).toFixed(3)
        })


        const threshold = d3.scaleThreshold()
            .domain([colorDomain])
            .range([colorRange])
    }
})
