// cache should be workspace/folder agnostic as node_modules will be same across workspace
const barrelFilesList = new Set<string>();
export function add(value: string) {
  barrelFilesList.add(value)
}

export function has(value: string) {
  return barrelFilesList.has(value)
}

export function getAll() {
  return Array.from(barrelFilesList);
}

export function evict(value: string) {
  barrelFilesList.delete(value)
}

export function pushToRemote() {

}