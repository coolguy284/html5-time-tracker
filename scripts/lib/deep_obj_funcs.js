function deepClone(obj) {
  switch (typeof obj) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'bigint':
    case 'string':
    case 'symbol':
      return obj;
    
    case 'object':
      if (obj == null) {
        return obj;
      } else if (Array.isArray(obj)) {
        return obj.map(x => deepClone(x));
      } else {
        return Object.fromEntries(
          Object.entries(obj)
            .map(x => [x[0], deepClone(x[1])])
        );
      }
    
    case 'function':
      throw new Error('cannot deep clone function');
  }
}

function deepEqual(obj1, obj2) {
  if (typeof obj1 != typeof obj2) {
    return false;
  }
  
  if (typeof obj1 != 'object' && typeof obj1 != 'function' || obj1 === null) {
    return Object.is(obj1, obj2);
  }
  
  if (typeof obj1 == 'function' || typeof obj2 == 'function') {
    throw new Error('cannot deep equals a function');
  }
  
  if (Array.isArray(obj1)) {
    if (!Array.isArray(obj2)) {
      return false;
    }
    
    if (obj1.length != obj2.length) {
      return false;
    }
    
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) {
        return false;
      }
    }
    
    return true;
  } else {
    if (Array.isArray(obj2)) {
      return false;
    }
    
    return deepEqual(Object.entries(obj1), Object.entries(obj2));
  }
}
