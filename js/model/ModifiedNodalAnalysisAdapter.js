// Copyright 2019, University of Colorado Boulder

/**
 * TODO: Documentation
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ACVoltage = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ACVoltage' );
  const Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  const Capacitor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Capacitor' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const DynamicCircuit = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/DynamicCircuit' );
  const Fuse = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Fuse' );
  const Inductor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Inductor' );
  const LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  const ModifiedNodalAnalysisCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuitElement' );
  const Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  const SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  const Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  const TimestepSubdivisions = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/TimestepSubdivisions' );
  const Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );

  const errorThreshold = 1E-5;
  const minDT = 1E-5;

  class ResistiveBatteryAdapter extends DynamicCircuit.ResistiveBattery {

    constructor( c, battery ) {
      super( c.vertices.indexOf( battery.startVertexProperty.value ), c.vertices.indexOf( battery.endVertexProperty.value ), battery.voltageProperty.value, battery.internalResistanceProperty.value );
      this.battery = battery;
    }

    applySolution( result ) {

      //don't set voltage on the battery; that actually changes its nominal voltage
      // TODO: we don't need this, right?
      // this.battery.setMNACurrent( result.getInstantaneousCurrent( this ) );
      this.battery.currentProperty.value = result.getTimeAverageCurrent( this );
    }
  }

  class ResistorAdapter extends ModifiedNodalAnalysisCircuitElement {
    constructor( c, resistor ) {
      super(
        c.vertices.indexOf( resistor.startVertexProperty.value ),
        c.vertices.indexOf( resistor.endVertexProperty.value ),
        resistor,
        resistor.resistanceProperty.value
      );
      this.resistor = resistor;
    }

    applySolution( solution ) {
      this.resistor.currentProperty.value = solution.getTimeAverageCurrent( this );

      // TODO: is this necessary?  Where would it be used?
      //use average since it doesn't feed back in to the MNA solution
      // this.resistor.setVoltageDrop( solution.getTimeAverageVoltage( this ) );
      // this.resistor.setMNACurrent( solution.getInstantaneousCurrent( this ) ); // TODO: only used for capacitors and inductors
    }
  }

  class CapacitorAdapter extends DynamicCircuit.DynamicCapacitor {

    constructor( c, capacitor ) {
      const dynamicCircuitCapacitor = new DynamicCircuit.Capacitor(
        c.vertices.indexOf( capacitor.startVertexProperty.value ),
        c.vertices.indexOf( capacitor.endVertexProperty.value ),
        capacitor.capacitanceProperty.value
      );
      super( dynamicCircuitCapacitor, new DynamicCircuit.DynamicElementState( capacitor.mnaVoltageDrop, capacitor.mnaCurrent ) );
      this._capacitor = capacitor;
    }

    applySolution( solution ) {
      this._capacitor.currentProperty.value = solution.getTimeAverageCurrent( this.capacitor );
      this._capacitor.mnaCurrent = solution.getInstantaneousCurrent( this.capacitor );
      // this._capacitor.setVoltageDrop( solution.getTimeAverageVoltage( this.capacitor ) ); // TODO: is this needed?
      this._capacitor.mnaVoltageDrop = solution.getInstantaneousVoltage( this.capacitor );
    }
  }

  class InductorAdapter extends DynamicCircuit.DynamicInductor {

    constructor( c, inductor ) {
      const dynamicCircuitInductor = new DynamicCircuit.Inductor(
        c.vertices.indexOf( inductor.startVertexProperty.value ),
        c.vertices.indexOf( inductor.endVertexProperty.value ),
        inductor.inductanceProperty.value
      );

      //todo: sign error
      super( dynamicCircuitInductor, new DynamicCircuit.DynamicElementState( inductor.mnaVoltageDrop, -inductor.mnaCurrent ) );
      this._inductor = inductor;
    }

    applySolution( solution ) {

      // TODO: differentiate this.inductor from this._inductor.  They are very different types
      this._inductor.currentProperty.value = -solution.getTimeAverageCurrent( this.inductor );//todo: sign error
      this._inductor.mnaCurrent = -solution.getInstantaneousCurrent( this.inductor );
      // this._inductor.setVoltageDrop( solution.getTimeAverageVoltage( this.inductor ) ); // TODO: is this needed?
      this._inductor.mnaVoltageDrop = solution.getInstantaneousVoltage( this.inductor );
    }
  }

  class ModifiedNodalAnalysisAdapter {

    static apply( circuit, dt ) {
      const batteries = []; // ResistiveBatteryAdapter
      const resistors = []; // ResistorAdapter
      const capacitors = []; // CapacitorAdapter
      const inductors = []; // InductorAdapter
      for ( let i = 0; i < circuit.circuitElements.length; i++ ) {
        const branch = circuit.circuitElements.get( i ); // Branch
        if ( branch instanceof Battery ) {
          batteries.push( new ResistiveBatteryAdapter( circuit, branch ) );
        }
        else if ( branch instanceof Resistor ||
                  branch instanceof Fuse ||
                  branch instanceof Wire ||
                  branch instanceof LightBulb ||
                  branch instanceof SeriesAmmeter ||

                  // Since no closed circuit there; see below where current is zeroed out
                  ( branch instanceof Switch && branch.closedProperty.value ) ) {
          resistors.push( new ResistorAdapter( circuit, branch ) );
        }
        else if ( branch instanceof Switch && !branch.closedProperty.value ) {

          // no element for an open switch
        }
        else if ( branch instanceof Capacitor ) {
          capacitors.push( new CapacitorAdapter( circuit, branch ) );
        }
        else if ( branch instanceof ACVoltage ) {
          batteries.push( new ResistiveBatteryAdapter( circuit, branch ) );
        }
        else if ( branch instanceof Inductor ) {
          inductors.push( new InductorAdapter( circuit, branch ) );
        }
        else {
          assert && assert( false, 'Type not found: ' + branch.constructor.name );
        }
      }

      const dynamicCircuit = new DynamicCircuit( [], resistors, [], batteries, capacitors, inductors ); // new ObjectOrientedMNA() );

      const circuitResult = dynamicCircuit.solveWithSubdivisions( new TimestepSubdivisions( errorThreshold, minDT ), dt );
      batteries.forEach( batteryAdapter => batteryAdapter.applySolution( circuitResult ) );
      resistors.forEach( resistorAdapter => resistorAdapter.applySolution( circuitResult ) );
      capacitors.forEach( capacitorAdapter => capacitorAdapter.applySolution( circuitResult ) );
      inductors.forEach( inductorAdapter => inductorAdapter.applySolution( circuitResult ) );

      //zero out currents on open branches
      for ( let i = 0; i < circuit.circuitElements.length; i++ ) {
        const branch = circuit.circuitElements.get( i );
        if ( branch instanceof Switch && !branch.closedProperty.value ) {
          branch.currentProperty.value = 0.0;
          // sw.setVoltageDrop( 0.0 );
        }
      }
      circuit.setSolution( circuitResult );

      // Apply the node voltages to the vertices
      circuit.vertices.getArray().forEach( ( vertex, i ) => {

        // Unconnected vertices like those in the black box may not have an entry in the matrix, so mark them as zero.
        // TODO: should this average over states?
        const v = circuitResult.resultSet.states[ 0 ].state.solution.getNodeVoltage( i );
        vertex.voltageProperty.set( v || 0 );
      } );

      // fireCircuitSolved();
    }
  }

  return circuitConstructionKitCommon.register( 'ModifiedNodalAnalysisAdapter', ModifiedNodalAnalysisAdapter );
} );