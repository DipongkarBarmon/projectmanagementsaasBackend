import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TaskService } from "./task.service";
import httpStatus from "http-status";
const createTask = catchAsync(async (req, res) => {
    const result = await TaskService.createTask(req.params.projectId, req.body, req.user, req.params.organizationId);
    sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Task created successfully", data: result });
});
const getAllTasks = catchAsync(async (req, res) => {
    const result = await TaskService.getAllTasks(req.params.projectId, req.user, req.params.organizationId);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Tasks retrieved successfully", data: result });
});
const getTaskById = catchAsync(async (req, res) => {
    const result = await TaskService.getTaskById(req.params.projectId, req.params.taskId, req.user, req.params.organizationId);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Task retrieved successfully", data: result });
});
const updateTask = catchAsync(async (req, res) => {
    const result = await TaskService.updateTask(req.params.projectId, req.params.taskId, req.body, req.user, req.params.organizationId);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Task updated successfully", data: result });
});
const deleteTask = catchAsync(async (req, res) => {
    const result = await TaskService.deleteTask(req.params.projectId, req.params.taskId, req.user, req.params.organizationId);
    sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Task deleted successfully", data: result });
});
export const TaskController = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
};
