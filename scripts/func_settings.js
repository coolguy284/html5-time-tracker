let settingsDeleteAllData = asyncManager.wrapAsyncFunctionWithButton(
  'settingsDeleteAllData',
  delete_all_data_btn,
  async () => {
    if (!confirm('Are you sure?')) return;
    
    await eventManager.resetData();
  }
);
