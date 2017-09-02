// Copyright 2017, University of Colorado Boulder

/**
 * Controls for showing and changing the wire resistivity.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var CircuitConstructionKitAccordionBox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitConstructionKitAccordionBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Text = require( 'SCENERY/nodes/Text' );
  var HSlider = require( 'SUN/HSlider' );

  // strings
  var lotsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/lots' );
  var tinyString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/tiny' );
  var wireResistivityString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/wireResistivity' );

  /**
   * @param {Property.<number>} wireResistivityProperty
   * @param {AlignGroup} alignGroup - for alignment with other controls
   * @param {Tandem} tandem
   * @constructor
   */
  function WireResistivityControl( wireResistivityProperty, alignGroup, tandem ) {
    var MAX_RESISTIVITY = 1;
    var slider = new HSlider( wireResistivityProperty, {
      min: CircuitConstructionKitCommonConstants.DEFAULT_RESISTIVITY,
      max: MAX_RESISTIVITY // large enough so that max resistance in a 9v battery slows to a good rate
    }, {
      trackSize: CircuitConstructionKitCommonConstants.SLIDER_TRACK_SIZE,
      thumbSize: CircuitConstructionKitCommonConstants.THUMB_SIZE,
      majorTickLength: CircuitConstructionKitCommonConstants.MAJOR_TICK_LENGTH,
      tandem: tandem.createTandem( 'slider' )
    } );

    /**
     * Creates label for the slider within the control accordionBox
     * @param {boolean} min - determines whether the label is the minimum or not
     *
     * @returns {Text} Text with the value of 'tiny' or 'lots'
     */
    var createLabel = function( min ) {
      return new Text( min ? tinyString : lotsString, { fontSize: 12, maxWidth: 45 } );
    };

    //REVIEW*: For creating labels, maybe just (a) pass in the string, or (b) have a variable for the Text options. Might not be worth a helper function with docs.
    slider.addMajorTick( 0, createLabel( true ) );
    slider.addMajorTick( MAX_RESISTIVITY, createLabel( false ) );

    CircuitConstructionKitAccordionBox.call( this, alignGroup.createBox( slider ), wireResistivityString, tandem );
  }

  circuitConstructionKitCommon.register( 'WireResistivityControl', WireResistivityControl );

  return inherit( CircuitConstructionKitAccordionBox, WireResistivityControl );
} );
