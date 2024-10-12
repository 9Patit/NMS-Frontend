import React, { useEffect, useState } from "react";
import axios from "axios";

interface ManageGroupProps {
  id: string;
}

const ManageGroup: React.FC<ManageGroupProps> = ({ id }) => {
    const apiUrl = import.meta.env.PUBLIC_API_KEY;
    const baseUrl = import.meta.env.PUBLIC_FRONTEND_UrL;

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
        const response = await axios.get(`${apiUrl}/tables/${id}`);
        setUserData(response.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    
  }, [userData]);

  const handleLeaveGroup = async (group: string) => {
    try {
      // Call API to leave group
      await axios.post(`${apiUrl}/tables/${id}/leave`, { group });
      // Update state
      setUserData((prevState) => {
        if (!prevState) return prevState;
        return {
          ...prevState,
          groups: prevState.groups.filter((g) => g !== group),
          nonUserGroups: [...prevState.nonUserGroups, group],
        };
      });
    } catch (error) {
      console.error("Failed to leave group:", error);
    }
  };

  const handleJoinGroup = async (group: string) => {
    try {
      // Call API to join group
      await axios.post(`${apiUrl}/tables/${id}/join`, { group });
      // Update state
      setUserData((prevState) => {
        if (!prevState) return prevState;
        return {
          ...prevState,
          groups: [...prevState.groups, group],
          nonUserGroups: prevState.nonUserGroups.filter((g) => g !== group),
        };
      });
    } catch (error) {
      console.error("Failed to join group:", error);
    }
  };

  const handleGoBack = () => {
      
    window.location.href = `${baseUrl}/tables/`;
};

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <button
        onClick={handleGoBack}
        style={{
          position: "absolute",
          right: "25px",
          top: "10px",
          color: "#aaa",
          fontSize: "28px",
          fontWeight: "bold",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = "black")}
        onMouseOut={(e) => (e.currentTarget.style.color = "#aaa")}
      >
        x
      </button>{" "}
      {userData && (
        <h2>
          จัดการกลุ่มของ: {userData.first_name} {userData.last_name}
        </h2>
      )}
      {userData && (
        <>
          <div style={{ marginBottom: "20px" }}>
            <h3>กลุ่มที่สังกัด</h3>
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {userData.groups.length > 0 ? (
                userData.groups.map((group, index) => (
                  <li
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px",
                      border: "1px solid #ddd",
                      marginBottom: "10px",
                      borderRadius: "5px",
                    }}
                  >
                    <span>{group}</span>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginLeft: "10px" }}
                      onClick={() => handleLeaveGroup(group)}
                    >
                      ออกจากกลุ่ม
                    </button>
                  </li>
                ))
              ) : (
                <li>ไม่มีกลุ่ม</li>
              )}
            </ul>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <h3>กลุ่มที่ไม่ได้สังกัด</h3>
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {userData.nonUserGroups.length > 0 ? (
                userData.nonUserGroups.map((group, index) => (
                  <li
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px",
                      border: "1px solid #ddd",
                      marginBottom: "10px",
                      borderRadius: "5px",
                    }}
                  >
                    <span>{group}</span>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginLeft: "10px" }}
                      onClick={() => handleJoinGroup(group)}
                    >
                      เข้าร่วมกลุ่ม
                    </button>
                  </li>
                ))
              ) : (
                <li>ไม่มีกลุ่ม</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageGroup;
