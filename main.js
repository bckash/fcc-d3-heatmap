
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

        // THRESHOLD SCALE

        // min+max temp

        const dataVarianceLow = d3.min(
            json.monthlyVariance, d => d.variance)

        const dataVarianceHigh = d3.max(
            json.monthlyVariance, d => d.variance)

        const tempMin = Number((json.baseTemperature + dataVarianceLow).toFixed(3))
        const tempMax = Number((json.baseTemperature + dataVarianceHigh).toFixed(3))


        // threshold scale 

        const colorDomain = ["#e4ca7a", "#cf9930", "#d97e26", "#e1631e", "#ea4415", "#f41e0b"]

        const colorRangeInterval = Number(((tempMax - tempMin)/(colorDomain.length+1)).toFixed(3))
        let colorRangeStart = tempMin
        const colorRange = colorDomain.map( d => {
            return colorRangeStart = Number((Number(colorRangeStart) + Number(colorRangeInterval)).toFixed(3))
        })
        colorRange.unshift(tempMin)


        const threshold = d3.scaleThreshold()
            .domain(colorDomain)
            .range(colorRange)

        const x = d3.scaleLinear()
            .domain([0, 1])
            .range([0, 240])

        const xAxisLegend = d3.axisBottom(x)
            .tickSize(15)
            .tickValues(threshold.domain())

        const description = d3
            .select("#description")
            .append("svg")
            .attr("width", "200")
            .attr("height", "100")

        description 
            .append("g")
            .attr("class","cancel")
            .call(xAxisLegend);

        description
            .select(".domain")
            .remove()

        description
            .selectAll("rect")
            .data()

        
    }
})
