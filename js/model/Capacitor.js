// Copyright 2019, University of Colorado Boulder

/**
 * Model for a capacitor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const DynamicCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/DynamicCircuitElement' );
  const merge = require( 'PHET_CORE/merge' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Range = require( 'DOT/Range' );

  // constants
  const CAPACITOR_LENGTH = CCKCConstants.CAPACITOR_LENGTH;

  class Capacitor extends DynamicCircuitElement {

    /**
     * @param {Vertex} startVertex
     * @param {Vertex} endVertex
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( startVertex, endVertex, tandem, options ) {
      options = merge( {
        capacitance: CCKCConstants.DEFAULT_CAPACITANCE,
        numberOfDecimalPlaces: 2
      }, options );

      super( startVertex, endVertex, CAPACITOR_LENGTH, tandem, options );

      // @public {Property.<number>} the capacitance in farads
      this.capacitanceProperty = new NumberProperty( options.capacitance, {
        range: new Range( 0.05, 0.20 ),
        tandem: tandem.createTandem( 'capacitanceProperty' )
      } );
    }

    /**
     * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
     * @public
     */
    dispose() {
      this.capacitanceProperty.dispose();
      super.dispose();
    }

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property.<*>[]}
     * @public
     */
    getCircuitProperties() {
      return [ this.capacitanceProperty ];
    }
  }

  return circuitConstructionKitCommon.register( 'Capacitor', Capacitor );
} );