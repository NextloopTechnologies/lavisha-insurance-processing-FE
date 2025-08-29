import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { getNotificationsByParams } from "@/services/notification";

type Notification = {
  name: string;
  message: string;
  time: string;
  avatar?: string;
  icon?: string;
  status?: string;
};

type NotificationPopoverProps = {
  unreadNotifications: Notification[];
  recentNotifications: Notification[];
  unreadCount?: number;
};

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  unreadNotifications,
  recentNotifications,
  unreadCount = 0,
}) => {
  const [openNotification, setOpenNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationData, setNotificationData] = useState([]);
  const [unReadCount, setUnReadCount] = useState<number>();

  const getNotifications = async () => {
    setLoading(true);
    try {
      // const res = await getNotificationsByParams({ isRead: true });
      const res = await getNotificationsByParams({});
      if(res && res.status!==200) return console.error("error notification read")
      setUnReadCount(res.data.total)
      setNotificationData(res.data.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch patients:", err);
    }
  };
  useEffect(() => {
    getNotifications();
  }, []);
  return (
    <Popover open={openNotification} onOpenChange={setOpenNotification}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} className="text-[#3E79D6] text-center" />
          {notificationData?.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {notificationData?.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-80 p-0 rounded-none ">
        <h3 className="text-sm font-semibold text-gray-700 my-4 px-4">
          {notificationData?.length ? "Notifications" : "No Notifications"}
        </h3>
        <div className="border-b" />
        {notificationData.length > 0 && (
          <div className="border-b my-4">
            <p className="text-xs text-gray-700 my-4 pl-4">Unread {unReadCount}</p>
            {notificationData.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 items-start bg-[#0061FE14]  px-4"
              >
                <div className="w-8 h-8 block rounded-full  overflow-hidden mt-1">
                  {item.avatar ? (
                    <img
                      src={item?.avatar}
                      alt={item?.avatar}
                      className="overflow-hidden"
                    />
                  ) : (
                    // <span>{item.name[0]}</span>
                    <span>{item.message.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-normal text-gray-700">
                    {item.message}
                  </p>
                  {/* <span className="text-xs text-gray-500">{item.time}</span> */}
                  <span className="text-xs text-gray-500">{item.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {notificationData.length > 0 && (
          <div>
            <p className="text-xs text-gray-700 my-4 pl-4">Recent</p>
            {notificationData.map((item, index) => (
              <div key={index} className="flex gap-2 items-start px-4">
                {/* <div className="w-8 h-8 text-center block rounded-full bg-black text-white overflow-hidden">
                  <span className="text-[20px] font-semibold text-center">
                    {item.name[0]}
                  </span>
                </div> */}
                <div className="flex-1 pb-4">
                  <p className="text-sm text-gray-700">{item.message}</p>
                  <div className="mt-1 flex items-center gap-2 border w-fit p-2">
                    {item.icon && (
                      <Folder size={18} className=" text-blue-200" />
                    )}
                    {item.status && (
                      <span className=" text-black px-2 py-0.5 rounded-full text-[10px]">
                        {item.status}
                      </span>
                    )}
                  </div>
                  {/* <span className="text-xs text-gray-500">{item.time}</span> */}
                  <span className="text-xs text-gray-500">{item.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
