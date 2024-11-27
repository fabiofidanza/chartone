const chartone = (() => {

	let settings = {
		chartSvgSize: 100,
		maxValue: 5,
		maxValueAttributeName: "data-chartone-max",
		palette: ['#AE90C3','#F6B0BD','#009CA6','#F2A900','#45B383','#FC4C02','#9A3324','#DA291C'],
		minRadius: 0,
		startAngle: 0,
		drawBackgroundCircle: true,
		backgroundCirleColor: '#eee',
		drawSliceLines: true,
		sliceLinesColor: '#fff',
		sliceLinesWidth: 1,
		labelCloseToSlice: false,
		extendWidthForLabels: true,
		extendHeightForLabels: true,
		hiddenTableClass: 'visually-hidden',
	}

	function drawArc(svg, centerX, centerY, radius, startAngle, endAngle, label, color) {
	
		let labelRadiusOffset = 0.1;
	
		let p = document.createElementNS("http://www.w3.org/2000/svg","path");
	
		svg.appendChild(p);
	
		let startX = radius*Math.cos(degToRad(startAngle)) + centerX;
		let startY = radius*Math.sin(degToRad(startAngle)) + centerY;
		
		let endX = radius*Math.cos(degToRad(endAngle)) + centerX;
		let endY = radius*Math.sin(degToRad(endAngle)) + centerY;
		
		let inner = (endAngle-startAngle > 180) ? 1 : 0;
	
		let pathD = "M "+centerX+" "+centerY+
					"L "+startX+" "+startY+
					"A "+radius+","+radius+",0,"+ inner +",1,"+endX+","+endY+
					"L "+centerX+" "+centerY+
					"Z";
	
		let middleAngle = (endAngle-startAngle) / 2 + startAngle;

		let textRadius;

		if(settings.labelCloseToSlice) {
			textRadius = radius;
		} else {
			textRadius = settings.chartSvgSize / 2;
		}

		let textX = (textRadius*(1+labelRadiusOffset))*Math.cos(degToRad(middleAngle)) + centerX;
		let textY = (textRadius*(1+labelRadiusOffset))*Math.sin(degToRad(middleAngle)) + centerY;
	
		let textElement = document.createElementNS("http://www.w3.org/2000/svg","text");
		
		textElement.setAttribute('x',textX);
		textElement.setAttribute('y',textY);
	
		if(middleAngle < 90 || middleAngle > 270) {
			textElement.setAttribute('text-anchor','start');
		} else {
			textElement.setAttribute('text-anchor','end');
		}
		
		textElement.innerHTML = label;
		
		svg.appendChild(textElement);

		svg.setAttribute('class','chartone--chart');
	
		p.setAttribute('d',pathD);
		p.setAttribute('fill',color);
	
	}

	function degToRad(degrees) {
		var pi = Math.PI;
		return degrees * (pi/180);
	}

	function _createChart(element) {

		const rows = element.querySelectorAll('tr');

		let svgElement = document.createElementNS("http://www.w3.org/2000/svg","svg");
		svgElement.setAttribute('viewBox',`0 0 ${settings.chartSvgSize} ${settings.chartSvgSize}`);

		const sliceAngle = 360 / rows.length;
		let currentAngle = settings.startAngle;

		let sliceLines = [];

		const maxValue = element.getAttribute(settings.maxValueAttributeName) ?? settings.maxValue;

		if(settings.drawBackgroundCircle) {

			const backgroundCircle = document.createElementNS("http://www.w3.org/2000/svg","circle");
			backgroundCircle.setAttribute('cx',settings.chartSvgSize/2);
			backgroundCircle.setAttribute('cy',settings.chartSvgSize/2);
			backgroundCircle.setAttribute('r',settings.chartSvgSize/2);
			backgroundCircle.setAttribute('fill',settings.backgroundCirleColor);

			svgElement.appendChild(backgroundCircle);
			
		}

		

		rows.forEach( (row,i) => {

			const title = row.querySelector('th').innerText;
			const value = parseFloat(row.querySelector('td').innerText);

			const radius = (settings.chartSvgSize/2-settings.minRadius) * (value / maxValue) + settings.minRadius;
			const color = settings.palette[i % settings.palette.length];

			drawArc(svgElement,
					settings.chartSvgSize/2,settings.chartSvgSize/2,
					radius,
					currentAngle,
					currentAngle+sliceAngle,
					title,
					color);

			if(settings.drawSliceLines) {

				const sliceLine = document.createElementNS("http://www.w3.org/2000/svg","line");
				sliceLine.setAttribute('x1',settings.chartSvgSize/2);
				sliceLine.setAttribute('y1',settings.chartSvgSize/2);
				sliceLine.setAttribute('x2',settings.chartSvgSize/2 + settings.chartSvgSize/2 * Math.cos(degToRad(currentAngle)));
				sliceLine.setAttribute('y2',settings.chartSvgSize/2 + settings.chartSvgSize/2 * Math.sin(degToRad(currentAngle)));
				sliceLine.setAttribute('stroke',settings.sliceLinesColor);
				sliceLine.setAttribute('stroke-width',settings.sliceLinesWidth);

				sliceLines.push(sliceLine);
		
			}
			
			currentAngle += sliceAngle;

		})

		sliceLines.forEach( (line) => {
			svgElement.appendChild(line);
		})

		element.after(svgElement);

		if(settings.extendWidthForLabels || settings.extendHeightForLabels) {
			_extendSizeForLabels(svgElement);
		}

		element.classList.add(settings.hiddenTableClass);
	
	}

	function _extendSizeForLabels(svgElement) {

		const textElements = svgElement.querySelectorAll('text');

		let minX = 0, 
			maxX = settings.chartSvgSize,
			minY = 0, 
			maxY = settings.chartSvgSize;
			

		textElements.forEach( (textElement) => {
			
			const bbox = textElement.getBBox();

			if(settings.extendWidthForLabels) {
				minX = Math.min(minX,bbox.x);
				maxX = Math.max(maxX,bbox.x+bbox.width);
			}

			if(settings.extendHeightForLabels) {
				minY = Math.min(minY,bbox.y);
				maxY = Math.max(maxY,bbox.y+bbox.height);
			}

		})

		const width = settings.chartSvgSize - minX + (maxX-settings.chartSvgSize); 
		const height = settings.chartSvgSize - minY + (maxY-settings.chartSvgSize); 

		svgElement.setAttribute('viewBox',`${minX} ${minY} ${width} ${height}`);


	}

	function _createCharts(elements, customSettings = {}) {

		let chartElements;
		
		settings = {
			...settings,
			...customSettings
		}

		if(typeof elements === "string") {
			chartElements = document.querySelectorAll(elements);
		} else if(elements instanceof Element) {
			chartElements = [elements]; 
		} else {
			chartElements = elements;
		}
		
		chartElements.forEach( (element) => {
			_createChart(element);
		})
	
	}

	return {
		createCharts: _createCharts,
	}

})();

window.addEventListener('load', ()=> {

	chartone.createCharts('.tabella', {
		minRadius: 5,
		startAngle: -90,
		labelCloseToSlice: false
	});

});