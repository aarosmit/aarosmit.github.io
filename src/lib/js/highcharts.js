import Highcharts from 'highcharts';
// import more from 'highcharts/highcharts-more';

export default (node, config) => {
  // more(Highcharts);
	const redraw = true;
	const oneToOne = true;
	const chart = Highcharts.chart(node, config);

	return {
		update(config) {
			chart.update(config, redraw, oneToOne);
		},
		destroy() {
			chart.destroy();
		}
	};
}