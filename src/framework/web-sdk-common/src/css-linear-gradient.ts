import {cssLinearGradientLength, linearGradientStartAndEndPoints} from '@diez/framework-core';
// Only used as a type.
// tslint:disable-next-line: no-implicit-dependencies
import {LinearGradientData, Point2DData} from '@diez/prefabs';
import {colorToCss} from './css-color';

/**
 * @returns The hypotenuse of the provided point.
 */
const hypot = (point: Point2DData) => Math.sqrt(point.x * point.x + point.y * point.y);

/**
 * @returns A normalized copy of the provided point.
 */
const normalizePoint = (point: Point2DData) => {
  const length = hypot(point);
  return {
    x: point.x / length,
    y: point.y / length,
  };
};

/**
 * @returns A Point2D where `x = pointA.x - pointB.x` and `y = pointA.y - pointB.y`.
 */
const subtractPoints = (pointA: Point2DData, pointB: Point2DData) => {
  return {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y,
  };
};

/**
 * @returns The dot product of the two provided points.
 */
const dotProduct = (pointA: Point2DData, pointB: Point2DData) =>
  pointA.x * pointB.x + pointA.y * pointB.y;

/**
 * @returns The cross product of the two provided points.
 */
const crossProduct = (pointA: Point2DData, pointB: Point2DData) =>
  pointA.x * pointB.y - pointA.y * pointB.x;

/**
 * Gets the nearest coordinate of the provided point on an infinite line.
 *
 * @param linePoint A point that represents the start of the line.
 * @param lineVector A normalized vector representing the direction of the line.
 * @param point The point to compare with.
 */
const nearestPointOnLine = (linePoint: Point2DData, lineVector: Point2DData, point: Point2DData) => {
  const linePointToPoint = subtractPoints(point, linePoint);
  const t = dotProduct(linePointToPoint, lineVector);
  return {
    x: linePoint.x + lineVector.x * t,
    y: linePoint.y + lineVector.y * t,
  };
};

/**
 * Calculates the angle between the the provided points.
 *
 * ```
 * endA
 *   \
 *    \
 *     \__ result
 *      \_|________ endB
 *    start
 * ```
 */
const angleBetween = (start: Point2DData, endA: Point2DData, endB: Point2DData) => {
  const lineA = subtractPoints(start, endA);
  const lineB = subtractPoints(start, endB);

  const dot = dotProduct(lineA, lineB);
  const cross = crossProduct(lineA, lineB);

  return Math.atan2(cross, dot);
};

/**
 * Determines if the provided `point` is in the direction of the vector created from the `lineStart` to `lineEnd`.
 *
 * The following would produce true:
 * ```
 *     x------------x-------------x
 * lineStart      point         lineEnd
 * ```
 * ```
 *        point
 *          x
 *     x--------------------------x
 * lineStart                   lineEnd
 * ```
 *
 * The following would produce false:
 * ```
 *    x         x--------------------------x
 *  point    lineStart                  lineEnd
 * ```
 * ```
 *        x--------------------------x
 *     lineStart                   lineEnd
 *    x
 *  point
 * ```
 */
const isPointInDirection = (lineStart: Point2DData, lineEnd: Point2DData, point: Point2DData) => {
  const angle = angleBetween(lineStart, lineEnd, point);
  return Math.abs(angle) < Math.PI / 2;
};

/**
 * Converts from an angle where 0deg is right and a positive counter-clockwise, to an angle where 0 degrees is up and
 * positive is clockwise.
 */
const convertToCSSLinearGradientAngle = (angle: number) =>
  -angle + Math.PI / 2;

/**
 * @returns A normalized direction vector for the provided start and end points.
 */
const normalizedDirectionFromPoints = (start: Point2DData, end: Point2DData) => {
  const direction = subtractPoints(end, start);
  return normalizePoint(direction);
};

/**
 * Determines the linear gradient stop position for the provided point projected onto a CSS linear gradient line
 * corresponding to the provided angle.
 *
 *  ```
 *  (0, 1)_________________________(1, 1)
 *       |            |           /|
 *       |            |         /  |
 *       |            |(angle)/    |
 *       |            |_____/      |
 *       |            |   /        | The diagonal line represents a CSS linear gradient line of (pi/4)rad (45deg).
 *       |            | /          |
 *       | x (point)  x (0.5,0.5)  | The nearest point to the CSS gradient line is found based on the provided line.
 *       |   \      /              |
 *       |     \  /                |
 *       |      x                  |
 *       |    //                   | The result is the offset from the start of the CSS linear gradient line to the
 *       |  // <-- (result)        | projected point.
 *       |//_______________________|
 *  (0, 0)                         (1, 0)
 * ```
 *
 * @param angle The angle in radians for the CSS linear gradient that runs through (0.5, 0.5) where up is 0 and
 *              clockwise is the positive direction.
 * @param point The point in which to determine the stop percentage for in a coordinate space where +x is right and +y
 *              is up.
 *
 * @returns The corresponding stop position of the provided point where 1.0 is 100%. This value can be less than 0 or
 *          greater than 1.0.
 */
const stopPositionForPoint = (angle: number, point: Point2DData) => {
  const length = cssLinearGradientLength(angle);
  const center = {x: 0.5, y: 0.5};
  const points = linearGradientStartAndEndPoints(angle, length, center);
  const start = convertPoint(points.start);
  const end = convertPoint(points.end);
  const direction = normalizedDirectionFromPoints(start, end);

  const projectedPoint = nearestPointOnLine(center, direction, point);

  const offsetVector = subtractPoints(start, projectedPoint);
  let offsetDistance = hypot(offsetVector);
  const isPointInFront = isPointInDirection(start, end, projectedPoint);
  if (!isPointInFront) {
    offsetDistance *= -1;
  }
  return offsetDistance / length;
};

/**
 * Converts the provided point between the following coordinate spaces:
 * - (0, 0) is top left and (1, 1) is bottom right,
 * - (0, 0) is bottom left and (1, 1) is top right.
 */
export const convertPoint = (point: Point2DData) => {
  return {
    x: point.x,
    y: 1 - point.y,
  };
};

/**
 * Returns a string with a valid CSS <linear-gradient> value from a LinearGradient prefab instance.
 *
 * See https://drafts.csswg.org/css-images-3/#funcdef-linear-gradient
 */
export const linearGradientToCss = (gradient: LinearGradientData) => {
  if (gradient.stops.length === 0) {
    return 'linear-gradient(none)';
  }

  // LinearGradient's properties use a coordinate space where (0, 0) is top left and (1, 1) is bottom right.
  // Convert our coordinates into a space where (0, 0) is bottom left and (1, 1) is top right to make our angle math
  // easier.
  const start = convertPoint(gradient.start);
  const end = convertPoint(gradient.end);

  const difference = subtractPoints(end, start);

  const angle = Math.atan2(difference.y, difference.x);
  const cssGradientAngle = convertToCSSLinearGradientAngle(angle);
  const cssGradientLength = cssLinearGradientLength(angle);

  const stopPositionOffset = stopPositionForPoint(cssGradientAngle, start);
  const length = hypot(difference);

  const stops = gradient.stops.map((stop) => {
    const adjustedPosition = stopPositionOffset + (stop.position * length / cssGradientLength);
    const percentage = Math.round(adjustedPosition * 100);

    return `${colorToCss(stop.color)} ${percentage}%`;
  });

  const degrees = Math.round(cssGradientAngle * 180 / Math.PI);
  return `linear-gradient(${degrees}deg, ${stops.join(', ')})`;
};
