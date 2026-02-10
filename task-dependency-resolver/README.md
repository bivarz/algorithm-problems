# Task Dependency Resolver

A small TypeScript utility to compute a valid execution order for tasks with dependencies and to report which tasks are blocked given a set of completed tasks.

## Overview

This repository contains an implementation of two helper functions used in project/task management systems:

- `resolveOrder(tasks: Task[]): string[]` — returns a valid execution order for all tasks (topological sort). Throws `Error("Circular dependency detected")` when cycles exist.

- `getBlockedTasks(tasks: Task[], completedIds: string[]): BlockedInfo[]` — lists tasks that are not yet completed and still have unmet dependencies, along with those missing dependency IDs.

The implementation uses Kahn's algorithm (topological sort) to produce an order and detect cycles.

## Types

```ts
interface Task {
  id: string;
  name: string;
  dependencies: string[]; // IDs of tasks that must be completed before this one
}

interface BlockedInfo {
  taskId: string;
  taskName: string;
  missingDependencies: string[]; // IDs of dependencies not yet completed
}
```

## Functions

- `resolveOrder(tasks: Task[]): string[]`
  - Returns an array of task IDs in a valid execution order (every task appears after its dependencies).
  - Throws `Error("Circular dependency detected")` if a cycle prevents a full ordering.
  - Throws `Error("Unknown dependency: <id>")` if a task references a dependency ID not present in the `tasks` array.

- `getBlockedTasks(tasks: Task[], completedIds: string[]): BlockedInfo[]`
  - Returns an array of `BlockedInfo` for each task that is not in `completedIds` and still has at least one dependency not in `completedIds`.

## Examples

Given the tasks:

```ts
const tasks: Task[] = [
  { id: 't1', name: 'Setup DB', dependencies: [] },
  { id: 't2', name: 'Build API', dependencies: ['t1'] },
  { id: 't3', name: 'Auth Module', dependencies: ['t1'] },
  { id: 't4', name: 'Build Frontend', dependencies: ['t2', 't3'] },
  { id: 't5', name: 'Write Tests', dependencies: ['t4'] },
  { id: 't6', name: 'Deploy', dependencies: ['t4', 't5'] },
];
```

- `resolveOrder(tasks)` → e.g. `['t1','t2','t3','t4','t5','t6']` (ordering between `t2` and `t3` may vary)

- `getBlockedTasks(tasks, ['t1','t2'])` →

```json
[
  {
    "taskId": "t4",
    "taskName": "Build Frontend",
    "missingDependencies": ["t3"]
  },
  { "taskId": "t5", "taskName": "Write Tests", "missingDependencies": ["t4"] },
  { "taskId": "t6", "taskName": "Deploy", "missingDependencies": ["t4", "t5"] }
]
```

Circular dependency example:

```ts
const cyclicTasks: Task[] = [
  { id: 'a', name: 'Task A', dependencies: ['c'] },
  { id: 'b', name: 'Task B', dependencies: ['a'] },
  { id: 'c', name: 'Task C', dependencies: ['b'] },
];

resolveOrder(cyclicTasks); // throws Error("Circular dependency detected")
```

## Run the included example

Install dev dependencies and run the example script (uses `ts-node`):

```bash
cd task-dependency-resolver
npm install
npm run example
```

The example is located at `src/example.ts` and demonstrates both `resolveOrder` and `getBlockedTasks`, plus the circular case.

## Files

- `src/index.ts` — implementation of `resolveOrder` and `getBlockedTasks`.
- `src/example.ts` — small runnable example.

## Notes

- Unknown dependency references will throw an `Error` indicating which dependency ID is missing.
- The algorithm is deterministic only up to the ordering of tasks with the same indegree; multiple valid orders can exist.
