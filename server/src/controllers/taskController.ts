// src/controllers/taskController.ts
import { Request, Response } from 'express';
import { Task } from '../models/Task';

export const taskController = {
  async getTasks(req: Request, res: Response) {
    try {
      const tasks = await Task.find()
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .populate('customer', 'company contactPerson'); // customer populate eklendi
      
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Görevler alınırken bir hata oluştu' });
    }
  },

  async getTasksByUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const tasks = await Task.find({ assignedTo: userId })
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName')
        .populate('customer', 'company contactPerson'); // customer populate eklendi

      res.json(tasks);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      res.status(500).json({ message: 'Kullanıcı görevleri alınırken bir hata oluştu' });
    }
  },

  async createTask(req: Request, res: Response) {
    try {
      console.log('Received task data:', req.body);
  
      const newTask = new Task({
        ...req.body,
        status: 'TODO',
        createdBy: req.user?.id
      });
  
      await newTask.save();
      
      const populatedTask = await newTask.populate([
        { path: 'assignedTo', select: 'firstName lastName email' },
        { path: 'createdBy', select: 'firstName lastName' },
        { path: 'customer', select: 'company contactPerson' }
      ]);
  
      console.log('Created task:', populatedTask);
  
      res.status(201).json(populatedTask);
    } catch (error) {
      console.error('Task creation error:', error);
      res.status(500).json({ message: 'Görev oluşturulurken bir hata oluştu' });
    }
  },

  async updateTask(req: Request, res: Response) {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate([
        { path: 'assignedTo', select: 'firstName lastName email' },
        { path: 'createdBy', select: 'firstName lastName' },
        { path: 'customer', select: 'company contactPerson' } // customer populate eklendi
      ]);

      if (!task) {
        return res.status(404).json({ message: 'Görev bulunamadı' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ message: 'Görev güncellenirken bir hata oluştu' });
    }
  },

  async updateTaskStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate([
        { path: 'assignedTo', select: 'firstName lastName email' },
        { path: 'createdBy', select: 'firstName lastName' },
        { path: 'customer', select: 'company contactPerson' } // customer populate eklendi
      ]);

      if (!task) {
        return res.status(404).json({ message: 'Görev bulunamadı' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error updating task status:', error);
      res.status(500).json({ message: 'Görev durumu güncellenirken bir hata oluştu' });
    }
  },

  async deleteTask(req: Request, res: Response) {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);

      if (!task) {
        return res.status(404).json({ message: 'Görev bulunamadı' });
      }

      res.json({ message: 'Görev başarıyla silindi' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: 'Görev silinirken bir hata oluştu' });
    }
  }
};
