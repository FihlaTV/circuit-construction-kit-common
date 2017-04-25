// Copyright 2015-2017, University of Colorado Boulder

/**
 * Shows the silver solder at a connected vertex.  This is not interactive and is behind everything else.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Node = require( 'SCENERY/nodes/Node' );

  // constants
  var SOLDER_COLOR = '#ae9f9e';

  /**
   * @param {CircuitNode} circuitNode
   * @param {Vertex} vertex
   * @constructor
   */
  function SolderNode( circuitNode, vertex ) {
    var circuit = circuitNode.circuit;

    // @public (read-only)
    this.vertex = vertex;

    // @public (read-only) - added by CircuitNode during dragging, used for relative drag location.
    this.startOffset = null;

    // @public (read-only) - for hit testing with probes
    this.dottedLineNodeRadius = 11.2;

    // Start as a dotted line, becomes solid when connected to >1 element.
    var dottedLineNode = new Circle( this.dottedLineNodeRadius );

    Node.call( this, {
      children: [ dottedLineNode ]
    } );

    // Update the fill when the number of attached components changes.
    var updateFill = function() {
      var edgeCount = circuit.countCircuitElements( vertex );
      dottedLineNode.fill = edgeCount > 1 ? SOLDER_COLOR : null;
    };
    circuit.vertices.addItemAddedListener( updateFill );
    circuit.vertices.addItemRemovedListener( updateFill );

    // In Black Box, other wires can be detached from a vertex and this should also update the solder
    circuit.circuitElements.addItemAddedListener( updateFill );
    circuit.circuitElements.addItemRemovedListener( updateFill );

    var updateSolderNodePosition = function( position ) {
      dottedLineNode.center = position;
    };
    vertex.positionProperty.link( updateSolderNodePosition );

    var relayerListener = function() {
      circuitNode.fixSolderLayeringForVertex( vertex );
    };
    vertex.relayerEmitter.addListener( relayerListener );

    // @private (read-only) called by dispose()
    this.disposeSolderNode = function() {
      vertex.positionProperty.unlink( updateSolderNodePosition );

      circuit.vertices.removeItemAddedListener( updateFill );
      circuit.vertices.removeItemRemovedListener( updateFill );

      // In Black Box, other wires can be detached from a vertex and this should also update the solder
      circuit.circuitElements.removeItemAddedListener( updateFill );
      circuit.circuitElements.removeItemRemovedListener( updateFill );

      vertex.relayerEmitter.removeListener( relayerListener );
    };

    updateFill();
  }

  circuitConstructionKitCommon.register( 'SolderNode', SolderNode );

  return inherit( Node, SolderNode, {

    /**
     * Eliminate resources when no longer used.
     * @public
     */
    dispose: function() {
      this.disposeSolderNode();
      Node.prototype.dispose.call( this );
    }
  } );
} );