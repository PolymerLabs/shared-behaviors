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


function Dictionary(array) {
  return array.reduce(function(dictionary, item) {
    dictionary[item] = true;
  }, {});
}


function Inherit2D(parentPrototype, extendedPrototype, nestedInheritingObjectNames) {
  var childPrototype = parentPrototype ? Object.create(parentPrototype) : {};
  
  if (nestedInheritingObjectNames) {
    nestedInheritingObjectNames.forEach(function(property) {
      childPrototype[property] = Inherit2D(
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


function ParentPrototypeFor(prototype) {
  if (!prototype.extends) {
    return {};
  }
  
  if (typeof prototype.extends === 'string' && prototype.extends.indexOf('-') > -1) {
    return document.createElement(prototype.extends).constructor.prototype;
  }
  
  if (prototype.extends instanceof Function) {
    return prototype.extends.prototype;
  }
  
  if (prototype.extends instanceof Object) {
    return prototype.extends;
  }
  
  return {};
}


function AspectsFor(prototype) {
  return prototype.aspects || [];
}


function UnicornPrototype(extendedPrototype) {
  var parentPrototype = ParentPrototypeFor(extendedPrototype);
  var aspects = AspectsFor(extendedPrototype);
  var hierarchy = aspects.concat(extendedPrototype);
  
  var childPrototype = hierarchy.reduce(function(childPrototype, nextExtendedPrototype) {
    return Inherit2D(
      childPrototype,
      nextExtendedPrototype,
      PolymerObjectProperties
    );
  }, Object.create(parentPrototype));
  
  PolymerLifecycleMethods.forEach(function(method) {
    if (method in childPrototype) {
      childPrototype[method] = SpreadMethod(hierarchy, method);
    }
  });
  
  return childPrototype;
}


function FancyPolymer(prototype) {
  var unicorn = UnicornPrototype(prototype);
  
  if (Polymer.Base.isPrototypeOf(unicorn)) {
    return document.registerElement(unicorn.is, unicorn);
  }
  
  return Polymer(unicorn);
}