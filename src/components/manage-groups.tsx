import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

axios.defaults.withCredentials = true;

interface ManageGroupProps {
  id: string;
}

const ManageGroup: React.FC<ManageGroupProps> = ({ id }) => {
  const apiUrl = import.meta.env.PUBLIC_API_KEY;
  const frontEnd = import.meta.env.PUBLIC_FRONTEND_UrL;

  const [userData, setUserData] = useState<{
    first_name: string;
    last_name: string;
    groups: string[];
    nonUserGroups: string[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("auth_token="))
          ?.split("=")[1];

        const response = await axios.get(`${apiUrl}/tables/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (error) {
        console.error("ดึงข้อมูลล้มเหลว:", error);
        setError("ดึงข้อมูลล้มเหลว");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleLeaveGroup = async (group: string) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];
      await axios.post(
        `${apiUrl}/tables/${id}/leave`,
        { group },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData((prevState) => {
        if (!prevState) return prevState;
        return {
          ...prevState,
          groups: prevState.groups.filter((g) => g !== group),
          nonUserGroups: [...prevState.nonUserGroups, group],
        };
      });
      Swal.fire({
        position: "center",
        icon: "success",
        title: "ออกจากทีมขายสำเร็จ",
        showConfirmButton: false,
        timer: 800,
      });
    } catch (error) {
      console.error("ออกจากทีมขายไม่สำเร็จ:", error);
    }
  };

  const handleJoinGroup = async (group: string) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];

      await axios.post(
        `${apiUrl}/tables/${id}/join`,
        { group },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData((prevState) => {
        if (!prevState) return prevState;
        return {
          ...prevState,
          groups: [...prevState.groups, group],
          nonUserGroups: prevState.nonUserGroups.filter((g) => g !== group),
        };
      });
      Swal.fire({
        position: "center",
        icon: "success",
        title: "เข้าร่วมทีมขายสำเร็จ",
        showConfirmButton: false,
        timer: 800,
      });
    } catch (error) {
      console.error("เข้าร่วมทีมขายไม่สำเร็จ:", error);
    }
  };

  const handleGoBack = () => {
    window.location.href = `${frontEnd}/tables/${id}`;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="manage-groups">
      <div className="title-card">
        <div>
          <h4>{userData?.first_name}{" "}{userData?.last_name} </h4>
        </div>
        <div className="div-back-btn">        
          <button className="back-btn" onClick={handleGoBack}>&times;</button>
        </div>
      </div>


      {userData && (
        <div className="display-groups">
          <div className="btn outline-secondary ">
            <h4>กลุ่มที่สังกัด</h4>
            <ul className="group-list">
              {userData.groups.length > 0 ? (
                userData.groups.map((group, index) => (
                  <li key={index} className="display-group-item btn outline-secondary ">
                    <div>
                    <span className="group-name">{group}</span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm group-btn"
                      onClick={() => handleLeaveGroup(group)}
                    >
                      ออก
                    </button>
                  </li>
                ))
              ) : (
                <li>ไม่มีกลุ่ม</li>
              )}
            </ul>
          </div>

          <div className="btn outline-secondary">
            <h4>กลุ่มที่ไม่ได้สังกัด</h4>
            <ul className="group-list">
              {userData.nonUserGroups.length > 0 ? (
                userData.nonUserGroups.map((group, index) => (
                  <li key={index} className="display-group-item btn outline-secondary">
                    <div>
                    <span className="group-name">{group}</span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm group-btn"
                      onClick={() => handleJoinGroup(group)}
                    >
                      เข้า
                    </button>
                  </li>
                ))
              ) : (
                <li>ไม่มีกลุ่ม</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGroup;