import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import moment from 'moment';
import { LuHistory } from 'react-icons/lu';

const ActivityLog = ({ taskId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!taskId) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_ACTIVITY(taskId));
        setActivities(response.data);
      } catch (error) {
        console.error("Error fetching task activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [taskId]);

  return (
    <div className="mt-4">
      <label className="text-xs font-medium text-slate-500 flex items-center gap-2">
        <LuHistory />
        Activity Log
      </label>
      <div className="mt-2 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-400">Loading activity...</p>
        ) : activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity._id} className="flex items-start gap-3 text-sm">
              {activity.performedByProfileImageUrl ? (
                <img
                  src={activity.performedByProfileImageUrl}
                  alt={activity.performedByName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
                  {activity.performedByName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="text-gray-600"><span className="font-bold text-gray-800">{activity.performedByName}</span> {activity.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{moment(activity.createdAt).fromNow()}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 p-3 bg-gray-50 rounded-md text-center">No activity recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;