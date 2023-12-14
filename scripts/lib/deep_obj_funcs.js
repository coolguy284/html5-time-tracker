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
