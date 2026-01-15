import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/Cards/TaskCard";
import toast from "react-hot-toast";

const MyTasks = () => {

    const [allTasks, setAllTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [tabs, setTabs] = useState([]);
    const [filterStatus, setFilterStatus] = useState("All");

    const navigate = useNavigate();

    const getAllTasks = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
                params: {
                status: filterStatus === "All" ? "" : filterStatus,
                },
            });

            setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);

            //Map statusSummery data with fixed labels and order
            const statusSummery = response.data?.statusSummery || {};

            const statusArray = [
                { label: "All", count: statusSummery.all || 0 },
                { label: "Pending", count: statusSummery.pendingTasks || 0 },
                { label: "In Progress", count: statusSummery.inProgressTasks || 0 },
                { label: "Completed", count: statusSummery.completedTasks || 0 },
            ];

            setTabs(statusArray);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = (taskId) => {
        navigate(`/user/task-details/${taskId}`);
    };

    useEffect(() => {
        getAllTasks();
        return () => {};
    }, [filterStatus]);

    return (
        <DashboardLayout activeMenu="My Tasks">
            <div className="my-5">
                <div className="flex flex-col lg:flex-row lg:item-center justify-between">
                        <h2 className="text-xl md:text-xl font-medium">My Tasks</h2>

                    {tabs?.[0]?.count > 0 && (
                            <TaskStatusTabs
                            tabs={tabs}
                            activeTab={filterStatus}
                            setActiveTab={setFilterStatus}
                            />
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-[40vh]">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : allTasks?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {allTasks?.map((item) => (
                            <TaskCard
                            key={item._id}
                            title={item.title}
                            description={item.description}
                            priority={item.priority}
                            status={item.status}
                            progress={item.progress}
                            createdAt={item.createdAt}
                            dueDate={item.dueDate}
                            assignedTo={item.assignedTo?.map((item) => item.profileImageUrl)}
                            attachmentCount={item.attachments?.length || 0}
                            completedTodoCount={item.completedTodoCount || 0}
                            todoChecklist={item.todoChecklist || []}
                            onClick={() => {
                                handleClick(item._id);
                            }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[40vh] text-gray-500">
                        No tasks found.
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default MyTasks