// Copyright 2015-2020, University of Colorado Boulder

/**
 * Constants used in all of the Circuit Construction Kit sims/screens/scenes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCQueryParameters' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Range = require( 'DOT/Range' );

  // constants
  const FONT_SIZE = 14;

  // constants
  const CCKCConstants = {

    // Maximum size for Width or height of icons in the circuit element toolbox or sensor toolbox
    TOOLBOX_ICON_SIZE: 60,

    // Spacing between adjacent items in the circuit element toolbox or sensor toolbox
    TOOLBOX_ITEM_SPACING: 30,

    // The resistance of a default resistor, also used in icons
    DEFAULT_RESISTANCE: 10,

    // The resistance of a default battery
    DEFAULT_BATTERY_RESISTANCE: 0,

    // The default capacitance in farads
    DEFAULT_CAPACITANCE: 0.1,

    // The range of the battery resistance
    BATTERY_RESISTANCE_RANGE: new Range( 0, 10 ),

    // Right side panel minWidth
    RIGHT_SIDE_PANEL_MIN_WIDTH: 190,

    // Padding for placement of control panels
    VERTICAL_MARGIN: 5,

    // Number of pixels (screen coordinates) that constitutes a tap instead of a drag
    TAP_THRESHOLD: 15,

    // Dimensions of track size found in sliders
    SLIDER_TRACK_SIZE: new Dimension2( 160, 5 ),

    // Uniform scaling for all font awesome node button icons
    FONT_AWESOME_ICON_SCALE: 0.85,

    // Color for selected objects (CircuitElement and Vertex)
    HIGHLIGHT_COLOR: new Color( 'yellow' ),

    // Line width for highlighting for selected objects
    HIGHLIGHT_LINE_WIDTH: 5,

    // Default resistivity for Wires and Switches (whose resistance varies with length)
    // R = rho * L / A.  Resistance = resistivity * Length / cross sectional area.
    // https://en.wikipedia.org/wiki/Electrical_resistivity_and_conductivity says copper has rho=1.68E-8 Ohm * m
    // According to http://www.sengpielaudio.com/calculator-cross-section.htm AWG Wire Gauge of 20 has 0.52mm^2 = 5.2e-7m^2
    DEFAULT_RESISTIVITY: 1.68E-8, // Ohm * m

    WIRE_CROSS_SECTIONAL_AREA: 5E-4, // meters squared

    // The lowest resistance a CircuitElement can have
    MINIMUM_RESISTANCE: 1E-8,

    // How far to erode the visible bounds for keeping the probes in bounds.
    DRAG_BOUNDS_EROSION: 20,

    // Distance between adjacent charges within a circuit element
    CHARGE_SEPARATION: 28,

    // Color of the background
    BACKGROUND_COLOR: new Color( '#99c1ff' ),

    // Length of a battery
    BATTERY_LENGTH: 102,

    // Length of the AC Voltage
    AC_VOLTAGE_LENGTH: 68,

    // Length of a switch, not so wide that electrons appear in the notches
    SWITCH_LENGTH: 112,

    SWITCH_START: 1 / 3, // fraction along the switch to the pivot
    SWITCH_END: 2 / 3, // fraction along the switch to the connection point

    // Length of a resistor
    RESISTOR_LENGTH: 110,

    FUSE_LENGTH: 110,
    WIRE_LENGTH: 100,

    CAPACITOR_LENGTH: 110,

    INDUCTOR_LENGTH: 110,

    // Length of household items in view coordinates
    COIN_LENGTH: 85,
    ERASER_LENGTH: 90,
    PENCIL_LENGTH: 130,
    HAND_LENGTH: 140,
    DOG_LENGTH: 170,
    DOLLAR_BILL_LENGTH: 140,
    PAPER_CLIP_LENGTH: 75,

    // Length
    SERIES_AMMETER_LENGTH: 121,

    // background for panels and radio buttons
    PANEL_COLOR: '#f1f1f2',

    // radius for panels and radio buttons
    CORNER_RADIUS: 6,

    // Line width for schematic view
    SCHEMATIC_LINE_WIDTH: 4,

    // The maximum resistance any circuit element can have.  An open switch is modeled as a high-resistance resistor
    MAX_RESISTANCE: 1000000000,

    // scale applied to the light bulb view
    BULB_SCALE: 2.52,

    // tweaker amount for the high resistance or high voltage components
    HIGH_EDITOR_DELTA: 100,

    // default resistance for the high resistance light bulb or high resistance resistor
    HIGH_RESISTANCE: 1000,

    HIGH_RESISTANCE_RANGE: new Range( 100, 10000 ),

    PANEL_LINE_WIDTH: 1.3,

    THUMB_SIZE: new Dimension2( 13, 24 ),

    MAJOR_TICK_LENGTH: 18,
    MINOR_TICK_LENGTH: 12,

    // The main font size to use for labels and controls
    FONT_SIZE: FONT_SIZE,

    DEFAULT_FONT: new PhetFont( FONT_SIZE ),

    // Number of wires that can be dragged out of the toolbox
    NUMBER_OF_WIRES: CCKCQueryParameters.moreWires ? 50 : 25,

    // Options to new DynamicSeries, used in the charts. Dark gray sampled from the design doc.  Line width increased
    // beyond 1.0 to avoid aliasing problems in the chart
    DYNAMIC_SERIES_OPTIONS: { color: '#717274', lineWidth: 1.5 },

    NUMBER_OF_TIME_DIVISIONS: 4,
    CHART_SERIES_COLOR: '#404041',

    MAX_DT: 0.5 // see https://github.com/phetsims/circuit-construction-kit-common/issues/476 and https://github.com/phetsims/joist/issues/130
  };

  circuitConstructionKitCommon.register( 'CCKCConstants', CCKCConstants );

  return CCKCConstants;
} );