// class for managing and waiting on asynchronous events
class AsyncManager {
  #currentTasks = new Map();
  #allTasksFinishListeners = new Set();
  
  taskCurrentlyRunning(name) {
    return this.#currentTasks.has(name);
  }
  
  anyTaskRunning() {
    return this.#currentTasks.size > 0;
  }
  
  async awaitTaskFinish(name) {
    if (!this.taskCurrentlyRunning(name)) return;
    
    await new Promise(resolve => {
      this.#currentTasks.get(name).finishListeners.add(resolve);
    });
  }
  
  async awaitAllTasksFinish() {
    if (!this.anyTaskRunning()) return;
    
    await new Promise(resolve => {
      this.#allTasksFinishListeners.add(resolve);
    });
  }
  
  async startAsyncTask(name, exclusive, enterHandlers, exitHandlers) {
    if (exclusive) {
      if (this.anyTaskRunning()) {
        await this.awaitAllTasksFinish();
      }
    } else {
      if (this.taskCurrentlyRunning(name)) {
        await this.awaitTaskFinish(name);
      }
    }
    
    if (this.#currentTasks.has(name)) {
      throw new Error('awaitTaskFinish failed');
    }
    
    for (let handler of enterHandlers) {
      await handler();
    }
    
    let asyncTask = {
      finishListeners: new Set(exitHandlers),
    };
    
    this.#currentTasks.set(name, asyncTask);
    
    return {
      finish: this.#getOneTimeUseStopAsyncTask(name),
    };
  }
  
  async #stopAsyncTask(name) {
    if (!this.#currentTasks.has(name)) {
      throw new Error(`Async Task ${name} does not exist`);
    }
    
    let finishedAsyncTask = this.#currentTasks.get(name);
    
    for (let listener of finishedAsyncTask.finishListeners) {
      try {
        await listener();
      } catch (err) {
        console.error(err);
      }
    }
    
    this.#currentTasks.delete(name);
    
    if (!this.anyTaskRunning()) {
      for (let listener of this.#allTasksFinishListeners) {
        try {
          await listener();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
  
  #getOneTimeUseStopAsyncTask(name) {
    let alreadyStopped = false;
    
    return async () => {
      if (alreadyStopped) {
        throw new Error('Cannot stop async task as it is already stopped.');
      }
      
      await this.#stopAsyncTask(name);
      
      alreadyStopped = true;
    };
  }
  
  wrapAsyncFunction(options, func) {
    if (!('name' in options)) throw new Error('property name not found');
    if (!('critical' in options)) throw new Error('property critical not found');
    if (!('alreadyRunningBehavior' in options)) throw new Error('property alreadyRunningBehavior not found');
    if (!('exclusive' in options)) throw new Error('property exclusive not found');
    let enterHandlers = options.enterHandlers ?? [];
    let exitHandlers = options.exitHandlers ?? [];
    
    return async (...args) => {
      let asyncTaskHandle;
      
      switch (options.alreadyRunningBehavior) {
        case 'stop':
          if (options.exclusive) {
            if (this.anyTaskRunning()) {
              return;
            }
          } else {
            if (this.taskCurrentlyRunning(options.name)) {
              return;
            }
          }
          
          asyncTaskHandle = await this.startAsyncTask(options.name, options.exclusive, enterHandlers, exitHandlers);
          break;
        
        case 'wait':
          asyncTaskHandle = await this.startAsyncTask(options.name, options.exclusive, enterHandlers, exitHandlers);
          break;
      }
      
      try {
        let criticalHandle;
        
        if (options.critical) {
          criticalHandle = criticalCodeManager.startCriticalCode();
        }
        
        try {
          await func(...args);
        } catch (err2) {
          throw err2;
        } finally {
          if (options.critical) {
            criticalHandle.stop();
          }
        }
      } catch (err) {
        throw err;
      } finally {
        await asyncTaskHandle.finish();
      }
    };
  }
}
