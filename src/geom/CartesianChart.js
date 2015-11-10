/* jshint browserify: true */
'use strict';

/**
 * @fileoverview Contains the CartesianChart class.
 * @author Jonathan Clare 
 * @copyright FlowingCharts 2015
 * @module geom/CartesianChart 
 */

var BoundingBox = require('./BoundingBox');
var Rectangle = require('./Rectangle');
var Point = require('./Point');
var canvas = require('../renderers/canvas');
var util = require('../util');
var extend = util.extend;

/** 
 * @class Maps data coords to pixel coords and vice versa.
 *
 * <p>The pixel coords are defined by a rectangle {@link pixelCoords}.
 * Pixel coords are relative to the top left corner of the chart.</p>
 *
 * <p>The data coords are defined by a bounding box {@link dataCoords}.
 * Data coords are relative to the bottom left corner of the chart.</p>
 * 
 * <p>The data coords may be adjusted to maintain the aspect ratio by setting 
 * the value of {@link maintainAspectRatio} to true.</p>
 *
 * @since 0.1.0
 * @author J Clare
 * @constructor
 *
 * @requires geom/BoundingBox
 * @requires geom/Rectangle
 * @requires geom/Point
 * @requires util.extend
 *
 * @param {Object} [options] The options.
 * @param {number} [options.dimensions.x] The x coord of the left edge (pixel units).
 * @param {number} [options.dimensions.y] The y coord of the top edge (pixel units).
 * @param {number} [options.dimensions.width] The width (pixel units).
 * @param {number} [options.dimensions.height] The height (pixel units).
 * @param {number} [options.xAxis.min] The x coord of the left edge (data units).
 * @param {number} [options.xAxis.max] The x coord of the right edge (data units).
 * @param {number} [options.yAxis.min] The y coord of the bottom edge (data units).
 * @param {number} [options.yAxis.max] The y coord of the top edge (data units).
 */
function CartesianChart (options)
{
    options = options !== undefined ? options : {};
    var defaultOptions =
    {
        container : null,
        dimensions :
        {
            x : 0,
            y : 0,
            width : 100,
            height : 100
        },
        axes :
        {
            xAxis :
            {
                min : 0,
                max : 100
            },
            yAxis :
            {
                min : 0,
                max : 100
            }
        }
    };
    extend(defaultOptions, options);

    window.console.log(defaultOptions);

    this._rect = new Rectangle(defaultOptions.dimensions.x,
                                defaultOptions.dimensions.y,
                                defaultOptions.dimensions.width,
                                defaultOptions.dimensions.height);
    this._bBox = new BoundingBox(defaultOptions.axes.xAxis.min,
                                defaultOptions.axes.yAxis.min,
                                defaultOptions.axes.xAxis.max,
                                defaultOptions.axes.yAxis.max);


    var c = canvas.getDrawingCanvas();
    canvas.appendTo(c, defaultOptions.container);
}

