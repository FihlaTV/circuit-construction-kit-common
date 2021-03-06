// Copyright 2015-2020, University of Colorado Boulder

/**
 * Node that represents a single scene or screen, with a circuit, toolbox, sensors, etc. Exists for the life of the sim
 * and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AdvancedAccordionBox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/AdvancedAccordionBox' );
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  const AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/AmmeterNode' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const CCKCQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCQueryParameters' );
  const ChargeSpeedThrottlingReadoutNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ChargeSpeedThrottlingReadoutNode' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElementEditContainerNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementEditContainerNode' );
  const CircuitElementToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementToolbox' );
  const CircuitLayerNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitLayerNode' );
  const CurrentChartNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CurrentChartNode' );
  const DisplayOptionsPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/DisplayOptionsPanel' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  const Property = require( 'AXON/Property' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const SensorToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SensorToolbox' );
  const SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  const StopwatchNode = require( 'SCENERY_PHET/StopwatchNode' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector2 = require( 'DOT/Vector2' );
  const ViewRadioButtonGroup = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ViewRadioButtonGroup' );
  const VoltageChartNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/VoltageChartNode' );
  const VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/VoltmeterNode' );
  const ZoomControlPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ZoomControlPanel' );

  // strings
  const batteryResistanceString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/batteryResistance' );
  const sourceResistanceString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/sourceResistance' );

  // constants
  const VERTICAL_MARGIN = CCKCConstants.VERTICAL_MARGIN;

  // Match margins with the carousel page control and spacing
  const HORIZONTAL_MARGIN = 17;

  // Group for aligning the content in the panels and accordion boxes.  This is a class variable instead of an
  // instance variable so the control panels will have the same width across all screens,
  // see https://github.com/phetsims/circuit-construction-kit-dc/issues/9
  const CONTROL_PANEL_ALIGN_GROUP = new AlignGroup( {

    // Elements should have the same widths but not constrained to have the same heights
    matchVertical: false
  } );

  class CCKCScreenView extends ScreenView {

    /**
     * @param {CircuitConstructionKitModel} model
     * @param {CircuitElementToolNode[]} circuitElementToolNodes - to be shown in the carousel
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( model, circuitElementToolNodes, tandem, options ) {

      options = merge( {

        // When used as a scene, the reset all button is suppressed here, added in the screen so that it may reset all
        // scenes (including but not limited to this one).
        showResetAllButton: false,
        toolboxOrientation: 'vertical',

        /* SEE ALSO OPTIONS IN CircuitElementToolbox*/

        showSeriesAmmeters: false,
        showNoncontactAmmeters: true,
        getCircuitEditPanelLayoutPosition: CircuitElementEditContainerNode.GET_LAYOUT_POSITION,
        showAdvancedControls: true,
        showCharts: false,
        blackBoxStudy: false,
        showStopwatchCheckbox: false,
        showPhaseShiftControl: false,
        hasACandDCVoltageSources: false // determines the string shown in the AdvancedAccordionBox
      }, options );

      super();

      // @public (read-only) {CircuitConstructionKitModel}
      this.model = model;

      // TODO(black-box-study): change background color to gray when isValueDepictionEnabledProperty goes false

      // @private - contains parts of the circuit that should be shown behind the controls
      this.circuitLayerNodeBackLayer = new Node();

      // @public (read-only) {CircuitLayerNode} - the circuit node
      this.circuitLayerNode = new CircuitLayerNode(
        model.circuit, this, tandem.createTandem( 'circuitLayerNode' )
      );

      const voltmeterNodes = model.voltmeters.map( voltmeter => {
        const voltmeterTandem = tandem.createTandem( 'voltmeterNode' + voltmeter.phetioIndex );
        const voltmeterNode = new VoltmeterNode( voltmeter, model, this.circuitLayerNode, voltmeterTandem, {
          showResultsProperty: model.isValueDepictionEnabledProperty,
          visibleBoundsProperty: this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty
        } );
        voltmeter.droppedEmitter.addListener( bodyNodeGlobalBounds => {
          if ( bodyNodeGlobalBounds.intersectsBounds( this.sensorToolbox.globalBounds ) ) {
            voltmeter.visibleProperty.value = false;
          }
        } );
        return voltmeterNode;
      } );

      const ammeterNodes = model.ammeters.map( ammeter => {
        const ammeterTandem = tandem.createTandem( 'ammeterNode' + ammeter.phetioIndex );
        const ammeterNode = new AmmeterNode( ammeter, this.circuitLayerNode, ammeterTandem, {
          showResultsProperty: model.isValueDepictionEnabledProperty,
          visibleBoundsProperty: this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty,
          blackBoxStudy: options.blackBoxStudy
        } );
        ammeter.droppedEmitter.addListener( bodyNodeGlobalBounds => {
          if ( bodyNodeGlobalBounds.intersectsBounds( this.sensorToolbox.globalBounds ) ) {
            ammeter.visibleProperty.value = false;
          }
        } );
        return ammeterNode;
      } );

      // Optionally initialize the chart nodes
      this.voltageChartNode = options.showCharts ? new VoltageChartNode(
        this.circuitLayerNode,
        model.circuit.timeProperty,
        this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty, {
          tandem: tandem.createTandem( 'voltageChartNode' )
        }
      ) : null;
      this.currentChartNode = options.showCharts ? new CurrentChartNode(
        this.circuitLayerNode,
        model.circuit.timeProperty,
        this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty, {
          tandem: tandem.createTandem( 'currentChartNode' )
        }
      ) : null;
      this.voltageChartNode && this.voltageChartNode.initializeBodyDragListener( this );
      this.currentChartNode && this.currentChartNode.initializeBodyDragListener( this );

      // @public (read-only) {CircuitElementToolbox} - Toolbox from which CircuitElements can be dragged
      this.circuitElementToolbox = new CircuitElementToolbox(
        model.viewTypeProperty,
        circuitElementToolNodes,
        tandem.createTandem( 'circuitElementToolbox' ),
        options.circuitElementToolboxOptions
      );

      // @protected {SensorToolbox} - so that subclasses can add a layout circuit element near it
      this.sensorToolbox = new SensorToolbox(
        CONTROL_PANEL_ALIGN_GROUP,
        this.circuitLayerNode,
        voltmeterNodes,
        ammeterNodes,
        this.voltageChartNode,
        this.currentChartNode,
        tandem.createTandem( 'sensorToolbox' ), {
          showSeriesAmmeters: options.showSeriesAmmeters,
          showNoncontactAmmeters: options.showNoncontactAmmeters,
          showCharts: options.showCharts
        } );

      // @private {ViewRadioButtonGroup}
      this.viewRadioButtonGroup = new ViewRadioButtonGroup(
        model.viewTypeProperty, tandem.createTandem( 'viewRadioButtonGroup' )
      );

      // @protected {DisplayOptionsPanel}
      this.displayOptionsPanel = new DisplayOptionsPanel(
        CONTROL_PANEL_ALIGN_GROUP,
        model.circuit.showCurrentProperty,
        model.circuit.currentTypeProperty,
        model.showValuesProperty,
        model.showLabelsProperty,
        model.stopwatch,
        options.showStopwatchCheckbox,
        tandem.createTandem( 'displayOptionsPanel' )
      );

      this.advancedAccordionBox = new AdvancedAccordionBox(
        model.circuit,
        CONTROL_PANEL_ALIGN_GROUP,
        options.hasACandDCVoltageSources ? sourceResistanceString : batteryResistanceString,
        tandem.createTandem( 'advancedAccordionBox' )
      );

      this.addChild( this.circuitLayerNodeBackLayer );

      // Reset All button
      let resetAllButton = null;
      if ( options.showResetAllButton ) {
        resetAllButton = new ResetAllButton( {
          tandem: tandem.createTandem( 'resetAllButton' ),
          listener: () => {
            model.reset();
            this.reset();
          }
        } );
        this.addChild( resetAllButton );
      }

      this.addChild( this.circuitElementToolbox );
      this.addChild( this.viewRadioButtonGroup );

      const controlPanelVBox = new VBox( {
        spacing: VERTICAL_MARGIN,
        children: options.showAdvancedControls ?
          [ this.displayOptionsPanel, this.sensorToolbox, this.advancedAccordionBox ] :
          [ this.displayOptionsPanel, this.sensorToolbox ]
      } );

      const box = new AlignBox( controlPanelVBox, {
        xAlign: 'right',
        yAlign: 'top',
        xMargin: HORIZONTAL_MARGIN,
        yMargin: VERTICAL_MARGIN
      } );
      this.visibleBoundsProperty.linkAttribute( box, 'alignBounds' );

      this.addChild( box );
      this.addChild( this.circuitLayerNode );

      const chargeSpeedThrottlingReadoutNode = new ChargeSpeedThrottlingReadoutNode(
        model.circuit.chargeAnimator.timeScaleProperty,
        model.circuit.showCurrentProperty,
        model.isValueDepictionEnabledProperty
      );
      this.addChild( chargeSpeedThrottlingReadoutNode );

      const circuitElementEditContainerNode = new CircuitElementEditContainerNode(
        model.circuit,
        this.visibleBoundsProperty,
        model.modeProperty,
        tandem.createTandem( 'circuitElementEditContainerNode' ), {
          showPhaseShiftControl: options.showPhaseShiftControl
        }
      );

      // @protected {CircuitElementEditContainerNode} - so the subclass can set the layout
      this.circuitElementEditContainerNode = circuitElementEditContainerNode;

      this.addChild( circuitElementEditContainerNode );

      // The voltmeter and ammeter are rendered with the circuit node so they will scale up and down with the circuit
      voltmeterNodes.forEach( voltmeterNode => this.circuitLayerNode.sensorLayer.addChild( voltmeterNode ) );
      ammeterNodes.forEach( ammeterNode => this.circuitLayerNode.sensorLayer.addChild( ammeterNode ) );
      this.voltageChartNode && this.circuitLayerNode.sensorLayer.addChild( this.voltageChartNode );
      this.currentChartNode && this.circuitLayerNode.sensorLayer.addChild( this.currentChartNode );

      // Create the zoom control panel
      const zoomControlPanel = new ZoomControlPanel( model.selectedZoomProperty, {
        tandem: tandem.createTandem( 'zoomControlPanel' )
      } );

      // Add the optional Play/Pause button
      if ( CCKCQueryParameters.showDepictValuesToggleButton ) {
        const playPauseButton = new PlayPauseButton( model.isValueDepictionEnabledProperty, {
          tandem: tandem.createTandem( 'playPauseButton' ),
          baseColor: '#33ff44' // the default blue fades into the background too much
        } );
        this.addChild( playPauseButton );
        this.visibleBoundsProperty.link( visibleBounds => {

          // Float the playPauseButton to the bottom left
          playPauseButton.mutate( {
            left: visibleBounds.left + VERTICAL_MARGIN,
            bottom: visibleBounds.bottom - VERTICAL_MARGIN - zoomControlPanel.height - VERTICAL_MARGIN
          } );
        } );
      }

      // Make it as wide as the circuit element toolbox
      zoomControlPanel.setScaleMagnitude( 0.8 );

      // Add it in front of everything (should never be obscured by a CircuitElement)
      // this.addChild( zoomControlPanel );

      this.visibleBoundsProperty.link( visibleBounds => {

        this.circuitElementToolbox.left = visibleBounds.left + VERTICAL_MARGIN +
                                          ( this.circuitElementToolbox.carousel ? 0 : 12 );
        this.circuitElementToolbox.top = visibleBounds.top + VERTICAL_MARGIN;
        this.viewRadioButtonGroup.top = this.circuitElementToolbox.bottom + 20;
        this.viewRadioButtonGroup.centerX = this.circuitElementToolbox.right - this.circuitElementToolbox.carousel.width / 2;

        // Float the resetAllButton to the bottom right
        options.showResetAllButton && resetAllButton.mutate( {
          right: visibleBounds.right - HORIZONTAL_MARGIN,
          bottom: visibleBounds.bottom - HORIZONTAL_MARGIN
        } );

        chargeSpeedThrottlingReadoutNode.mutate( {
          centerX: visibleBounds.centerX,
          bottom: visibleBounds.bottom - 100 // so it doesn't overlap the component controls
        } );

        zoomControlPanel.left = visibleBounds.left + HORIZONTAL_MARGIN;
        zoomControlPanel.bottom = visibleBounds.bottom - VERTICAL_MARGIN;
      } );

      // Center the circuit node so that zooms will remain centered.
      this.circuitLayerNode.setTranslation( this.layoutBounds.centerX, this.layoutBounds.centerY );
      this.circuitLayerNodeBackLayer.setTranslation( this.layoutBounds.centerX, this.layoutBounds.centerY );

      // Continuously zoom in and out as the current zoom interpolates, and update when the visible bounds change
      Property.multilink( [ model.currentZoomProperty, this.visibleBoundsProperty ], ( currentZoom, visibleBounds ) => {
        this.circuitLayerNode.setScaleMagnitude( currentZoom );
        this.circuitLayerNodeBackLayer.setScaleMagnitude( currentZoom );
        this.circuitLayerNode.updateTransform( visibleBounds );
      } );

      // When a Vertex is dropped and the CircuitElement is over the CircuitElementToolbox, the CircuitElement will go back
      // into the toolbox
      this.model.circuit.vertexDroppedEmitter.addListener( vertex => {

        const neighbors = this.model.circuit.getNeighborCircuitElements( vertex );
        if ( neighbors.length === 1 ) {
          const circuitElement = neighbors[ 0 ];
          const circuitElementNode = this.circuitLayerNode.getCircuitElementNode( circuitElement );

          if ( this.canNodeDropInToolbox( circuitElementNode ) ) {
            this.model.circuit.disposeCircuitElement( circuitElement );
          }
        }
      } );

      // Re-render after setting state
      _.hasIn( window, 'phet.phetIo.phetioEngine' ) && phet.phetIo.phetioEngine.phetioStateEngine.stateSetEmitter.addListener( () => {
        this.step( 1 / 60 );
      } );

      // @private - note whether the stopwatch should be repositioned when selected.  Otherwise it remembers its position
      this.stopwatchNodePositionDirty = true;

      // @public - the StopwatchNode
      if ( options.showStopwatchCheckbox ) {
        const stopwatchNode = new StopwatchNode( model.stopwatch, {
          visibleBoundsProperty: this.visibleBoundsProperty,
          right: controlPanelVBox.left - HORIZONTAL_MARGIN,
          tandem: tandem.createTandem( 'stopwatchNode' )
        } );
        this.addChild( stopwatchNode );

        // Show the StopwatchNode when the checkbox is checked
        model.stopwatch.isVisibleProperty.link( isVisible => {
          if ( isVisible && this.stopwatchNodePositionDirty ) {

            // Compute bounds lazily now that everything is attached to the scene graph
            model.stopwatch.positionProperty.value = new Vector2(
              controlPanelVBox.left - stopwatchNode.width - 10,

              // center the text are vertically on the checkbox, so the non-draggable buttons aren't right next to the checkbox
              this.globalToLocalBounds( this.displayOptionsPanel.stopwatchCheckbox.globalBounds ).centerY - stopwatchNode.height * 0.2
            );
            this.stopwatchNodePositionDirty = false;
          }
        } );
      }
    }

    /**
     * Move forward in time by the specified dt
     * @param {number} dt - seconds
     * @public
     */
    step( dt ) {

      // If the step is large, it probably means that the screen was hidden for a while, so just ignore it.
      // see https://github.com/phetsims/circuit-construction-kit-common/issues/476
      if ( dt >= CCKCConstants.MAX_DT ) {
        return;
      }

      this.circuitLayerNode.step( dt );

      this.voltageChartNode && this.voltageChartNode.step( this.model.circuit.timeProperty.value, dt );
      this.currentChartNode && this.currentChartNode.step( this.model.circuit.timeProperty.value, dt );
    }

    /**
     * Overrideable stub for resetting
     * @public
     */
    reset() {
      this.stopwatchNodePositionDirty = true;
      this.circuitElementToolbox.reset();
      this.advancedAccordionBox.expandedProperty.reset();
      this.voltageChartNode && this.voltageChartNode.reset();
      this.currentChartNode && this.currentChartNode.reset();
    }

    /**
     * Return true if and only if the CircuitElementNode can be dropped in the toolbox.
     * @param {CircuitElementNode} circuitElementNode
     * @returns {boolean}
     * @public
     */
    canNodeDropInToolbox( circuitElementNode ) {
      const circuitElement = circuitElementNode.circuitElement;

      // Only single (unconnected) elements can be dropped into the toolbox
      const isSingle = this.model.circuit.isSingle( circuitElement );

      // SeriesAmmeters should be dropped in the sensor toolbox
      const toolbox = circuitElement instanceof SeriesAmmeter ? this.sensorToolbox : this.circuitElementToolbox;

      // Detect whether the midpoint between the vertices overlaps the toolbox
      const globalMidpoint = circuitElementNode.localToGlobalPoint( circuitElement.getMidpoint() );
      const overToolbox = toolbox.globalBounds.containsPoint( globalMidpoint );

      return isSingle && overToolbox && circuitElement.canBeDroppedInToolbox;
    }
  }

  return circuitConstructionKitCommon.register( 'CCKCScreenView', CCKCScreenView );
} );
