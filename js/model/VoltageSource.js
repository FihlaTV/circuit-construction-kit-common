// Copyright 2015-2020, University of Colorado Boulder

/**
 * Base class for ACVoltage and Battery, which both supply a voltage across the Vertex instances.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCQueryParameters' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  const merge = require( 'PHET_CORE/merge' );
  const NumberProperty = require( 'AXON/NumberProperty' );

  class VoltageSource extends FixedCircuitElement {

    /**
     * @param {Vertex} startVertex - one of the battery vertices
     * @param {Vertex} endVertex - the other battery vertex
     * @param {Property.<number>} internalResistanceProperty - the resistance of the battery
     * @param {number} length - the length of the battery in view coordinates
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( startVertex, endVertex, internalResistanceProperty, length, tandem, options ) {
      assert && assert( internalResistanceProperty, 'internalResistanceProperty should be defined' );
      options = merge( {
        initialOrientation: 'right',
        voltage: 9.0,
        isFlammable: true,
        numberOfDecimalPlaces: 1,
        voltagePropertyOptions: {
          tandem: tandem.createTandem( 'voltageProperty' )
        }
      }, options );
      super( startVertex, endVertex, length, tandem, options );

      // @public {NumberProperty} - the voltage of the battery in volts
      this.voltageProperty = new NumberProperty( options.voltage, options.voltagePropertyOptions );

      // @public - keeps track of which solve iteration pass is in process, see https://github.com/phetsims/circuit-construction-kit-common/issues/245
      this.passProperty = new NumberProperty( 1 );

      // @public {Property.<number>} the internal resistance of the battery
      this.internalResistanceProperty = new DerivedProperty( [ this.voltageProperty, internalResistanceProperty, this.currentProperty, this.passProperty ],
        ( voltage, internalResistance, current, pass ) => {

          const result = pass === 2 ? CCKCQueryParameters.batteryInternalResistanceWhenCurrentThresholdExceededOffset +
                                      CCKCQueryParameters.batteryInternalResistanceWhenCurrentThresholdExceededVoltageScaleFactor * Math.abs( voltage ) :
                         internalResistance;
          // console.log( `voltage: ${voltage}, internalResistance: ${internalResistance}, current: ${current}, pass: ${pass}, result: ${result}` );
          return result;
        } );

      // @public (read-only) {string} - track which way the battery "button" (plus side) was facing the initial state so
      // the user can only create a certain number of "left" or "right" batteries from the toolbox.
      this.initialOrientation = options.initialOrientation;
    }

    /**
     * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
     * @public
     */
    dispose() {
      this.voltageProperty.dispose();
      super.dispose();
    }

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @returns {Property.<*>[]}
     * @override
     * @public
     */
    getCircuitProperties() {
      return [ this.voltageProperty ];
    }
  }

  return circuitConstructionKitCommon.register( 'VoltageSource', VoltageSource );
} );