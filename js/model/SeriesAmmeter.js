// Copyright 2015-2016, University of Colorado Boulder

/**
 * Model for an ammeter than can be connected in series with a circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedLengthCircuitElement' );
  var NumberProperty = require( 'AXON/NumberProperty' );

  // constants
  var LENGTH = 110;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function SeriesAmmeter( startVertex, endVertex, tandem, options ) {
    options = _.extend( {
      resistance: CircuitConstructionKitConstants.DEFAULT_RESISTANCE
    }, options );
    FixedLengthCircuitElement.call( this, startVertex, endVertex, LENGTH, LENGTH, tandem );

    // @public (read-only) {Property.<number>} the resistance in ohms
    this.resistanceProperty = new NumberProperty( 0 ); // TODO: should this be a constant?
  }

  circuitConstructionKitCommon.register( 'SeriesAmmeter', SeriesAmmeter );

  return inherit( FixedLengthCircuitElement, SeriesAmmeter, {

      /**
       * Get the properties so that the circuit can be solved when changed.
       * @override
       * @returns {Property[]}
       * @public
       */
      getCircuitProperties: function() {
        return [ this.resistanceProperty ];
      },

      /**
       * Get the attributes as a state object for serialization.
       * @returns {Object}
       * @public
       */
      attributesToStateObject: function() {
        return {
          resistance: this.resistanceProperty.get()
        };
      }
    }
  );
} );