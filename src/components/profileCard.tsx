import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from "sweetalert2";

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  nickname: string;
  status: string;
  verify: string;
  tel: string;
  email: string;
  datetime: string;
  groups: string[];
  leaderGroups: string[];
  line_usrphoto: string;
}

interface ProfileCardProps {
  userData: UserData;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userData }: ProfileCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(userData);
  const apiUrl = import.meta.env.PUBLIC_API_KEY;
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // แปลง id เป็น base64
      const userId = btoa(userData.id?.toString() || '');
      
      // เตรียมข้อมูลที่จะส่งไป API
      const dataToUpdate = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        nickname: formData.nickname,
        tel: formData.tel,
        email: formData.email
      };

      // ดึงโทเคนจากคุกกี้
      const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("auth_token="))
          ?.split("=")[1];
  
      // เรียก API เพื่ออัพเดทข้อมูล
      const response = await axios.put(`${apiUrl}/edit-user/${userId}`, dataToUpdate, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const updatedUser = response.data;
      
      // อัพเดท state ด้วยข้อมูลใหม่
      setFormData(updatedUser);
      
      // ปิด modal
      setIsModalOpen(false);
      
      // แสดงข้อความแจ้งเตือนสำเร็จ 
      Swal.fire({
        position: "center",
        icon: "success",
        title: "แก้ไขข้อมูลสำเร็จ",
        showConfirmButton: false,
        timer: 800,        
      }).then(() => {
        // รีโหลดหน้าเพื่อแสดงข้อมูลใหม่
        window.location.reload();
      });
      
    } catch (error) {
      // จัดการกรณีเกิดข้อผิดพลาด
      console.error('เกิดข้อผิดพลาด:', error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "ไม่สามารถอัพเดทข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        showConfirmButton: false,
        timer: 800,
      });
    }
  };

  const handleClose = () => {
    window.location.href = '/';
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && event.target === modalRef.current) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="profile-card">
      <div className="div-back-btn">
        <span className="back-btn" onClick={handleClose}>&times;</span>
      </div>

      <div className="profile-image">
        <img
          src={userData.line_usrphoto}
          alt="Profile Picture"
          className="profile-picture rounded-circle"
        />
      </div>

      <div className="profile-info">
        <div className="profile-name">
          {userData.first_name} {userData.last_name}
        </div>
        <div className="profile-nickname">{`(${userData.nickname})`}</div>

        <div className="profile-badges">
          <span className="badge badge-role">{userData.status}</span>
          <span className="badge badge-status">{userData.verify}</span>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <i className="mdi mdi-tablet-android" />
            <span>{userData.tel}</span>
          </div>
          <div className="detail-item">
            <i className="mdi mdi-email" />
            <span>{userData.email}</span>
          </div>
          <div className="detail-item">
            <i className="mdi mdi-calendar-month" />
            <span>{formatDate(userData.datetime)}</span>
          </div>
          <div className="btn outline-secondary waves-effect waves-light ">
            <div className="display-title-group">
              <i className="mdi mdi-account-group gap" />
              <span>กลุ่มที่สังกัด:</span>
            </div>

            <ul className="group-list user-group-list">
              {userData.groups.length > 0 ? (
                userData.groups.map((group) => <li key={group}>{group}</li>)
              ) : (
                <li>ไม่มีกลุ่ม</li>
              )}
            </ul>
          </div>
          <div className="btn outline-secondary waves-effect waves-light">
            <div className="display-title-group">
              <i className="mdi mdi-account-star gap" />
              <span>กลุ่มที่เป็นLeader:</span>
            </div>

            <ul className="group-list user-group-list">
              {userData.leaderGroups && userData.leaderGroups.length > 0 ? (
                userData.leaderGroups.map((group) => <li key={group}>{group}</li>)
              ) : (
                <li>ไม่มีกลุ่มที่เป็นLeader</li>
              )}
            </ul>
          </div>
          <div className="button-container">
            <button className="btn btn-primary btn-sm" id="edit-button" onClick={handleEditClick}>
              แก้ไขข้อมูล
            </button>            
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div id="user-edit-modal" className="user-modal" ref={modalRef}>
          <div className="profile-card modal-content">
            <div className="div-back-btn">
              <span className="back-btn" onClick={handleModalClose}>&times;</span>
            </div>
            <div className="profile-image">
              <img
                src={userData.line_usrphoto}
                alt="Profile Picture"
                className="profile-picture rounded-circle"
              />
            </div>

            <div className="profile-info">
              <form onSubmit={handleSubmit}>
                <div className="edit-profile-name form-group ">
                  <input
                    className="form-control "
                    type="text"
                    id="fname"
                    name="first_name"
                    value={formData.first_name}
                    placeholder="ชื่อ"
                    onChange={handleInputChange}
                  />
                  <input
                    className="form-control "
                    type="text"
                    id="lname"
                    name="last_name"
                    placeholder="นามสกุล"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className=" form-group  ">
                  <input
                    className="form-control"
                    type="text"
                    id="nickname"
                    name="nickname"
                    placeholder="ชื่อเล่น"
                    value={formData.nickname}
                    onChange={handleInputChange}
                  />
                </div>              

                <div className="form-group">
                  <input
                    className="form-control "
                    type="text"
                    id="tel"
                    name="tel"
                    placeholder="หมายเลขโทรศัพท์"
                    value={formData.tel}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    id="email"
                    name="email"
                    placeholder="ที่อยู่ Email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <button className="btn btn-primary btn-sm" type="submit">
                  ยืนยันการแก้ไขข้อมูล
                </button>                 
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;