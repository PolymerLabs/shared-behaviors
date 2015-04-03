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
  return (prototype.bonds || []).map(function(bond) {
    if (bond instanceof Function) {
      return bond.prototype;
    }
    
    return bond;
  });
}


function Bonded(prototype) {
  var hierarchy = BondsFor(prototype).concat(prototype);
  
  var childPrototype = hierarchy.reduce(function(childPrototype, nextPrototype) {
    return Extend2D(
      childPrototype,
      nextPrototype,
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
