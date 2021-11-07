import {GeneratedPoint2D, getPoint2DInitializer} from './point2d';
import {roundFloat} from './utils';

interface GeneratedGradientStop {
  position: number;
  colorInitializer: string;
}

/**
 * Returns a linear gradient initializer.
 * @ignore
 */
export const getLinearGradientInitializer = (
  stops: GeneratedGradientStop[],
  start: GeneratedPoint2D,
  end: GeneratedPoint2D,
) => {
  const colorStopInitializers = stops.map((stop) => {
    return `GradientStop.make(${roundFloat(stop.position)}, ${stop.colorInitializer})`;
  });
  const colorStopInitializer = `[${colorStopInitializers.join(', ')}]`;
  return `new LinearGradient({stops: ${colorStopInitializer}, start: ${getPoint2DInitializer(start)}, end: ${getPoint2DInitializer(end)}})`;
};
