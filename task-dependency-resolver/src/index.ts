export interface Task {
  id: string;
  name: string;
  dependencies: string[];
}

export interface BlockedInfo {
  taskId: string;

  taskName: string;

  missingDependencies: string[];
}

const tasks: Task[] = [
  { id: 't1', name: 'Setup DB', dependencies: [] },

  { id: 't2', name: 'Build API', dependencies: ['t1'] },

  { id: 't3', name: 'Auth Module', dependencies: ['t1'] },

  { id: 't4', name: 'Build Frontend', dependencies: ['t2', 't3'] },

  { id: 't5', name: 'Write Tests', dependencies: ['t4'] },

  { id: 't6', name: 'Deploy', dependencies: ['t4', 't5'] },
];

const cyclicTasks: Task[] = [
  { id: 'a', name: 'Task A', dependencies: ['c'] },

  { id: 'b', name: 'Task B', dependencies: ['a'] },

  { id: 'c', name: 'Task C', dependencies: ['b'] },
];

export function resolveOrder(tasks: Task[]): string[] {
  const resolvedTasks: string[] = [];
  let checkedTasks = new Set<string>();

  for (var round = 0; round < tasks.length; round++) {
    let taskIds: string[] = [];

    tasks.map((value) => {
      if (
        !checkedTasks.has(value.id) &&
        value.dependencies.every((dep) => checkedTasks.has(dep))
      ) {
        taskIds.push(value.id);
      }
    });

    if (taskIds.length > 0) {
      taskIds.forEach((id) => checkedTasks.add(id));
      resolvedTasks.push(...taskIds);
    } else {
      if (checkedTasks.size < tasks.length) {
        console.error('Cyclic dependency detected.');
      }
      break;
    }
  }

  console.log(resolvedTasks);
  return resolvedTasks;
}

export function getBlockedTasks(tasks: Task[], completedIds: string[]) {
  const completedSet = new Set(completedIds);
  const blockedTasks: BlockedInfo[] = [];

  for (var i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    if (!completedSet.has(task.id)) {
      const missingDependencies = task.dependencies.filter(
        (dep) => !completedSet.has(dep),
      );

      if (missingDependencies.length > 0) {
        blockedTasks.push({
          taskId: task.id,
          taskName: task.name,
          missingDependencies,
        });
      }
    }
  }
  console.log(blockedTasks);
  return blockedTasks;
}

resolveOrder(tasks);
resolveOrder(cyclicTasks);
getBlockedTasks(tasks, ['c']);
