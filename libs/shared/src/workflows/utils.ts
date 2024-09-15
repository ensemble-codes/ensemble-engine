
export function traverseAndInterpolate(obj: any, params: Map<string, string>): any {

  if (typeof obj === 'string') {
    // console.log('obj', obj);
    return obj.replace(/\$\w+/g, (match) => {
      // console.log('match', match);
      const key = match.slice(1); // Remove the $ sign
      // console.log('key', key);
      // console.log('key', params.get(key));
      // console.log(params[key] !== undefined ? params[key] : match)
      return params.has(key) ? params.get(key) : match;
    });
  }

  if (Array.isArray(obj)) {
    return obj.map(item => traverseAndInterpolate(item, params));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === '_id') {
        result[key] = value;
      } else {
        result[key] = traverseAndInterpolate(value, params);
      }
    }
    return result;
  }

  return obj;
}

