(() => {
	function createSvgPieChart(tableElement) {
	
		function drawArc(svg, centerX, centerY, radius, startAngle, endAngle, label) {
	
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
			let textX = (radius*(1+labelRadiusOffset))*Math.cos(degToRad(middleAngle)) + centerX;
			let textY = (radius*(1+labelRadiusOffset))*Math.sin(degToRad(middleAngle)) + centerY;
		
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
		
			p.setAttribute('d',pathD);
		
		}
		
		function degToRad(degrees) {
		  var pi = Math.PI;
		  return degrees * (pi/180);
		}
	
		let width = 20;
		let height = 10;
	
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg","svg");
		svgElement.setAttribute('viewBox','0 0 '+width+' '+height);
	
		let sum = 0;
		let currentAngle = 0;
	
		tableElement.querySelectorAll('td').forEach( (td) => {
	
			sum+= parseFloat( td.innerHTML );
	
		})
	
		tableElement.querySelectorAll('tr').forEach( (tr) => {
	
			let rowLabel = tr.querySelector('th').innerHTML;
			let rowFraction = parseFloat(tr.querySelector('td').innerHTML) / sum;
	
			let endAngle = currentAngle + 360*rowFraction;
	
			drawArc(svgElement,width / 2,height / 2,(height - 2) / 2,currentAngle,endAngle,rowLabel);
	
			currentAngle = endAngle;
	
		})
	
		tableElement.parentNode.insertBefore(svgElement, tableElement.nextSibling);
		
		svgElement.classList.add('svg-chart');
		svgElement.classList.add('pie-chart');
		svgElement.classList.add('initial');
	
		tableElement.classList.add('visually-hidden');
	
	
	
	}
	
	function createSvgPieCharts() {
	
		document.querySelectorAll('table[data-svg-pie-chart]').forEach( (table) => {
	
			createSvgPieChart(table);
	
		})
	
	}
	
	function createSvgLineChart(tableElement,id) {
	
		let width = 80;
		let height = 20;
	
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg","svg");
		let pathElement = document.createElementNS("http://www.w3.org/2000/svg","path");
		let textGroupElement = document.createElementNS("http://www.w3.org/2000/svg","g");
		
		svgElement.setAttribute('viewBox','0 0 '+width+' '+height);
	
		let svgId = 'line-chart-'+id;
		svgElement.setAttribute('id',svgId);
	
		let maxValue = 0;
		let minValue = Infinity;
		let valuesRange;
	
		let baseY = height*0.75;
		let minY = height*0.25;
		let maxHeight = baseY-minY;
		let baseX = width*0.1;
		let maxX = width*0.9;
		let totalWidth = maxX-baseX;
	
		let d = "";
		let initialD = "";
		let rowCount = 0;
	
		let style = "";
	
		let currentX = baseX;
		
		tableElement.querySelectorAll('td').forEach( (td) => {
	
			let rowValue = parseFloat( td.innerHTML );
	
			maxValue = Math.max(maxValue, rowValue);
			minValue = Math.min(minValue, rowValue)
			rowCount++;
	
		})
	
		valuesRange = maxValue - minValue;
	
		let deltaX = totalWidth / (rowCount - 1);
	
		let counter = 0;
	
		tableElement.querySelectorAll('tr').forEach( (tr) => {
	
			let rowLabel = tr.querySelector('th').innerHTML;
			let rowValue = parseFloat(tr.querySelector('td').innerHTML);
			let offsetY =  (rowValue-minValue) / valuesRange * maxHeight;
			let rowY = baseY - offsetY;
	
			let command = counter==0 ? "M" : "L"; 
	
			d += " " + command + " " + currentX + " " + rowY;
	
			initialD += " " + command + " " + currentX + " " + baseY;
	
			let labelY = rowY + (height / 10) * 1.75;
			let labelElement = document.createElementNS("http://www.w3.org/2000/svg","text");
			let labelClassId = 'label-id'+counter;
	
			labelElement.classList.add(labelClassId);
			labelElement.setAttribute('x',currentX);
			labelElement.setAttribute('y',labelY);
			labelElement.setAttribute('text-anchor','middle');
			labelElement.classList.add('chart-label');
			labelElement.innerHTML = rowLabel;
	
			style += " #"+svgId+".initial ."+labelClassId+" { transform: translateY("+offsetY+"px) }";
	
			textGroupElement.appendChild(labelElement);
	
			let valueY = rowY - height / 10;
			let valueElement = document.createElementNS("http://www.w3.org/2000/svg","text");
			let valueClassId = 'value-id'+counter;
	
			valueElement.classList.add(valueClassId);
			valueElement.setAttribute('x',currentX);
			valueElement.setAttribute('y',valueY);
			valueElement.setAttribute('text-anchor','middle');
			valueElement.classList.add('chart-value');
			valueElement.innerHTML = rowValue;
	
			style += " #"+svgId+".initial ."+valueClassId+" { transform: translateY("+offsetY+"px) }";
	
			textGroupElement.appendChild(valueElement);
	
			currentX += deltaX; 
			counter++;
	
		})
	
		pathElement.setAttribute('d',d);
		pathElement.classList.add('data-path');
		svgElement.appendChild(pathElement);
		svgElement.appendChild(textGroupElement);
	
		svgElement.classList.add('svg-chart');
		svgElement.classList.add('line-chart');
		svgElement.classList.add('initial');
	
		tableElement.parentNode.insertBefore(svgElement, tableElement.nextSibling);
	
		tableElement.classList.add('visually-hidden');
	
	
		style += " #"+svgId+".initial .data-path { d: path('"+initialD+"') }";
		let styleElement = document.createElement('style');
		styleElement.innerHTML = style;
	
		tableElement.parentNode.insertBefore(styleElement, tableElement.nextSibling);
	
	}
	
	function createSvgLineCharts() {
	
		let chartCounter = 0;
	
		document.querySelectorAll('table[data-svg-line-chart]').forEach( (table) => {
	
			createSvgLineChart(table,chartCounter);
			chartCounter++;
	
		})
	
	}
	
	createSvgLineCharts();
	createSvgPieCharts();
	
	/* external links handling */
	
	function processReportLinks() {
	
		let links = document.querySelectorAll('.report-page a');
	
		links.forEach( (anchor) => {
	
			let href = anchor.getAttribute('href');
	
			if((href.indexOf('http') != -1) && (href.indexOf('gender.cgiar.org') == -1)) {
				anchor.setAttribute('target','_blank');
			}
	
		})
	
	}
	
	processReportLinks();
	
	/* scroll handling */
	
	let chartObserverOptions = {
		root: null,
		rootMargin: '0px',
		threshold: [0, 0.3, 1.0]
	}
	
	let chartObserverCallback = (entries) => {
	
		entries.forEach(entry => {
	
			if (entry.isIntersecting) {
	
				if (entry.intersectionRatio >= 1) {
					entry.target.classList.remove('initial');
				}
	
				if (entry.intersectionRatio <= 0.3) {
					entry.target.classList.add('initial');
				}
	
			}
		});
	
	}
	
	let chartObserver = new IntersectionObserver(chartObserverCallback, chartObserverOptions);
	let charts = document.querySelectorAll('.svg-chart');
	
	
	charts.forEach( (target) => {
	
		chartObserver.observe(target);
	
	})
	
	
	let fullIntersectionObserverOptions = {
		root: null,
		rootMargin: '0px',
		threshold: [0, 1.0]
	}
	
	let fullIntersectionObserverCallback = (entries) => {
	
		entries.forEach(entry => {
	
			if (entry.isIntersecting) {
	
				if (entry.intersectionRatio >= 1) {
					entry.target.classList.add('final');
				} else {
					entry.target.classList.remove('final');
				}
	
	
			}
		});
	
	}
	
	let fullIntersectionObserver = new IntersectionObserver(fullIntersectionObserverCallback, fullIntersectionObserverOptions);
	let fullIntersectionTargets = document.querySelectorAll('.statement .figure, .metric');
	
	
	fullIntersectionTargets.forEach( (target) => {
	
		fullIntersectionObserver.observe(target);
	
	})
	})();