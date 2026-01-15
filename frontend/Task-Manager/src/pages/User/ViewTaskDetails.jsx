import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import moment from "moment";
import ActivityLog from "../../components/ActivityLog";
import AvatarGroup from "../../components/AvatarGroup";
import { LuSquareArrowOutUpRight } from "react-icons/lu";

const ViewTaskDetails = () => {

    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingTodo, setUpdatingTodo] = useState(null);

    const getStatusTagColor = (status) => {
        switch (status) {
            case "In Progress":
                return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";

            case "Completed":
                return "text-lime-500 bg-lime-50 border border-lime-500/20";

            default:
                return "text-violet-500 bg-violet-50 border border-violet-500/10";
        }
    };

    // get Task info by ID
    const getTaskDetailsByID = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(
                API_PATHS.TASKS.GET_TASK_BY_ID(id)
            );

            if (response.data) {
                const taskInfo = response.data;
                setTask(taskInfo);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    // handle todo check
    const updateTodoChecklist = async (index) => {
        setUpdatingTodo(index);

        const newChecklist = task.todoChecklist.map((item, i) =>
            i === index ? { ...item, completed: !item.completed } : item
        );

        try {
            const response = await axiosInstance.put(
                API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(id),
                { todoChecklist: newChecklist }
            );

            if (response.data?.task) {
                setTask(response.data.task);
            }
        } catch (error) {
            console.error("Error updating checklist:", error);
            toast.error("Failed to update task.");
            // No need to revert UI state as we didn't change it optimistically
        } finally {
            setUpdatingTodo(null);
        }
    };

    // handle attachment link Cick
    const handleLinkClick = (link) => {
        if (!/^https?:\/\//i.test(link)) {
            link = "https://" + link; // default to HTTPS
        }
        window.open(link, "_blank");
    };

    useEffect(() => {
        if (id) {
            getTaskDetailsByID();
        }
        return () => {};
    }, [id]);

    return (
        <DashboardLayout activeMenu='My Tasks'>
            {loading ? (
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : (
            <div className="mt-5">
                {task ? (
                <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
                    <div className="form-card col-span-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm md:text-xl font-medium">
                                {task?.title}
                            </h2>

                            <div
                            className={`text-[11px] md:text-[13px] font-medium ${getStatusTagColor(
                                task?.status
                            )} px-4 py-0.5 rounded `}
                            >
                                {task?.status}
                            </div>
                        </div>

                        <div className="mt-4">
                            <InfoBox label="Description" value={task?.description} />
                        </div>

                        <div className="grid grid-cols-12 gap-4 mt-4">
                            <div className="col-span-6 md:col-span-4">
                                <InfoBox label="Priority" value={task?.priority} />
                            </div>
                            <div className="col-span-6 md:col-span-4">
                                <InfoBox
                                label="Due Date"
                                value={
                                    task?.dueDate
                                    ? moment(task?.dueDate).format("Do MMM YYYY")
                                    : "N/A"
                                }
                                />
                            </div>
                            <div className="col-span-6 md:col-span-4">
                                <label className="text-xs font-medium text-slate-500">
                                    Assigned To
                                </label>

                                <AvatarGroup
                                avatars={
                                    task?.assignedTo?.map((item) => item?.profileImageUrl || [])
                                }
                                maxVisible={5}
                                />
                            </div>
                        </div>

                        <div className="mt-2">
                            <label className="text-xs font-medium text-slate-500">
                                Todo Checklist
                            </label>

                            {task?.todoChecklist?.map((item, index) => (
                                <TodoCheckList
                                key={`todo_${index}`}
                                text={item.text}
                                isChecked={item?.completed}
                                onChange={() => updateTodoChecklist(index)}
                                isLoading={updatingTodo === index}
                                />
                            ))}
                        </div>

                        {task?.attachments?.length > 0 && (
                            <div className="mt-2">
                                <label className="text-xs font-medium text-slate-500">
                                    Attachments
                                </label>

                                {task?.attachments?.map((link, index) => (
                                    <Attachment
                                    key={`link_${index}`}
                                    link={link}
                                    index={index}
                                    onClick={() => handleLinkClick(link)}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="border-t border-gray-200 mt-4 pt-4">
                            <ActivityLog taskId={id} />
                        </div>
                    </div>
                </div>
                ) : (
                    <div className="flex items-center justify-center h-[60vh] text-gray-500">Task details not found.</div>
                )}
            </div>
            )}
        </DashboardLayout>
    );
};

export default ViewTaskDetails;

const InfoBox = ({ label,value }) => {
    return <>
    <label className="text-xs font-medium text-slate-500">{label}</label>
    
    <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">
        {value}
    </p></>
};

const TodoCheckList = ({ text, isChecked, onChange, isLoading }) => {
    return <div className="flex items-center gap-3 p-3">
        {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        ) : (
            <input
                type="checkbox"
                checked={isChecked}
                onChange={onChange}
                disabled={isLoading}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer"
            />
        )}
        <p
            className={`text-[13px] ${isChecked ? "text-gray-400 line-through" : "text-gray-800"
                }`}
        >
            {text}
        </p>
    </div>
};

const Attachment = ({ link, index, onClick }) => {
    return <div
    className="flex justify-between bg-gray-50 border-gray-100 px-3 py-2 rounded-md mb-3 mt-2 cursor-pointer"
    onClick={onClick}
    >
        <div className="flex-1 flex items-center gap-3">
            <span className="text-xs text-gray-400 font-semibold mr-2">
                {index < 9 ? `0${index + 1}` : index + 1}
            </span>

            <p className="text-xs text-black">{link}</p>
        </div>

        <LuSquareArrowOutUpRight className="text-gray-400" />
    </div>
}