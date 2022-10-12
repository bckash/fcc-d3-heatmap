
const chartWidth = 1400;
const chartHeight = 800;
const chartPadding = 100;

document.addEventListener("DOMContentLoaded", () => {
    const req = new XMLHttpRequest();
    req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json", true)
    req.send()
    req.onload = () => {

        const json = JSON.parse(req.responseText)


        // THRESHOLD SCALE
        
        // min+max temp
        
        const dataVarianceLow = d3.min(
            json.monthlyVariance, d => d.variance)

        const dataVarianceHigh = d3.max(
            json.monthlyVariance, d => d.variance)

        const tempMin = Number((json.baseTemperature + dataVarianceLow).toFixed(3))
        const tempMax = Number((json.baseTemperature + dataVarianceHigh).toFixed(3))


        // threshold scale 


        const colorRange = ["#64a4c7", "#b4d1e0", "#e4de86", "#e2c747", "#de7b3b", "#d73222"]

        const colorDomainInterval = Number(((tempMax - tempMin)/(colorRange.length)).toFixed(3))

        const colorDomain = colorRange.map( (d,i) => {
            return Number((Number(tempMin) + i*Number(colorDomainInterval)).toFixed(3))
        })
        colorDomain.push(tempMax)

        console.log("col domain : "+colorDomain)
        console.log("range: "+colorRange)
        
        const threshold = d3.scaleThreshold()
            .domain(colorDomain)
            .range(colorRange)
            
        const x = d3.scaleLinear()
            .domain([tempMin, tempMax])
            .range([0, 300])
            
        const xAxisLegend = d3.axisBottom(x)
            .tickSize(30)
            .tickValues(threshold.domain())
            .tickFormat(d3.format(".3f"))
            
        const description = d3
            .select("#legend")
            .append("svg")
            .attr("width", 400)
            .attr("height", 100)

        description 
            .append("g")
            .attr("class", "desc-g")
            .attr("transform","translate(30)")
            .call(xAxisLegend);

        const g = d3.select(".desc-g")
            
        g.select(".domain").remove()
            
        g.selectAll("rect")
            .data(colorDomain)
            .enter()
            .insert("rect",".tick")
                .attr("height", 20)
                .attr("width", d => x(3.718)) // ?
                .attr("x", d => x(d))
                .attr("fill", (d,i) => colorRange[i])

                
        // MAIN AXIS

        const formatMonth = d3.timeParse("%B %Y") // string -> date
        const timeFormat  = d3.timeFormat("%B") // date -> string
        const formatYear = d3.timeParse("%Y") // string -> date

        const dataYearFirst =  formatYear(
            d3.min(json.monthlyVariance, d => d.year))
        const dataYearLast = formatYear(
            d3.max(json.monthlyVariance, d => d.year))
        const dataMonthFirst = formatMonth("January 2015")
        const dataMonthLast = formatMonth("January 2016")
        
        // X
        
        const xScale = d3
            .scaleTime()
            .domain([dataYearFirst, dataYearLast]) // in date format
            .range([chartPadding, chartWidth-chartPadding])
        
        const xAxis = d3
            .axisBottom(xScale)
            .ticks(20)
        
        // Y
        
        const yScale = d3
            .scaleTime()
            .domain([dataMonthFirst, dataMonthLast]) // in date format
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
            
        svg.append("g")
            .attr("transform", "translate(0,"+ (chartHeight - chartPadding) +")")
            .attr("id","x-axis")
            .call(xAxis)    
        
        svg.append("g")
            .attr("transform", "translate("+chartPadding+",0)")
            .attr("id","y-axis")
            .call(yAxis)

        // ticks return date object, getMonth returns numbers, so: 
        const dataMonth = yAxis.scale().ticks().map( i => i.toLocaleString("default", {month: "long"}))  
        
        console.log(dataMonth)
            
        svg.selectAll("rect")
            .data(json.monthlyVariance)
            .enter()
            .append("rect")
                .attr("class", "cell")
                .attr("data-month", d => d.month-1)
                .attr("data-year", d => d.year)
                .attr("data-temp", d => (json.baseTemperature + d.variance).toFixed(3))
                .attr("x", d => xScale(formatYear(d.year)))
                .attr("y", d => {
                    let month = `${dataMonth[d.month]} 2015`
                    if (d.month === 12) month = "January 2016"
                    return yScale(formatMonth(month))
                })
                .attr("height", 40)
                .attr("width", 4)
                .style("fill", d => {
                    let variance = json.baseTemperature + d.variance
                    if (variance >= 1.684 && variance < 3.718) 
                    {return colorRange[0]}
                    else if (variance >= 3.718 && variance < 5.752)
                    {return colorRange[1]}
                    else if (variance >= 5.752 && variance < 7.786)
                    {return colorRange[2]}
                    else if (variance >= 7.786 && variance < 9.820)
                    {return colorRange[3]}
                    else if (variance >= 9.820 && variance < 11.854)
                    {return colorRange[4]}
                    else if (variance >= 11.854 && variance <= 13.888)
                    {return colorRange[4]}
                })

        console.log(yAxis.scale())

    }
})
