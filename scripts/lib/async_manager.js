// class for managing and waiting on asynchronous events
class AsyncManager {
  #currentTasks = new Map();
  #currentGroups = new Map();
  #allTasksFinishListeners = new Set();
  
  taskCurrentlyRunning(taskName) {
    return this.#currentTasks.has(taskName);
  }
  
  groupCurrentlyRunning(groupName) {
    return this.#currentGroups.has(groupName);
  }
  
  #checkIfGroupLive(groupName) {
    for (let [ taskName, taskObj ] of this.#currentTasks) {
      if (taskObj.groupNames.has(groupName)) {
        return true;
      }
    }
    
    return false;
  }
  
  groupsCurrentlyRunning(groupNames) {
    return groupNames.some(groupName => this.#currentGroups.has(groupName));
  }
  
  anyTaskRunning() {
    return this.#currentTasks.size > 0;
  }
  
  async awaitTaskFinish(taskName) {
    if (!this.taskCurrentlyRunning(taskName)) return;
    
    await new Promise(resolve => {
      this.#currentTasks.get(taskName).finishListeners.add(resolve);
    });
  }
  
  async awaitGroupFinish(groupName) {
    if (!this.groupCurrentlyRunning(groupName)) return;
    
    await new Promise(resolve => {
      this.#currentGroups.get(groupName).finishListeners.add(resolve);
    });
  }
  
  async awaitGroupsFinish(groupNames) {
    if (!this.groupsCurrentlyRunning(groupNames)) return;
    
    let anyGroupRunning;
    
    do {
      anyGroupRunning = false;
      
      for (let groupName of groupNames) {
        if (this.groupCurrentlyRunning(groupName)) {
          anyGroupRunning = true;
          await this.awaitGroupFinish(groupName);
        }
      }
    } while (anyGroupRunning);
  }
  
  async awaitAllTasksFinish() {
    if (!this.anyTaskRunning()) return;
    
    await new Promise(resolve => {
      this.#allTasksFinishListeners.add(resolve);
    });
  }
  
  async startAsyncTask(taskName, groupNames, exclusive, enterHandlers, exitHandlers) {
    switch (exclusive) {
      case 'task':
        if (this.taskCurrentlyRunning(taskName)) {
          await this.awaitTaskFinish(taskName);
        }
        
        if (this.taskCurrentlyRunning(taskName)) {
          throw new Error('awaitTaskFinish failed');
        }
        break;
      
      case 'group':
        if (groupNames.length == 0) {
          throw new Error('Task must have groups if exclusive mode is group');
        }
        
        if (this.groupsCurrentlyRunning(groupNames)) {
          await this.awaitGroupsFinish(groupNames);
        }
        
        if (this.groupsCurrentlyRunning(groupNames)) {
          throw new Error('awaitGroupsFinish failed');
        }
        break;
      
      case 'all':
        if (this.anyTaskRunning()) {
          await this.awaitAllTasksFinish();
        }
        
        if (this.anyTaskRunning()) {
          throw new Error('awaitAllTasksFinish failed');
        }
        break;
      
      default:
        throw new Error('Invalid value for exclusive');
    }
    
    for (let handler of enterHandlers) {
      await handler();
    }
    
    let asyncTask = {
      groupNames: new Set(groupNames),
      finishListeners: new Set(exitHandlers),
    };
    
    this.#currentTasks.set(taskName, asyncTask);
    
    for (let groupName of groupNames) {
      if (!this.groupCurrentlyRunning(groupName)) {
        let asyncGroup = {
          finishListeners: new Set(),
        };
        
        this.#currentGroups.set(groupName, asyncGroup);
      }
    }
    
    return {
      finish: this.#getOneTimeUseStopAsyncTask(taskName),
    };
  }
  
  async #stopAsyncTask(taskName) {
    if (!this.#currentTasks.has(taskName)) {
      throw new Error(`Async Task ${taskName} does not exist`);
    }
    
    let finishListenersToCall = [];
    
    let finishedAsyncTask = this.#currentTasks.get(taskName);
    
    for (let listener of finishedAsyncTask.finishListeners) {
      finishListenersToCall.push(listener);
    }
    
    this.#currentTasks.delete(taskName);
    
    for (let groupName of finishedAsyncTask.groupNames) {
      if (!this.#checkIfGroupLive(groupName)) {
        if (!this.groupCurrentlyRunning(groupName)) {
          throw new Error('Error: group was deleted while tasks still running');
        } else {
          let finishedGroup = this.#currentGroups.get(groupName);
          
          for (let listener of finishedGroup.finishListeners) {
            finishListenersToCall.push(listener);
          }
          
          this.#currentGroups.delete(groupName);
        }
      }
    }
    
    if (!this.anyTaskRunning()) {
      for (let listener of this.#allTasksFinishListeners) {
        finishListenersToCall.push(listener);
      }
    }
    
    for (let listener of finishListenersToCall) {
      try {
        await listener();
      } catch (e) {
        console.error(e);
      }
    }
  }
  
  #getOneTimeUseStopAsyncTask(taskName) {
    let alreadyStopped = false;
    
    return async () => {
      if (alreadyStopped) {
        throw new Error('Cannot stop async task as it is already stopped.');
      }
      
      await this.#stopAsyncTask(taskName);
      
      alreadyStopped = true;
    };
  }
  
  wrapAsyncFunction(options, func) {
    if (!('taskName' in options)) throw new Error('property taskName not found');
    if (!('groupNames' in options)) throw new Error('property groupNames not found');
    if (!('critical' in options)) throw new Error('property critical not found');
    if (!('alreadyRunningBehavior' in options)) throw new Error('property alreadyRunningBehavior not found');
    if (!('exclusive' in options)) throw new Error('property exclusive not found');
    let enterHandlers = options.enterHandlers ?? [];
    let exitHandlers = options.exitHandlers ?? [];
    
    return async (...args) => {
      let asyncTaskHandle;
      
      switch (options.alreadyRunningBehavior) {
        case 'stop':
          switch (options.exclusive) {
            case 'task':
              if (this.taskCurrentlyRunning(options.taskName)) {
                return;
              }
              break;
            
            case 'group':
              if (this.groupCurrentlyRunning(options.groupName)) {
                return;
              }
              break;
            
            case 'all':
              if (this.anyTaskRunning()) {
                return;
              }
              break;
            
            default:
              throw new Error('Invalid value for exclusive');
          }
          
          asyncTaskHandle = await this.startAsyncTask(options.taskName, options.groupNames, options.exclusive, enterHandlers, exitHandlers);
          break;
        
        case 'wait':
          asyncTaskHandle = await this.startAsyncTask(options.taskName, options.groupNames, options.exclusive, enterHandlers, exitHandlers);
          break;
      }
      
      try {
        let criticalHandle;
        
        if (options.critical) {
          criticalHandle = criticalCodeManager.startCriticalCode();
        }
        
        try {
          return await func(...args);
        } finally {
          if (options.critical) {
            criticalHandle.stop();
          }
        }
      } finally {
        await asyncTaskHandle.finish();
      }
    };
  }
  
  wrapAsyncFunctionWithButton(name, btn, func) {
    return this.wrapAsyncFunction({
      taskName: name,
      critical: false,
      alreadyRunningBehavior: 'wait',
      exclusive: 'task',
      enterHandlers: [
        () => {
          if (Array.isArray(btn)) {
            btn.forEach(x => x.setAttribute('disabled', ''));
          } else {
            btn.setAttribute('disabled', '');
          }
        },
      ],
      exitHandlers: [
        () => {
          if (Array.isArray(btn)) {
            btn.forEach(x => x.removeAttribute('disabled'));
          } else {
            btn.removeAttribute('disabled');
          }
        },
      ],
    }, func);
  }
}
