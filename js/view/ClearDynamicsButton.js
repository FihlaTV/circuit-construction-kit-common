// Copyright 2017-2019, University of Colorado Boulder

/**
 * Button that clears the magnetic field from an inductor or electric field from a capacitor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BanNode = require( 'SCENERY_PHET/BanNode' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  const RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const SCALE = 0.032;
  const SHAPE_MATRIX = Matrix3.createFromPool( SCALE, 0, 0, 0, -SCALE, 0, 0, 0, 1 ); // to create a unity-scale icon

  class ClearDynamicsButton extends RoundPushButton {

    /**
     * @param {DynamicCircuitElement} dynamicCircuitElement
     * @param {Tandem} tandem
     */
    constructor( dynamicCircuitElement, tandem ) {

      // This SVG data was exported from assets/flip_battery_icon.ai, which was created by @arouinfar.  Using illustrator,
      // save the AI file as SVG, then inspect the file to get the path declaration.
      const icon = new Path( new Shape( 'M885 970q18 -20 7 -44l-540 -1157q-13 -25 -42 -25q-4 0 -14 2q-17 5 -25.5 19t-4.5 30l197 808l-406 -101q-4 -1 -12 -1q-18 0 -31 11q-18 15 -13 39l201 825q4 14 16 23t28 9h328q19 0 32 -12.5t13 -29.5q0 -8 -5 -18l-171 -463l396 98q8 2 12 2q19 0 34 -15z' ).transformed( SHAPE_MATRIX ), {
        scale: 0.45,
        fill: Color.BLACK,
        center: Vector2.ZERO
      } );
      super( {
        baseColor: PhetColorScheme.BUTTON_YELLOW,
        content: new Node( {
          children: [
            icon,
            new BanNode( {
              lineWidth: 3,
              radius: 17
            } )
          ]
        } ),

        listener: () => dynamicCircuitElement.clear(),

        // TODO: these values are shared by RotateBatteryButton
        minXMargin: 10,
        minYMargin: 10,

        tandem: tandem,

        // TODO: are these unnecessary?  Could we just uninstrument as we did for NumberControl?
        phetioState: false,

        phetioComponentOptions: {
          phetioState: false
        }
      } );
    }
  }

  return circuitConstructionKitCommon.register( 'ClearDynamicsButton', ClearDynamicsButton );
} );