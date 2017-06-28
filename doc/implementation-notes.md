# Circuit Construction Kit Common - implementation notes

This document contains miscellaneous notes related to the implementation of circuit-construction-kit-common. It
supplements the internal (source code) documentation, and (hopefully) provides insight into "big picture" implementation
issues.  The audience for this document is software developers who are familiar with JavaScript and PhET simulation 
development (as described in [PhET Development Overview] (http://bit.ly/phet-html5-development-overview)).

This repo is supposed to contain code that would be used in potentially any circuit construction kit offshoot.  
However, since we don't have designs for some of the sims (such as AC), it is kind of like a kitchen sink **or** a 
dedicated repo for the CCK-DC simulation.

First, read [model.md](https://github.com/phetsims/circuit-construction-kit-common/blob/master/doc/model.md), which 
provides a high-level description of the simulation model.

## Terminology

This section enumerates terms that you'll see used throughout the internal and external documentation. In no particular 
order:

* CircuitElement - a model object that can participate in a circuit, such as a Wire, Resistor, Battery, etc.
* FixedLengthCircuitElement - a CircuitElement that cannot be stretched out, such as a Battery or Resistor.  The only 
stretchy element is a Wire, so every CircuitElement that is not a Wire is a FixedLengthCircuitElement.
* Vertex - the circuit is organized as a graph, where the edges are CircuitElements and the vertices are Vertex 
instances.  After the circuit is solved for unknown currents, a voltage is assigned to each Vertex.
* Ammeter - this ammeter is a "non-contact" ammeter which can take readings of a current by measuring magnetic fields
(without touching the circuit)
* SeriesAmmeter - this ammeter is a CircuitElement which measures current flowing through it. 

## General

This section describes how this simulation uses patterns that are common to most PhET simulations.

**Model-view transform**: Many PhET simulations have a model-view transform that maps between model and view coordinate 
frames (see [ModelViewTransform2](https://github.com/phetsims/phetcommon/blob/master/js/view/ModelViewTransform2.js)).
While the CircuitElements are treated as physical objects, the dimensions of the objects have no bearing on the physics
of the circuitry (aside from the resistivity of wires), hence the model and view coordinates are taken as the same, with 
the origin at the center of the screen. (If you don't understand that, don't worry about it.).  The layout reflows to 
move control panels to the edges to maximize the available play area.

**Query parameters**: Query parameters are used to enable sim-specific features, mainly for debugging and
testing. All such query parameters are documented in
[CircuitConstructionKitQueryParameters](https://github.com/phetsims/circuit-construction-kit-common/blob/master/js/CircuitConstructionKitQueryParameters.js).

**Memory management**: This simulation dynamically creates and disposes many objects (no CircuitElements are preallocated).
This helps in modularity of the code and will provide a straightforward interface for PhET-iO.  However, dispose()
must be properly implemented in all CircuitElements and CircuitElementNodes, and called when items are removed.

## Model
See [model.md](https://github.com/phetsims/circuit-construction-kit-common/blob/master/doc/model.md)

## View

* Each node defines its own lifelike and schematic nodes internally, so nothing needs to be disposed or re-created when
the view type changes.
* View Layering: the CircuitLayerNode shows circuit elements, highlights, solder, and sensors.  Each CircuitElementNode
may node parts that appear in different layers, such as the highlight and the light bulb socket.  Having the light bulb
socket in another layer makes it possible to show the electrons going "through" the socket (in z-ordering). The 
CircuitElementNode constructors populate different layers of the CircuitLayerNode in their constructors and depopulate 
in their dispose functions.
* To attain reasonable performance on iPad2, some of the CircuitLayerNode child node layers have been implemented in 
WebGL using `renderer:'webgl'`.  This means all of the nodes must be rendered with solid-fill Rectangle (without rounded 
corners or gradients), and images.  Node.toDataURLNodeSynchronous is used throughout these view layers to rasterize as 
images. 

This document was adapted from the [Implementation Notes for Function Builder](https://github.com/phetsims/function-builder/blob/master/doc/implementation-notes.md)