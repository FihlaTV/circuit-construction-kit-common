// Copyright 2016-2019, University of Colorado Boulder

/**
 * Renders and provides interactivity for FixedCircuitElements (all CircuitElements except Wires).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCUtils = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCUtils' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementNode' );
  const CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  const FixedCircuitElementHighlightNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementHighlightNode' );
  const Image = require( 'SCENERY/nodes/Image' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );
  const Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const Vector2 = require( 'DOT/Vector2' );

  // images
  const fireImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/fire.png' );

  // constants
  const matrix = new Matrix3();
  const rotationMatrix = new Matrix3();
  const FIRE_THRESHOLD = 15; // Beyond this number of amps, flammable CircuitElements catch on fire
  const ONE_AMP_PROPERTY = new Property( 1 ); // All batteries are flammable, so treat them as if they have nonzero resistance

  /**
   * Determine whether fire should be shown on the circuit element.
   * @param {number} current - in amps
   * @param {boolean} isValueDepictionEnabled - whether values are shown
   * @returns {boolean}
   */
  const isFireShown = ( current, isValueDepictionEnabled ) =>
    Math.abs( current ) >= FIRE_THRESHOLD && isValueDepictionEnabled;

  class FixedCircuitElementNode extends CircuitElementNode {
    /**
     * @param {CCKCScreenView} screenView - the main screen view, null for isIcon
     * @param {CircuitLayerNode} circuitLayerNode - Null if an isIcon is created
     * @param {FixedCircuitElement} circuitElement - the corresponding model element
     * @param {Property.<CircuitElementViewType>} viewTypeProperty
     * @param {Node} lifelikeNode - the Node that will display the component as a lifelike object.  Origin must be
     *                            - left-center
     * @param {Node} schematicNode - the Node that will display the component. Origin must be left-center.
     * @param {Tandem} tandem
     * @param options
     */
    constructor( screenView, circuitLayerNode, circuitElement,
                 viewTypeProperty, lifelikeNode, schematicNode, tandem, options ) {
      assert && assert( lifelikeNode !== schematicNode, 'schematicNode should be different than lifelikeNode' );

      const circuit = circuitLayerNode && circuitLayerNode.circuit;

      const contentNode = new Node();
      super( circuitElement, circuit, merge( {
        cursor: 'pointer',
        children: [ contentNode ],
        tandem: tandem,
        pickable: true
      }, options ) );

      // @private {Node} shows the lifelike view
      this.lifelikeNode = lifelikeNode;

      // @private {Node} shows the schematic view
      this.schematicNode = schematicNode;

      options = merge( {
        isIcon: false,
        showHighlight: true
      }, options );

      // @private {boolean} - whether an isIcon is being rendered
      this.isIcon = options.isIcon;

      // @public (read-only) {CircuitElement}
      this.circuitElement = circuitElement;

      // @private {CircuitLayerNode}
      this.circuitLayerNode = circuitLayerNode;

      // @protected (read-only) {Node} node that shows the component, separate from the part that shows the highlight and
      // the fire
      this.contentNode = contentNode;

      // @private {Image|null} - display the fire for flammable CircuitElements
      this.fireNode = null;

      // @protected (read-only) {Property.<CircuitElementViewType>
      this.viewTypeProperty = viewTypeProperty;

      // @private {function} - Show the selected node
      this.viewPropertyListener = this.setViewType.bind( this );
      viewTypeProperty.link( this.viewPropertyListener );

      // Add highlight (but not for icons)
      if ( !options.isIcon && options.showHighlight ) {

        // @protected (read-only) {FixedCircuitElementHighlightNode}
        this.highlightNode = new FixedCircuitElementHighlightNode( this );

        // Update the highlight bounds after it is created
        this.viewPropertyListener( viewTypeProperty.value );
      }

      // @private {function}
      this.markDirtyListener = this.markAsDirty.bind( this );
      circuitElement.vertexMovedEmitter.addListener( this.markDirtyListener );

      // @private {function}
      this.moveToFrontListener = this.moveFixedCircuitElementNodeToFront.bind( this );
      circuitElement.connectedEmitter.addListener( this.moveToFrontListener );
      circuitElement.vertexSelectedEmitter.addListener( this.moveToFrontListener );

      // @private {function}
      this.pickableListener = this.setPickable.bind( this );

      // LightBulbSocketNode cannot ever be pickable, so let it opt out of this callback
      options.pickable && circuitElement.interactiveProperty.link( this.pickableListener );

      // @private {boolean}
      this.fixedCircuitElementNodePickable = options.pickable;

      // Use whatever the start node currently is (it can change), and let the circuit manage the dependent vertices
      let startPoint = null;
      let dragged = false;
      if ( !options.isIcon ) {

        // @private {SimpleDragHandler}
        this.dragHandler = new SimpleDragHandler( {
          allowTouchSnag: true,
          start: event => {
            this.moveToFront();
            startPoint = event.pointer.point;
            circuitElement.interactiveProperty.get() && circuitLayerNode.startDragVertex(
              event.pointer.point,
              circuitElement.endVertexProperty.get(),
              false
            );
            dragged = false;
          },
          drag: event => {
            circuitElement.interactiveProperty.get() && circuitLayerNode.dragVertex(
              event.pointer.point,
              circuitElement.endVertexProperty.get(),
              false
            );
            dragged = true;
          },
          end: event =>
            this.endDrag( event, this.contentNode, [ circuitElement.endVertexProperty.get() ], screenView, circuitLayerNode, startPoint, dragged ),
          tandem: tandem.createTandem( 'dragHandler' )
        } );
        this.dragHandler.startDrag = function( event ) {
          if ( circuitLayerNode.canDragVertex( circuitElement.endVertexProperty.get() ) ) {
            circuitLayerNode.setVerticesDragging( circuitElement.endVertexProperty.get() );
            SimpleDragHandler.prototype.startDrag.call( this, event );
          }
        };
        this.contentNode.addInputListener( this.dragHandler );

        if ( options.showHighlight ) {

          // @private {function}
          this.updateHighlightVisibility = this.setSelectedCircuitElement.bind( this );
          circuitLayerNode.circuit.selectedCircuitElementProperty.link( this.updateHighlightVisibility );
        }

        // Show fire for batteries and resistors
        if ( circuitElement.isFlammable ) {

          this.fireNode = new Image( fireImage, { pickable: false, imageOpacity: 0.95 } );
          this.fireNode.mutate( { scale: this.contentNode.width / this.fireNode.width } );
          this.addChild( this.fireNode );

          // @private {Multilink} - Show fire in batteries and resistors with resistance > 0
          this.updateFireMultilink = Property.multilink( [
            circuitElement.currentProperty,
            ( circuitElement instanceof Resistor ) ? circuitElement.resistanceProperty : ONE_AMP_PROPERTY,
            screenView.model.isValueDepictionEnabledProperty
          ], this.updateFireVisible.bind( this ) );
        }
      }
    }

    /**
     * Set the view type
     * @param {CircuitElementViewType} viewType
     * @private
     */
    setViewType( viewType ) {
      this.contentNode.children = [ viewType === CircuitElementViewType.LIFELIKE ? this.lifelikeNode : this.schematicNode ];

      // Update the dimensions of the highlight.  For Switches, retain the original bounds (big enough to encapsulate
      // both schematic and lifelike open and closed).
      ( this.circuitElement.isSizeChangedOnViewChange && this.highlightNode ) && this.highlightNode.recomputeBounds( this );
    }

    /**
     * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
     * @protected - CCKCLightBulbNode calls updateRender for its child socket node
     */
    updateRender() {
      const startPosition = this.circuitElement.startPositionProperty.get();
      const endPosition = this.circuitElement.endPositionProperty.get();

      if ( startPosition.equals( endPosition ) ) {

        // We are (hopefully!) in the middle of updating both vertices and we (hopefully!) will receive another callback
        // shortly with the correct values for both startPosition and endPosition
        // See https://github.com/phetsims/circuit-construction-kit-common/issues/413
        // assert && timer.setTimeout( function() {
        //   assert && assert( !this.circuitElement.startPositionProperty.get().equals( this.circuitElement.endPositionProperty.get() ), 'vertices cannot be in the same spot' );
        // }, 0 );
        return;
      }

      const angle = Vector2.getAngleBetweenVectors( startPosition, endPosition );

      const magnitude = Vector2.getDistanceBetweenVectors( startPosition, endPosition );

      // Update the node transform in a single step, see #66
      matrix.setToTranslationRotationPoint( startPosition, angle );
      this.contentNode.setMatrix( matrix );

      if ( this.highlightNode && this.circuitLayerNode.circuit.selectedCircuitElementProperty.get() === this.circuitElement ) {
        this.highlightNode.setMatrix( matrix );
      }

      // Update the fire transform
      const flameExtent = 0.8;
      const scale = magnitude / fireImage.width * flameExtent;
      const flameMargin = ( 1 - flameExtent ) / 2;
      const flameX = magnitude * flameMargin / scale;
      const flameY = -fireImage.height;
      matrix.multiplyMatrix( rotationMatrix.setToScale( scale ) )
        .multiplyMatrix( rotationMatrix.setToTranslation( flameX, flameY ) );
      this.fireNode && this.fireNode.setMatrix( matrix );
    }

    /**
     * Move the circuit element node to the front
     * @private
     */
    moveFixedCircuitElementNodeToFront() {

      // Components outside the black box do not move in front of the overlay
      if ( this.circuitElement.interactiveProperty.get() ) {
        this.moveToFront();
        this.circuitElement.moveToFrontEmitter.emit();
        this.circuitElement.startVertexProperty.get().relayerEmitter.emit();
        this.circuitElement.endVertexProperty.get().relayerEmitter.emit();
      }
    }

    /**
     * Used as a bound callback listener in the constructor to update the highlight visibility
     * @param {CircuitElement|null} circuitElement
     * @private
     */
    setSelectedCircuitElement( circuitElement ) {
      const visible = ( circuitElement === this.circuitElement );
      CCKCUtils.setInSceneGraph( visible, this.circuitLayerNode.highlightLayer, this.highlightNode );
      this.markAsDirty();
    }

    /**
     * @public - dispose resources when no longer used
     * @override
     */
    dispose() {

      // Interrupt the drag event if it was in progress
      this.dragHandler && this.dragHandler.interrupt();
      this.circuitElement.vertexMovedEmitter.removeListener( this.markDirtyListener );
      this.updateHighlightVisibility && this.circuitLayerNode.circuit.selectedCircuitElementProperty.unlink( this.updateHighlightVisibility );
      this.circuitElement.connectedEmitter.removeListener( this.moveToFrontListener );
      this.circuitElement.vertexSelectedEmitter.removeListener( this.moveToFrontListener );
      this.fixedCircuitElementNodePickable && this.circuitElement.interactiveProperty.unlink( this.pickableListener );
      this.circuitLayerNode && this.highlightNode && CCKCUtils.setInSceneGraph( false, this.circuitLayerNode.highlightLayer, this.highlightNode );
      this.viewTypeProperty.unlink( this.viewPropertyListener );

      if ( !this.isIcon && this.updateFireMultilink ) {
        Property.unmultilink( this.updateFireMultilink );
      }

      // Detach the child nodes which are reused (so they don't have a _parents reference)
      this.contentNode.dispose();

      super.dispose();
    }

    /**
     * Hide or show the fire depending on various parameters
     * @param {number} current
     * @param {number} resistance
     * @param {boolean} isValueDepictionEnabled
     * @private - for listener bind
     */
    updateFireVisible( current, resistance, isValueDepictionEnabled ) {
      this.fireNode.visible = isFireShown( current, isValueDepictionEnabled ) && resistance >= 1E-8;
    }
  }

  /**
   * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
   * @public {Array.<Image>}
   */
  FixedCircuitElementNode.webglSpriteNodes = [
    new Image( fireImage )
  ];

  return circuitConstructionKitCommon.register( 'FixedCircuitElementNode', FixedCircuitElementNode );
} );