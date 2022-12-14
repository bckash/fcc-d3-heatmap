
const chartWidth = 1450;
const chartHeight = 800;
const chartPadding = 100;

const toolTip = d3
    .select("#tooltip-container")
    .append("div")
    .attr("id", "tooltip")
    .style("display", "none");

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

        const monthToString  = d3.timeFormat("%B") // date -> string

        // X
        
        const xScale = d3
            .scaleBand()
            .domain(json.monthlyVariance.map(d=>d.year)) 
            .range([chartPadding, chartWidth-chartPadding])
        

        const xAxis = d3
            .axisBottom(xScale)
            .tickValues(xScale.domain().filter(d => d%10 === 0))
        
        // Y
        
        const yScale = d3
            .scaleBand()
            .domain([0,1,2,3,4,5,6,7,8,9,10,11]) 
            .range([chartHeight-chartPadding, chartPadding])
        
        const yAxis = d3
            .axisLeft(yScale)
            .tickFormat(d => {
                let date = new Date(2000, d)
                return monthToString(date)
            })
        
        
        // SVG
        
        const svg = d3
            .select("#map")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)      
            
        svg.append("g")
            .attr("transform", "translate(0,"+ (chartHeight - chartPadding) +")")
            .attr("id","x-axis")
            .call(xAxis)
            .append("text")
            .text("Years")
            .attr("class", "ax-text")
            .attr("transform", "translate("+ chartWidth/2 + "," + chartPadding/2 +")")
        
        svg.append("g")
            .attr("transform", "translate("+chartPadding+",0)")
            .attr("id","y-axis")
            .call(yAxis)
            .append("text")
            .text("Months")
            .attr("class", "ax-text")
            .attr("transform", "translate(-70,"+ chartHeight/2 +") rotate(-90)")
            
        svg.selectAll("rect")
            .data(json.monthlyVariance)
            .enter()
            .append("rect")
                .attr("class", "cell")
                .attr("data-month", d => d.month-1)
                .attr("data-year",  d => d.year)
                .attr("data-temp",  d => (json.baseTemperature + d.variance).toFixed(3))
                .attr("x", d => xScale(d.year))
                .attr("y", d => yScale(d.month-1) )
                .attr("height", d => yScale.bandwidth(d.month))
                .attr("width",  d => xScale.bandwidth(d.year))
                .style("fill",  d => {
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
                .on("mouseover", () => {
                    toolTip
                        .style("display", "block")
                })
                .on("mousemove", (ev,d) => {
                    toolTip
                    .html(`
                        <div>
                            <dt>date: </dt>
                            <dd>${d.month}.${d.year}</dd>
                        </div>
                        <div>
                            <dt>temperature: </dt>
                            <dd>${(json.baseTemperature + d.variance).toFixed(3)}</dd>
                        </div>
                        `)
                    .attr("data-year", d.year)
                })
                .on("mouseleave", () => {
                    toolTip
                        .style("display","none")
                })
    }
})
