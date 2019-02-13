// Copyright 2017-2019, University of Colorado Boulder

/**
 * AccordionBox that is customized with constants for Circuit Construction Kit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AccordionBox = require( 'SUN/AccordionBox' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const Property = require( 'AXON/Property' );
  const Text = require( 'SCENERY/nodes/Text' );

  class CCKCAccordionBox extends AccordionBox {
    /**
     * @param {Node} content - the content to display in the accordion box when it is expanded
     * @param {string} title - the text to display in the title bar
     * @param {Tandem} tandem
     */
    constructor( content, title, tandem ) {
      super( content, {
        fill: CCKCConstants.PANEL_COLOR,
        cornerRadius: CCKCConstants.CORNER_RADIUS,
        titleXMargin: 10,
        buttonXMargin: 8,
        buttonYMargin: 8,
        titleYMargin: 4,
        titleXSpacing: 14,
        contentYSpacing: 0,
        lineWidth: CCKCConstants.PANEL_LINE_WIDTH,
        minWidth: CCKCConstants.RIGHT_SIDE_PANEL_MIN_WIDTH,
        expandedProperty: new Property( false ),
        titleNode: new HBox( {
          children: [
            new HStrut( 10 ),
            new Text( title, {
              fontSize: CCKCConstants.FONT_SIZE,
              maxWidth: 175,
              tandem: tandem
            } )
          ]
        } ),
        tandem: tandem
      } );
    }
  }

  return circuitConstructionKitCommon.register( 'CCKCAccordionBox', CCKCAccordionBox );
} );