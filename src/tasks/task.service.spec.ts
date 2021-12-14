import { TasksService } from './tasks.service';
import { Test } from '@nestjs/testing';
import { TasksRepository } from './tasks.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';
import { NotFoundException } from '@nestjs/common';

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

const mockUser: User = {
  id: '12',
  username: 'Test user',
  password: 'Test password',
  tasks: [],
};

describe('TasksService', () => {
  let service: TasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    service = await module.get(TasksService);
    taskRepository = await module.get(TasksRepository);
  });

  describe('getTasks', () => {
    it('calls TasksRepository.getTasks() and returns its result', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search query',
      };

      const result = await service.getTasks(filters, mockUser);

      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls TasksRepository.findOne() and returns its result', async () => {
      const mockTask = {
        title: 'Test task',
        description: 'Test desc',
        status: TaskStatus.DONE,
        user: mockUser,
        id: '1',
      };
      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.getTaskById('12', mockUser);

      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: '12',
          user: mockUser,
        },
      });
    });
    it('throws an error as task is not found', async () => {
      taskRepository.findOne.mockResolvedValue(null);
      await expect(service.getTaskById('1', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
