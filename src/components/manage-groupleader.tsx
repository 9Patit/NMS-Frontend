import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

axios.defaults.withCredentials = true;

interface ManageGroupLeaderProps {
  id: string;
}

const ManageGroup: React.FC<ManageGroupLeaderProps> = ({ id }) => {
  const apiUrl = import.meta.env.PUBLIC_API_KEY;
  const frontEnd = import.meta.env.PUBLIC_FRONTEND_UrL;

  const [userData, setUserData] = useState<{
    first_name: string;
    last_name: string;    
    leaderGroups: string[];
    nonLeaderGroups: string[];    
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
  
  const handleUnleader = async (group: string) => {
    const confirmation = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกสิทธิ์ผู้จัดการทีมขาย?',
      text: `กลุ่ม: ${group}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ยกเลิกเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];     
      await axios.post(
        `${apiUrl}/tables/${id}/unleader`,
        { group },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData((prevState) => {
        if (!prevState) return prevState;
        return {
          ...prevState,
          leaderGroups: prevState.leaderGroups.filter((g) => g !== group),
          nonLeaderGroups: [...prevState.nonLeaderGroups, group],
        };
      });
      Swal.fire({
        position: "center",
        icon: "success",
        title: "ยกเลิกสิทธิ์ผู้จัดการทีมขายสำเร็จ",
        showConfirmButton: false,
        timer: 800,
      });
    } catch (error) {
      console.error("ยกเลิกสิทธิ์ผู้จัดการทีมขายไม่สำเร็จ:", error);
      Swal.fire('เกิดข้อผิดพลาด', 'An error occurred while removing leader rights', 'error');
    }
  };

  const handleGetLeader = async (group: string) => {
    const confirmation = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่ว่าต้องการให้สิทธิ์ผู้จัดการทีมขาย?',
      text: `กลุ่ม: ${group}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ให้สิทธิ์เลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];
      
      await axios.post(
        `${apiUrl}/tables/${id}/get-leader`,
        { group },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserData((prevState) => {
        if (!prevState) return prevState;
        return {
          ...prevState,
          leaderGroups: [...prevState.leaderGroups, group],
          nonLeaderGroups: prevState.nonLeaderGroups.filter((g) => g !== group),
        };
      });
      Swal.fire({
        position: "center",
        icon: "success",
        title: "ให้สิทธิ์ผู้จัดการทีมขายสำเร็จ",
        showConfirmButton: false,
        timer: 800,
      });
    } catch (error) {
      console.error("ให้สิทธิ์ผู้จัดการทีมขายไม่สำเร็จ:", error);
      Swal.fire('เกิดข้อผิดพลาด', 'An error occurred while granting leader rights', 'error');
    }
  };

  const handleGoBack = () => {
    const baseUrl = `${frontEnd}/tables/${id}`;
    window.location.href = `${baseUrl}`;
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
            <h4>เป็นผู้จัดการทีมขาย</h4>
            <ul className="group-list">
              {userData.leaderGroups.length > 0 ? (
                userData.leaderGroups.map((group, index) => (
                  <li key={index} className="display-group-item btn outline-secondary ">
                    <div>
                    <span className="group-name">{group}</span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm group-btn"
                      onClick={() => handleUnleader(group)}
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
            <h4>ไม่ได้เป็นผู้จัดการทีมขาย</h4>
            <ul className="group-list">
              {userData.nonLeaderGroups.length > 0 ? (
                userData.nonLeaderGroups.map((group, index) => (
                  <li key={index} className="display-group-item btn outline-secondary">
                    <div>
                    <span className="group-name">{group}</span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm group-btn"
                      onClick={() => handleGetLeader(group)}
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