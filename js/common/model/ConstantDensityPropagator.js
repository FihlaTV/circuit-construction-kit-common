// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var SmoothData = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/SmoothData' );

  // constants
  var FIRE_CURRENT = 10;
  var MIN_CURRENT = Math.pow( 10, -10 );
  var ELECTRON_DX = 0.56 / 2;
  var MAX_STEP = ELECTRON_DX * .43;
  var numEqualize = 2;
  var speedScale = .01 / 0.03;
  var highestSoFar = null;//for debugging

  var createCircuitLocation = function( branch, distance ) {
    assert && assert( branch.containsScalarLocation( distance ), 'branch should contain distance' );
    return { branch: branch, distance: distance, density: null };
  };

  function ConstantDensityPropagator( particleSet, circuit ) {
    this.particleSet = particleSet;
    this.circuit = circuit;
    this.scale = 1;
    this.smoothData = new SmoothData( 30 );
    this.timeScalingPercentValue = null;
    this.percent = '100';
  }

  return inherit( Object, ConstantDensityPropagator, {
    step: function( dt ) {
      var maxCurrent = this.getMaxCurrent();
      var maxVelocity = maxCurrent * speedScale;
      var maxStep = maxVelocity * dt;
      if ( maxStep >= MAX_STEP ) {
        this.scale = MAX_STEP / maxStep;
      }
      else {
        this.scale = 1;
      }
      this.smoothData.addData( this.scale * 100 );
      this.timeScalingPercentValue = this.smoothData.getAverage();

      this.percent = this.timeScalingPercentValue.toFixed( 2 );
      if ( this.percent.equals( '0' ) ) {
        this.percent = '1';
      }
      //todo add test for change before notify
      this.notifyListeners();
      for ( var i = 0; i < this.particleSet.numParticles(); i++ ) {
        var e = this.particleSet.particleAt( i );
        this.propagate( e, dt );
      }

      //maybe this should be done in random order, otherwise we may get artefacts.
      for ( i = 0; i < numEqualize; i++ ) {
        this.equalize( dt );
      }
    },
    getMaxCurrent: function() {
      var max = 0;
      for ( var i = 0; i < this.circuit.numBranches(); i++ ) {
        var current = this.circuit.branchAt( i ).getCurrent();
        max = Math.max( max, Math.abs( current ) );
      }
      return max;
    },
    equalizeAll: function( dt ) {
      var indices = [];
      for ( var i = 0; i < this.particleSet.numParticles(); i++ ) {
        indices.push( i );
      }
      _.shuffle( indices );
      for ( i = 0; i < this.particleSet.numParticles(); i++ ) {
        this.equalize( this.particleSet.particleAt( indices.get( i ) ), dt );
      }
    },
    equalizeElectron: function( electron, dt ) {
      //if it has a lower and upper neighbor, try to get the distance to each to be half of ELECTRON_DX
      var upper = this.particleSet.getUpperNeighborInBranch( electron );
      var lower = this.particleSet.getLowerNeighborInBranch( electron );
      if ( upper === null || lower === null ) {
        return;
      }
      var sep = upper.getDistAlongWire() - lower.getDistAlongWire();
      var myloc = electron.getDistAlongWire();
      var midpoint = lower.getDistAlongWire() + sep / 2;

      var dest = midpoint;
      var distMoving = Math.abs( dest - myloc );
      var vec = dest - myloc;
      var sameDirAsCurrent = vec > 0 && electron.getBranch().getCurrent() > 0;
      var myscale = 1000.0 / 30.0;//to have same scale as 3.17.00
      var correctionSpeed = .055 / numEqualize * myscale;
      if ( !sameDirAsCurrent ) {
        correctionSpeed = .01 / numEqualize * myscale;
      }
      var maxDX = Math.abs( correctionSpeed * dt );

      if ( distMoving > highestSoFar ) {//For debugging.
        highestSoFar = distMoving;
      }

      if ( distMoving > maxDX ) {
        //move in the appropriate direction maxDX
        if ( dest < myloc ) {
          dest = myloc - maxDX;
        }
        else if ( dest > myloc ) {
          dest = myloc + maxDX;
        }
      }
      if ( dest >= 0 && dest <= electron.getBranch().getLength() ) {
        electron.setDistAlongWire( dest );
      }

    },
    propagate: function( e, dt ) {
      var x = e.distance;
      assert && assert( _.isNumber( x ), 'disance along wire should be a number' );
      var current = e.getBranch().getCurrent();

      if ( current === 0 || Math.abs( current ) < MIN_CURRENT ) {
        return;
      }

      var speed = current * speedScale;
      var dx = speed * dt;
      dx *= this.scale;
      var newX = x + dx;
      var branch = e.circuitElement;
      if ( branch.containsScalarLocation( newX ) ) {
        e.setDistanceAlongWire( newX );
      }
      else {
        //need a new branch.
        var overshoot = 0;
        var under = false;
        if ( newX < 0 ) {
          overshoot = -newX;
          under = true;
        }
        else {
          overshoot = Math.abs( branch.getLength() - newX );
          under = false;
        }
        assert && assert( !isNaN( overshoot ), 'overshoot is NaN' );
        assert && assert( overshoot < 0, 'overshoot is <0' );
        var locationArray = this.getLocations( e, dt, overshoot, under );
        if ( locationArray.length === 0 ) {
          return;
        }
        //choose the branch with the furthest away electron
        var chosenCircuitLocation = this.chooseDestinationBranch( locationArray );
        e.setLocation( chosenCircuitLocation.branch, Math.abs( chosenCircuitLocation.getX() ) );
      }
    },
    chooseDestinationBranch: function( circuitLocations ) {
      // TODO: put the density in the location object
      var min = Number.POSITIVE_INFINITY;
      var argmin = null;
      for ( var i = 0; i < circuitLocations.length; i++ ) {
        circuitLocations[ i ].density = this.getDensity( circuitLocations[ i ] );
        if ( circuitLocations[ i ].density < min ) {
          min = circuitLocations[ i ].density;
          argmin = circuitLocations[ i ];
        }
      }
      return argmin;
    },
    getDensity: function( circuitLocation ) {
      var branch = circuitLocation.getBranch();
      return this.particleSet.getDensity( branch );
    },
    getLocations: function( electron, dt, overshoot, under ) {
      var branch = electron.getBranch();
      var jroot = null;
      if ( under ) {
        jroot = branch.getStartJunction();
      }
      else {
        jroot = branch.getEndJunction();
      }
      var adjacentBranches = this.circuit.getAdjacentBranches( jroot );
      var all = [];
      //keep only those with outgoing current.
      for ( var i = 0; i < adjacentBranches.length; i++ ) {
        var neighbor = adjacentBranches[ i ];
        var current = neighbor.getCurrent();
        if ( current > FIRE_CURRENT ) {
          current = FIRE_CURRENT;
        }
        else if ( current < -FIRE_CURRENT ) {
          current = -FIRE_CURRENT;
        }
        var distAlongNew = null;
        if ( current > 0 && neighbor.getStartJunction() === jroot ) {//start near the beginning.
          distAlongNew = overshoot;
          if ( distAlongNew > neighbor.getLength() ) {
            distAlongNew = neighbor.getLength();
          }
          else if ( distAlongNew < 0 ) {
            distAlongNew = 0;
          }
          all.push( createCircuitLocation( neighbor, distAlongNew ) );
        }
        else if ( current < 0 && neighbor.getEndJunction() === jroot ) {
          distAlongNew = neighbor.getLength() - overshoot;
          if ( distAlongNew > neighbor.getLength() ) {
            distAlongNew = neighbor.getLength();
          }
          else if ( distAlongNew < 0 ) {
            distAlongNew = 0;
          }
          all.add( createCircuitLocation( neighbor, distAlongNew ) );
        }
      }
      return all;
    }
  } );
} );