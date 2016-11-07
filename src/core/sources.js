import I from 'immutable';

export class Source extends I.Record({
  path: null,
  type: null,
  content: null
}) {
  name() {
    if (this.path === null) {
      return null;
    }
    let segments = this.path.split('.');
    return segments[segments.length - 1];
  }
}

export const updateSourceSet = (sourceSet, pathSegments, updated) => {
  let path = pathSegments.join('.');
  if (updated) {
    if (updated.path === path) {
      return sourceSet.set(path, updated);
    }
    // Otherwise the path changed.
    return sourceSet.delete(path).set(updated.path, updated);
  }
  return sourceSet.delete(path);
};
