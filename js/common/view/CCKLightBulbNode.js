// Copyright 2015-2016, University of Colorado Boulder

/**
 * Named CCKLightBulbNode to avoid collisions with SCENERY_PHET/LightBulbNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/FixedLengthCircuitElementNode' );
  var LightBulbNode = require( 'SCENERY_PHET/LightBulbNode' );
  var Property = require( 'AXON/Property' );
  var Util = require( 'DOT/Util' );
  var Matrix3 = require( 'DOT/Matrix3' );

  /**
   *
   * @constructor
   */
  function CCKLightBulbNode( circuitConstructionKitBasicsScreenView, circuitNode, lightBulb, options ) {
    var cckLightBulbNode = this;
    this.lightBulb = lightBulb;
    var brightnessProperty = new Property( 0.0 );
    lightBulb.currentProperty.link( function( current ) {
      var scaled = Math.abs( current ) / 20;
      var clamped = Util.clamp( scaled, 0, 1 );

      // Workaround for SCENERY_PHET/LightBulbNode which shows highlight even for current = 1E-16, so clamp it off
      // see https://github.com/phetsims/scenery-phet/issues/225
      if ( clamped < 1E-6 ) {
        clamped = 0;
      }
      brightnessProperty.value = clamped;
    } );
    var lightBulbNode = new LightBulbNode( brightnessProperty, {
      scale: 3.5
    } );
    var contentScale = 2.5;
    var scratchMatrix = new Matrix3();
    var scratchMatrix2 = new Matrix3();
    var updateLayout = function( startPosition, endPosition ) {
      var angle = endPosition.minus( startPosition ).angle() + Math.PI / 4;

      // Update the node transform in a single step, see #66
      scratchMatrix.setToTranslation( startPosition.x, startPosition.y )
        .multiplyMatrix( scratchMatrix2.setToRotationZ( angle ) )
        .multiplyMatrix( scratchMatrix2.setToScale( contentScale ) );
      lightBulbNode.setMatrix( scratchMatrix );

      cckLightBulbNode.highlightParent && cckLightBulbNode.highlightParent.setMatrix( scratchMatrix.copy() );
    };
    options = _.extend( {
      updateLayout: updateLayout,
      highlightOptions: {
        centerX: 0,

        // Offset the highlight vertically so it looks good, tuned manually
        bottom: FixedLengthCircuitElementNode.HIGHLIGHT_INSET * 0.75
      }
    }, options );
    FixedLengthCircuitElementNode.call( this, circuitConstructionKitBasicsScreenView, circuitNode, lightBulb, lightBulbNode, contentScale, options );

    // Set the initial location of the highlight, since it was not available in the supercall to updateLayout
    updateLayout( lightBulb.startVertex.position, lightBulb.endVertex.position );
  }

  circuitConstructionKitBasics.register( 'CCKLightBulbNode', CCKLightBulbNode );

  return inherit( FixedLengthCircuitElementNode, CCKLightBulbNode );
} );