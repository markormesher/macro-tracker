import { ChartDataSets } from "chart.js";
import * as Color from "color";

const chartColours = {
	black: Color("black").darken(0.2),
	blackSemiTransparent: Color("black").darken(0.2).alpha(0.5),
	red: Color("red").darken(0.2),
	redSemiTransparent: Color("red").darken(0.2).alpha(0.5),
	green: Color("green").darken(0.2),
	greenSemiTransparent: Color("green").darken(0.2).alpha(0.5),
	blue: Color("blue").darken(0.2),
	blueSemiTransparent: Color("blue").darken(0.2).alpha(0.5),
};

const defaultDatasetProps: Partial<ChartDataSets> = {
	pointRadius: 0,
	fill: false,
};

export {
	chartColours,
	defaultDatasetProps,
};
