import {DocsReference} from '@/api';
import {PropertyReference} from '@diez/compiler-core';

type ParsedExampleTree = import('@diez/targets').ParsedExampleTree;
type DocsPropertySpec = import('@diez/targets').DocsPropertySpec<any>;
type DocsTargetSpec = import('@diez/targets').DocsTargetSpec;

/**
 * Checks if a component has usage examples.
 */
export const hasExamples = (component?: DocsTargetSpec) => {
  return Boolean(component && component.examples && Object.keys(component.examples).length > 0);
};

/**
 * Gets component usage examples.
 */
export const findExampleFromSelection = (selection: string[], component?: DocsTargetSpec) => {
  if (!hasExamples(component)) {
    return null;
  }

  let result: ParsedExampleTree = component!.examples!;

  for (const item of selection) {
    result = result[item] as ParsedExampleTree;
  }

  return result;
};

/**
 * Checks if a component is a singleton.
 */
export const isBagOfComponents = (component: DocsTargetSpec) => {
  return !component.binding && !component.isPrimitive;
};

/**
 * Sort component properties putting singletons (bags of state) first.
 */
export const sortByBagsOfComponentsFirst = (properties: DocsPropertySpec) => {
  return Object.values(properties)
    .sort((a, b) => {
      const ea = Number(isBagOfComponents(a));
      const eb = Number(isBagOfComponents(b));

      if (ea > eb) {
        return -1;
      }

      if (ea < eb) {
        return 1;
      }

      return 0;
    });
};

/**
 * Find a component in the tree.
 */
export const findComponentFromPath = (pathArray: string[], trees: DocsTargetSpec[]) => {
  const rootPath = pathArray.shift();
  let component: DocsTargetSpec | undefined = trees.find((subtree) => subtree.id === `/${rootPath}`);

  if (!component) {
    return undefined;
  }

  while (pathArray.length) {
    const path = pathArray.shift();

    if (path === undefined) {
      return undefined;
    }

    if (component.properties[path]) {
      component = component.properties[path];
    } else {
      return undefined;
    }
  }

  return component;
};

/**
 * Find all types in a design language tree.
 */
export const findAvailableTypes = (tree: DocsTargetSpec[]) => {
  const types = new Set<string>();
  tree.forEach((item) => findAvailableTypesInBranch(item.properties, types));
  return types;
};

const findAvailableTypesInBranch = (branch: DocsPropertySpec, types: Set<string>) => {
  for (const item of Object.values(branch)) {
    if (item.binding) {
      types.add(item.type.toString());
      continue;
    }

    if (item.properties) {
      findAvailableTypesInBranch(item.properties, types);
    }
  }

  return types;
};

/**
 * Find a link to the Diez docs for the given type.
 */
export const getDocumentationLinkForType = (type: any) => {
  return `https://diez.org/docs/latest/classes/framework_prefabs.${type.toString().toLowerCase()}.html`;
};

const referenceCache = new Map<string, DocsReference>();

/**
 * Finds a component in the tree from a PropertyReference.
 */
export const findInTreeFromReference = (tree: DocsTargetSpec[], reference: PropertyReference): DocsReference | null => {
  const idPath = [reference.parentType.toString(), reference.name];
  const id = idPath.map((value) => value.toLowerCase()).join('/');

  if (referenceCache.has(id)) {
    return referenceCache.get(id)!;
  }

  for (const subtree of tree) {
    const maybeReference = findPropertyWithIdEndingWith(subtree, id);

    if (maybeReference) {
      const docsReference = {idPath, link: maybeReference.id};
      referenceCache.set(id, docsReference);
      return docsReference;
    }
  }

  return null;
};

/**
 * Recursively finds a component or property that has an id terminating with the provided path.
 */
const findPropertyWithIdEndingWith = (docsComponent: DocsTargetSpec, path: string): DocsTargetSpec | null => {
  if (docsComponent.id.toLowerCase().endsWith(path)) {
    return docsComponent;
  }

  for (const propValue of Object.values(docsComponent.properties)) {
    const foundNestedProperty = findPropertyWithIdEndingWith(propValue, path);

    if (foundNestedProperty) {
      return foundNestedProperty;
    }
  }

  return null;
};
