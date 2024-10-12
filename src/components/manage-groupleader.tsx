import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ManageGroupProps {
  id: string;
}

const ManageGroup: React.FC<ManageGroupProps> = ({ id }) => {
  const [userData, setUserData] = useState<{ first_name: string, last_name: string, groups: string[], leaderGroups: string[], nonLeaderGroups: string[], nonUserGroups: string[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = import.meta.env.PUBLIC_API_KEY;
  const frontEnd = import.meta.env.PUBLIC_FRONTEND_UrL;

  useEffect(() => {
    const fetchData = async () => {
      try {       
        const response = await axios.get(`${apiUrl}/tables/${id}`);        
        setUserData(response.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);
  
  useEffect(() => {
    console.log('userData:', userData);
  }, [userData]);

  const handleUnleader = async (group: string) => {
    try {
      console.log(`Unleader group: ${group} for user: ${id}`);
      await axios.post(`${apiUrl}/tables/${id}/unleader`, { group });
      // Update state
      setUserData(prevState => {
        if (!prevState) return prevState;
        return {
          ...prevState,
          leaderGroups: prevState.leaderGroups.filter(g => g !== group),
          nonLeaderGroups: [...prevState.nonLeaderGroups, group]
        };
      });
    } catch (error) {
      console.error("Failed to unleader:", error);
    }
  };

  const handleGetLeader = async (group: string) => {
    try {
      console.log(`Get leader group: ${group} for user: ${id}`);
      await axios.post(`${apiUrl}/tables/${id}/get-leader`, { group });
      // Update state
      setUserData(prevState => {
        if (!prevState) return prevState;
        return {
          ...prevState,
          leaderGroups: [...prevState.leaderGroups, group],
          nonLeaderGroups: prevState.nonLeaderGroups.filter(g => g !== group)
        };
      });
    } catch (error) {
      console.error("Failed to join group:", error);
    }
  };

  const handleGoBack = () => {
    const baseUrl = `${frontEnd}/tables/`;
    window.location.href = `${baseUrl}`;
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
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
      {userData && <h2>จัดการกลุ่มของ: {userData.first_name} {userData.last_name}</h2>}
      {userData && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h3>กลุ่มที่เป็นleader</h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {userData.leaderGroups.length > 0 ? (
                userData.leaderGroups.map((group, index) => (
                  <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #ddd', marginBottom: '10px', borderRadius: '5px' }}>
                    <span>{group}</span>
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: '10px' }} onClick={() => handleUnleader(group)}>ออกจากกลุ่ม</button>
                  </li>
                ))
              ) : (
                <li>ไม่มีกลุ่มที่เป็นleader</li>
              )}
            </ul>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <h3>เลือกกลุ่มที่จะเข้าเป็นleader</h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {userData.nonLeaderGroups.length > 0 ? (
                userData.nonLeaderGroups.map((group, index) => (
                  <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #ddd', marginBottom: '10px', borderRadius: '5px' }}>
                    <span>{group}</span>
                    <button className="btn btn-primary btn-sm"  style={{ marginLeft: '10px' }} onClick={() => handleGetLeader(group)}>เข้าเป็นleader</button>
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