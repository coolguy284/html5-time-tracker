// class for managing and waiting on asynchronous events
class AsyncManager {
  #currentTasks = new Map();
  
  taskCurrentlyRunning(name) {
    return this.#currentTasks.has(name);
  }
  
  async awaitTaskFinish(name) {
    if (!this.taskCurrentlyRunning(name)) return;
    
    await new Promise(resolve => {
      this.#currentTasks.get(name).finishListeners.add(resolve);
    });
  }
  
  async startAsyncTask(name) {
    if (this.taskCurrentlyRunning(name)) {
      await this.awaitTaskFinish(name);
    }
    
    if (this.#currentTasks.has(name)) {
      throw new Error('awaitTaskFinish failed');
    }
    
    let asyncTask = {
      finishListeners: new Set(),
    };
    
    this.#currentTasks.set(name, asyncTask);
    
    return {
      finish: this.#getOneTimeUseStopAsyncTask(name),
    };
  }
  
  #stopAsyncTask(name) {
    if (!this.#currentTasks.has(name)) {
      throw new Error(`Async Task ${name} does not exist`);
    }
    
    let finishedAsyncTask = this.#currentTasks.get(name);
    
    for (let listener of finishedAsyncTask.finishListeners) {
      try {
        listener();
      } catch (err) {
        console.error(err);
      }
    }
    
    this.#currentTasks.delete(name);
  }
  
  #getOneTimeUseStopAsyncTask(name) {
    let alreadyStopped = false;
    
    return () => {
      if (alreadyStopped) {
        throw new Error('Cannot stop async task as it is already stopped.');
      }
      
      this.#stopAsyncTask(name);
      
      alreadyStopped = true;
    };
  }
  
  wrapAsyncFunction(options, func) {
    if (!('name' in options)) throw new Error('property name not found');
    if (!('critical' in options)) throw new Error('property critical not found');
    if (!('alreadyRunningBehavior' in options)) throw new Error('property alreadyRunningBehavior not found');
    
    return async (...args) => {
      let asyncTaskHandle;
      
      switch (options.alreadyRunningBehavior) {
        case 'stop':
          if (this.taskCurrentlyRunning(options.name)) {
            return;
          }
          
          asyncTaskHandle = await this.startAsyncTask(options.name);
          break;
        
        case 'wait':
          asyncTaskHandle = await this.startAsyncTask(options.name);
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
        asyncTaskHandle.finish();
      }
    };
  }
}
