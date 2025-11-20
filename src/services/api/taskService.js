import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

const TABLE_NAME = 'tasks_c';

export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "completed_at_c"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform database fields to UI format
      const tasks = (response.data || []).map(task => ({
        Id: task.Id,
        title: task.title_c || task.Name || '',
        description: task.description_c || '',
        priority: task.priority_c || 'medium',
        status: task.status_c || 'active',
        createdAt: task.CreatedOn || new Date().toISOString(),
        completedAt: task.completed_at_c || null,
        tags: task.Tags || ''
      }));

      return tasks;
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "completed_at_c"}}
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error(`Task with Id ${id} not found`);
      }

      // Transform database fields to UI format
      const task = {
        Id: response.data.Id,
        title: response.data.title_c || response.data.Name || '',
        description: response.data.description_c || '',
        priority: response.data.priority_c || 'medium',
        status: response.data.status_c || 'active',
        createdAt: response.data.CreatedOn || new Date().toISOString(),
        completedAt: response.data.completed_at_c || null,
        tags: response.data.Tags || ''
      };

      return task;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      // Transform UI format to database format - only Updateable fields
      const dbTask = {
        Name: taskData.title.trim(),
        Tags: taskData.tags || '',
        title_c: taskData.title.trim(),
        description_c: taskData.description?.trim() || '',
        priority_c: taskData.priority || 'medium',
        status_c: taskData.status || 'active',
        completed_at_c: taskData.completedAt || null
      };

      // Remove empty fields
      Object.keys(dbTask).forEach(key => {
        if (dbTask[key] === '' || dbTask[key] === null || dbTask[key] === undefined) {
          delete dbTask[key];
        }
      });

      const params = {
        records: [dbTask]
      };

      const response = await apperClient.createRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const createdTask = successful[0].data;
          // Transform back to UI format
          return {
            Id: createdTask.Id,
            title: createdTask.title_c || createdTask.Name || '',
            description: createdTask.description_c || '',
            priority: createdTask.priority_c || 'medium',
            status: createdTask.status_c || 'active',
            createdAt: createdTask.CreatedOn || new Date().toISOString(),
            completedAt: createdTask.completed_at_c || null,
            tags: createdTask.Tags || ''
          };
        }
      }

      throw new Error('No successful records created');
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      // Transform UI format to database format - only Updateable fields
      const dbUpdates = {
        Id: parseInt(id)
      };

      // Map UI fields to database fields
      if (updates.title !== undefined) {
        dbUpdates.Name = updates.title.trim();
        dbUpdates.title_c = updates.title.trim();
      }
      if (updates.description !== undefined) {
        dbUpdates.description_c = updates.description.trim();
      }
      if (updates.priority !== undefined) {
        dbUpdates.priority_c = updates.priority;
      }
      if (updates.status !== undefined) {
        dbUpdates.status_c = updates.status;
      }
      if (updates.completedAt !== undefined) {
        dbUpdates.completed_at_c = updates.completedAt;
      }
      if (updates.tags !== undefined) {
        dbUpdates.Tags = updates.tags;
      }

      // Remove empty fields except null (which clears fields)
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key] === '' || dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });

      const params = {
        records: [dbUpdates]
      };

      const response = await apperClient.updateRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedTask = successful[0].data;
          // Transform back to UI format
          return {
            Id: updatedTask.Id,
            title: updatedTask.title_c || updatedTask.Name || '',
            description: updatedTask.description_c || '',
            priority: updatedTask.priority_c || 'medium',
            status: updatedTask.status_c || 'active',
            createdAt: updatedTask.CreatedOn || new Date().toISOString(),
            completedAt: updatedTask.completed_at_c || null,
            tags: updatedTask.Tags || ''
          };
        }
      }

      throw new Error('No successful records updated');
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }

      return false;
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
      throw error;
    }
  }
};
import { toast } from 'react-toastify';

const TABLE_NAME = 'tasks_c';

export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "completed_at_c"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform database fields to UI format
      const tasks = (response.data || []).map(task => ({
        Id: task.Id,
        title: task.title_c || task.Name || '',
        description: task.description_c || '',
        priority: task.priority_c || 'medium',
        status: task.status_c || 'active',
        createdAt: task.CreatedOn || new Date().toISOString(),
        completedAt: task.completed_at_c || null,
        tags: task.Tags || ''
      }));

      return tasks;
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "completed_at_c"}}
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error(`Task with Id ${id} not found`);
      }

      // Transform database fields to UI format
      const task = {
        Id: response.data.Id,
        title: response.data.title_c || response.data.Name || '',
        description: response.data.description_c || '',
        priority: response.data.priority_c || 'medium',
        status: response.data.status_c || 'active',
        createdAt: response.data.CreatedOn || new Date().toISOString(),
        completedAt: response.data.completed_at_c || null,
        tags: response.data.Tags || ''
      };

      return task;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      // Transform UI format to database format - only Updateable fields
      const dbTask = {
        Name: taskData.title.trim(),
        Tags: taskData.tags || '',
        title_c: taskData.title.trim(),
        description_c: taskData.description?.trim() || '',
        priority_c: taskData.priority || 'medium',
        status_c: taskData.status || 'active',
        completed_at_c: taskData.completedAt || null
      };

      // Remove empty fields
      Object.keys(dbTask).forEach(key => {
        if (dbTask[key] === '' || dbTask[key] === null || dbTask[key] === undefined) {
          delete dbTask[key];
        }
      });

      const params = {
        records: [dbTask]
      };

      const response = await apperClient.createRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const createdTask = successful[0].data;
          // Transform back to UI format
          return {
            Id: createdTask.Id,
            title: createdTask.title_c || createdTask.Name || '',
            description: createdTask.description_c || '',
            priority: createdTask.priority_c || 'medium',
            status: createdTask.status_c || 'active',
            createdAt: createdTask.CreatedOn || new Date().toISOString(),
            completedAt: createdTask.completed_at_c || null,
            tags: createdTask.Tags || ''
          };
        }
      }

      throw new Error('No successful records created');
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      // Transform UI format to database format - only Updateable fields
      const dbUpdates = {
        Id: parseInt(id)
      };

      // Map UI fields to database fields
      if (updates.title !== undefined) {
        dbUpdates.Name = updates.title.trim();
        dbUpdates.title_c = updates.title.trim();
      }
      if (updates.description !== undefined) {
        dbUpdates.description_c = updates.description.trim();
      }
      if (updates.priority !== undefined) {
        dbUpdates.priority_c = updates.priority;
      }
      if (updates.status !== undefined) {
        dbUpdates.status_c = updates.status;
      }
      if (updates.completedAt !== undefined) {
        dbUpdates.completed_at_c = updates.completedAt;
      }
      if (updates.tags !== undefined) {
        dbUpdates.Tags = updates.tags;
      }

      // Remove empty fields except null (which clears fields)
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key] === '' || dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });

      const params = {
        records: [dbUpdates]
      };

      const response = await apperClient.updateRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedTask = successful[0].data;
          // Transform back to UI format
          return {
            Id: updatedTask.Id,
            title: updatedTask.title_c || updatedTask.Name || '',
            description: updatedTask.description_c || '',
            priority: updatedTask.priority_c || 'medium',
            status: updatedTask.status_c || 'active',
            createdAt: updatedTask.CreatedOn || new Date().toISOString(),
            completedAt: updatedTask.completed_at_c || null,
            tags: updatedTask.Tags || ''
          };
        }
      }

      throw new Error('No successful records updated');
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }

      return false;
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
      throw error;
    }
  }
};