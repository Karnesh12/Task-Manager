import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet } from "react-icons/lu";
import UserCard from "../../components/Cards/UserCard";
import toast from "react-hot-toast";

const ManageUsers = () => {

    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    const getAllUsers = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
            if (response.data?.length > 0) {
                setAllUsers(response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    // download task report
    const handleDownloadReport = async () => {
        setIsDownloading(true);
        try {
            const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_USERS, {
                responseType: "blob",
            });

            //Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "user_details.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading User details", error);
            toast.error("Failed to download User details. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    useEffect(() => {
        getAllUsers();

        return () => {};
    }, []);

    return (
        <DashboardLayout activeMenu="Team Members">
            <div className="mt-5 mb-10">
                <div className="flex md:flex-row md:items-center justify-between">
                    <h2 className="text-xl md:text-xl font-medium">Team Members</h2>

                    <button className="flex md:flex download-btn" onClick={handleDownloadReport} disabled={isDownloading}>
                        <LuFileSpreadsheet className="text-lg" />
                        {isDownloading ? "Downloading..." : "Download Report"}
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-[40vh]">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : allUsers?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {allUsers?.map((user) => (
                            <UserCard key={user._id} userInfo={user} />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[40vh] text-gray-500">No users found.</div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default ManageUsers