CartesianChart.prototype = 
{
    // Private variables
    _rect : null, // The rectangle defining the pixel coords.
    _bBox : null, // The bounding box defining the data coords.

    /** 
     * <p>If set to <code>true</code> the data space is
     * adjusted to maintain the aspect ratio.</p>
     * 
     * <p>If set to <code>false</code> the data space stretches
     * to fit the pixel space. This will generally result
     * in the aspect ratio changing (a stretching effect).</p>
     * 
     * @since 0.1.0
     * @type Boolean
     * @default false
     */
    maintainAspectRatio : false,

    /** 
     * Get or set the data coords.
     *
     * @since 0.1.0
     * @param {number} [xMin] The x coord of the left edge.
     * @param {number} [yMin] The y coord of the bottom edge.
     * @param {number} [xMax] The x coord of the right edge.
     * @param {number} [yMax] The y coord of the top edge.
     * @return {BoundingBox|CartesianChart} The data coords as a BoundingBox if no arguments are supplied, otherwise <code>this</code>.
     */
    dataCoords : function (xMin, yMin, xMax, yMax)
    {
        if (arguments.length > 0)
        {
            this._bBox.setCoords(xMin, yMin, xMax, yMax);
            this._onPropertyChanged();
            return this;
        }
        return this._bBox.clone();
    },

    /** 
     * Get or set the pixel coords.
     *
     * @since 0.1.0
     * @param {number} [x] The x coord of the left edge.
     * @param {number} [y] The y coord of the top edge.
     * @param {number} [w] The width.
     * @param {number} [h] The height.     
     * @return {Rectangle|CartesianChart} The pixel coords as a Rectangle if no arguments are supplied, otherwise <code>this</code>.
     */
    pixelCoords : function (x, y, w, h)
    {
        if (arguments.length > 0)
        {
            this._rect.setCoords(x, y, w, h);
            this._onPropertyChanged();
            return this;
        }
        return this._rect.clone();
    },

    /** 
     * A call to <code>_onPropertyChanged</code> commits any changes made to
     *
     * @private
     */
    _onPropertyChanged : function ()
    {
        // Stretches the bBox to fit the rect whilst maintaining the aspect ratio.
        if (this.maintainAspectRatio) 
        {
            var sy = this._bBox.getHeight() / this._rect.height();
            var sx = this._bBox.getWidth() / this._rect.width();

            var sBBoxX;
            var sBBoxY;
            var sBBoxW;
            var sBBoxH; 

            if (sy > sx)
            {
                sBBoxY = this._bBox.getYMin();
                sBBoxH = this._bBox.getHeight();
                sBBoxW = (this._rect.width() / this._rect.height()) * sBBoxH;
                sBBoxX = this._bBox.getXMin() - ((sBBoxW - this._bBox.getWidth()) / 2);
            }
            else if (sx > sy)
            {
                sBBoxX = this._bBox.getXMin();
                sBBoxW = this._bBox.getWidth();
                sBBoxH = (this._rect.height() / this._rect.width()) * sBBoxW;
                sBBoxY = this._bBox.getYMin() - ((sBBoxH - this._bBox.getHeight()) / 2);
            }
            else
            {
                sBBoxX = this._bBox.getXMin();
                sBBoxY = this._bBox.getYMin();
                sBBoxW = this._bBox.getWidth();
                sBBoxH = this._bBox.getHeight();
            }

            this._bBox.setXMin(sBBoxX);
            this._bBox.setYMin(sBBoxY);
            this._bBox.setWidth(sBBoxW);
            this._bBox.setHeight(sBBoxH);
        }
    },

    /** 
     * Converts a point from data units to pixel units.
     * 
     * @param {Point} dataPoint A point (data units).
     * @return {Point} A point (pixel units).
     */
    getPixelPoint : function (dataPoint)
    {
        return new Point(this.getPixelX(dataPoint.x), this.getPixelY(dataPoint.y));
    },

    /** 
     * Converts a bounding box (data units) to a rectangle (pixel units).
     * 
     * @param {BoundingBox} bBox A bounding box (data units).
     * @return {Rectangle} A rectangle (pixel units).
     */
    getPixelRect : function (bBox)
    {
        var x = this.getPixelX(bBox.getXMin());
        var y = this.getPixelY(bBox.getYMax());
        var w = this.getPixelWidth(bBox.getWidth());
        var h = this.getPixelHeight(bBox.getHeight());
        return new Rectangle(x, y, w, h);
    },

    /** 
     * Converts an x-coord from data units to pixel units.
     * 
     * @param {number} dataX An x-coord (data units).
     * @return {number} The x-coord (pixel units).
     */
    getPixelX : function (dataX)
    {
        var px = this._rect.x() + this.getPixelWidth(dataX - this.bBox.getXMin());
        return px;
    },

    /** 
     * Converts a y-coord from data units to pixel units.
     * 
     * @param {number} dataY A y-coord (data units).
     * @return {number} The y-coord (pixel units).
     */
    getPixelY : function (dataY)
    {
        var py =  this._rect.y() + this._rect.height() - this.getPixelHeight(dataY - this.bBox.getYMin());
        return py;
    },

    /** 
     * Converts a width from data units to pixel units.
     * 
     * @param {number} dataWidth A width (data units).
     * @return {number} The width (pixel units).
     */
    getPixelWidth : function (dataWidth)
    {
        if (dataWidth === 0) return 0;
        var pixelDistance  = (dataWidth / this.bBox.getWidth()) * this._rect.width();
        return pixelDistance;
    },

    /** 
     * Converts a height from data units to pixel units.
     * 
     * @param {number} dataHeight A height (data units).
     * @return {number} The height (pixel units).
     */
    getPixelHeight : function (dataHeight)
    {
        if (dataHeight === 0) return 0;
        var pixelDistance = (dataHeight / this.bBox.getHeight()) * this._rect.height();
        return pixelDistance;
    },

    /** 
     * Converts a point from pixel units to data units.
     * 
     * @param {Point} pixelPoint A point (pixel units).
     * @return {Point} A point (data units).
     */
    getDataPoint : function (pixelPoint)
    {
        var dataPoint = new Point(this.getDataX(pixelPoint.x),this.getDataY(pixelPoint.y));
        return dataPoint;
    },

    /** 
     * Converts a rectangle (pixel units) to a bBox (data units).
     * 
     * @param {Rectangle} pixelCoords A rectangle (pixel units).
     * @return {BoundingBox} A bBox (data units).
     */
    getDataCoords : function (pixelCoords)
    {
        var xMin = this.getPixelX(pixelCoords.x());
        var yMax = this.getPixelY(pixelCoords.y());
        var xMax = xMin + this.getPixelWidth(pixelCoords.width());
        var yMin = yMax - this.getPixelHeight(pixelCoords.height());
        return new BoundingBox(xMin, yMin, xMax, yMax);
    },

    /** 
     * Converts an x-coord from pixel units to data units.
     * 
     * @param {number} pixelX An x-coord (pixel units).
     * @return {number} An x-coord (data units).
     */
    getDataX : function (pixelX)
    {
        var dataX = this.bBox.getXMin() + this.getDataWidth(pixelX);
        return dataX;
    },

    /** 
     * Converts a y-coord from pixel units to data units.
     * 
     * @param {number} pixelY A y-coord (pixel units).
     * @return {number} A y-coord (data units).
     */
    getDataY : function (pixelY)
    {
        var dataY = this.bBox.getYMin() + this.getDataHeight(this._rect.height() - pixelY);
        return dataY;
    },

    /** 
     * Converts a width from pixel units to data units.
     * 
     * @param {number} pixelWidth A width (pixel units).
     * @return {number} A width (data units).
     */
    getDataWidth : function (pixelWidth)
    {
        if (pixelWidth === 0) return 0;
        var dataDistance = (pixelWidth / this._rect.width()) * this.bBox.getWidth();
        return dataDistance;
    },

    /** 
     * Converts a height from pixel units to data units.
     * 
     * @param {number} pixelHeight A height (pixel units).
     * @return {number} A height (data units).
     */
    getDataHeight : function (pixelHeight)
    {
        if (pixelHeight === 0)return 0;
        var dataDistance = (pixelHeight / this._rect.height()) * this.bBox.getHeight();
        return dataDistance;
    }
};

module.exports = CartesianChart;