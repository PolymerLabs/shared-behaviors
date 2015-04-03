var PolymerLifecycleMethods = [
  'created',
  'ready',
  'attached',
  'detached',
  'registered'
];

var PolymerObjectProperties = [
  'properties',
  'listeners',
  'observers',
  'hostAttributes',
  'computed'
];


function Extend2D(parentPrototype, extendedPrototype, nestedExtendingObjectNames) {
  var childPrototype = parentPrototype ? Object.create(parentPrototype) : {};
  
  if (nestedExtendingObjectNames) {
    nestedExtendingObjectNames.forEach(function(property) {
      childPrototype[property] = Extend2D(
        parentPrototype[property],
        extendedPrototype[property]
      );
    });
  }
  
  Object.getOwnPropertyNames(extendedPrototype || {}).forEach(function(property) {
    if (childPrototype.hasOwnProperty(property)) {
      return;
    }
    
    Object.defineProperty(
      childPrototype,
      property,
      Object.getOwnPropertyDescriptor(
        extendedPrototype,
        property
      )
    );
  });
  
  return childPrototype;
}


function SpreadMethod(instances, method) {
  return function() {
    var args = arguments;
    
    instances && instances.forEach(function(instance) {
      if (method in instance) {
        instance[method].apply(this, args);
      }
    }, this);
  };
}


function BondsFor(prototype) {
  return prototype.bonds || [];
}


function BondedPrototype(extendedPrototype) {
  var hierarchy = BondsFor(extendedPrototype).concat(extendedPrototype);
  
  var childPrototype = hierarchy.reduce(function(childPrototype, nextExtendedPrototype) {
    return Extend2D(
      childPrototype,
      nextExtendedPrototype,
      PolymerObjectProperties
    );
  }, {});
  
  PolymerLifecycleMethods.forEach(function(method) {
    if (method in childPrototype) {
      childPrototype[method] = SpreadMethod(hierarchy, method);
    }
  });
  
  return childPrototype;
}


function BondedPolymer(prototype) {
  return Polymer(BondedPrototype(prototype));
}