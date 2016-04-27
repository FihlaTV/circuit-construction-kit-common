// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );

  function SceneSelectionRadioButtonGroup( sceneProperty ) {
    var textOptions = { fontSize: 36 };
    RadioButtonGroup.call( this, sceneProperty, [ {
      value: 0,
      node: new Text( 1, textOptions )
    }, {
      value: 1,
      node: new Text( 2, textOptions )
    }, {
      value: 2,
      node: new Text( 3, textOptions )
    } ], {
      buttonContentXMargin: 30,
      buttonContentYMargin: 15,
      selectedStroke: PhetColorScheme.RESET_ALL_BUTTON_BASE_COLOR,
      selectedLineWidth: 4,
      baseColor: 'white'
    } );
  }

  return inherit( RadioButtonGroup, SceneSelectionRadioButtonGroup, {} );
} );