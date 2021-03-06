// Copyright 2019, University of Colorado Boulder

/**
 * Shows the voltage as a function of time on a scrolling chart.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCChartNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCChartNode' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const DynamicSeries = require( 'GRIDDLE/DynamicSeries' );
  const merge = require( 'PHET_CORE/merge' );
  const Tandem = require( 'TANDEM/Tandem' );

  // strings
  const currentWithUnitsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/currentWithUnits' );

  class CurrentChartNode extends CCKCChartNode {

    /**
     * @param {CircuitLayerNode} circuitLayerNode
     * @param {NumberProperty} timeProperty
     * @param {Property.<Bounds2>} visibleBoundsProperty
     * @param {Object} [options]
     */
    constructor( circuitLayerNode, timeProperty, visibleBoundsProperty, options ) {

      options = merge( {
        timeDivisions: CCKCConstants.NUMBER_OF_TIME_DIVISIONS,
        tandem: Tandem.OPTIONAL
      }, options );

      const series = new DynamicSeries( CCKCConstants.DYNAMIC_SERIES_OPTIONS );
      super( circuitLayerNode, timeProperty, visibleBoundsProperty, [ series ], currentWithUnitsString, options );

      // @private
      this.series = series;
      this.probeNode1 = this.addProbeNode(
        CCKCConstants.CHART_SERIES_COLOR,
        CCKCConstants.CHART_SERIES_COLOR,
        5,
        10,
        this.aboveBottomLeft1,
        options.tandem.createTandem( 'probeNode' )
      );

      // Align probes after positioning the body so icons will have the correct bounds
      this.alignProbesEmitter.emit();
    }

    /**
     * Records data and displays it on the chart
     * @param {number} time - total elapsed time in seconds
     * @param {number} dt - delta time since last update
     * @public
     */
    step( time, dt ) {
      if ( this.meter.visibleProperty.value ) {
        const current = this.circuitLayerNode.getCurrent( this.probeNode1 );
        this.series.addXYDataPoint( time, current === null ? NaN : current || 0 );
        while ( this.series.hasData() && this.series.getDataPoint( 0 ).x < this.timeProperty.value - CCKCConstants.NUMBER_OF_TIME_DIVISIONS ) {
          this.series.shiftData();
        }
      }
    }
  }

  return circuitConstructionKitCommon.register( 'CurrentChartNode', CurrentChartNode );
} );