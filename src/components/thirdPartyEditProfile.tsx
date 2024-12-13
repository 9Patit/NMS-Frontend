import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface UserData {
  id: 0;
  first_name: "";
  last_name: "";
  nickname: "";
  status: "";
  verify: "";
  tel: "";
  email: "";
  datetime: "";
  groups: [];
  leaderGroups: [];
  line_usrphoto: "abc";
  auth_token?: string;
}

const ThirdPartyEditProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<UserData | null>(null);
  const [userDetails, setUserDetails] = useState<UserData | null>(null);
  const apiUrl = import.meta.env.PUBLIC_API_KEY;
  const modalRef = useRef<HTMLDivElement>(null);
  const ApiKey = process.env.VITE_PUBLIC_API_KEY || "default_API_KEY";
  const PPUrL = process.env.VITE_PUBLIC_PP_URL || "default_PP_URL";

  const transformVerify = (verify: string) => {
    switch (verify) {
      case "0":
        return "รออนุมัติ";
      case "1":
        return "ใช้งาน";
      case "10":
        return "ออก";
      default:
        return verify;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];

      let id;
      if (token) {
        const decodedToken: any = jwtDecode(token);

        // ดึง id จาก decoded token
        id = decodedToken.id;
      }

      if (!id) return;

      try {
        const response = await axios.post(`${ApiKey}/pp-get-data-fromlink`, {
          id: id,
        });

        const data = response.data;
        data.verify = transformVerify(data.verify);
        setFormData(data);
        setUserDetails(data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;

    try {
      // แปลง id เป็น base64
      const userId = btoa(formData.id || "");

      // เตรียมข้อมูลที่จะส่งไป API
      const dataToUpdate = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        nickname: formData.nickname,
        tel: formData.tel,
        email: formData.email,
      };

      // ดึงโทเคนจากคุกกี้
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];

      // เรียก API เพื่ออัพเดทข้อมูล
      const response = await axios.put(
        `${apiUrl}/pp-edit-user/${userId}`,
        dataToUpdate,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      console.error("เกิดข้อผิดพลาด:", error);
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
    window.location.href = PPUrL;
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

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pp-edit-profile-card">
      <div className="div-back-btn">
        <span className="back-btn" onClick={handleClose}>
          &times;
        </span>
      </div>

      <div className="profile-image">
        <img
          src={userDetails.line_usrphoto}
          alt="Profile Picture"
          className="profile-picture rounded-circle"
        />
      </div>

      <div className="profile-info">
        <div className="profile-name">
          {userDetails.first_name} {userDetails.last_name}
          <div className="profile-nickname">{`(${userDetails.nickname})`}</div>
        </div>

        <div className="profile-badges">
          <span className="badge badge-role">{userDetails.status}</span>
          <span className="badge badge-status">{userDetails.verify}</span>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <i className="mdi mdi-tablet-android" />
            <span>{userDetails.tel}</span>
          </div>
          <div className="detail-item">
            <i className="mdi mdi-email" />
            <span>{userDetails.email}</span>
          </div>
          <div className="detail-item">
            <i className="mdi mdi-calendar-month" />
            <span>{formatDate(userDetails.datetime)}</span>
          </div>

          <div className="button-container">
            <button
              className="btn btn-primary btn-sm"
              id="edit-button"
              onClick={handleEditClick}
            >
              แก้ไขข้อมูล
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div id="user-edit-modal" className="user-modal" ref={modalRef}>
          <div className="profile-card modal-content">
            <div className="div-back-btn">
              <span className="back-btn" onClick={handleModalClose}>
                &times;
              </span>
            </div>
            <div className="profile-image">
              <img
                src={formData.line_usrphoto}
                alt="Profile Picture"
                className="profile-picture rounded-circle"
              />
            </div>

            <div className="profile-info">
              <form onSubmit={handleSubmit}>
                <div className="edit-profile-name ">
                  <div className="form-group">
                    <label>ชื่อ</label>
                    <input
                      className="form-control "
                      type="text"
                      id="fname"
                      name="first_name"
                      value={formData.first_name}
                      placeholder="ชื่อ"
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>นามสกุล</label>
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

                  <div className="form-group">
                    <label>ชื่อเล่น</label>
                    <input
                      className="form-control "
                      type="text"
                      id="nickname"
                      name="nickname"
                      placeholder="ชื่อเล่น"
                      value={formData.nickname}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>หมายเลขโทรศัพท์</label>
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
                  <label>ที่อยู่อีเมลล์</label>
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
                <div className="btn-submit">
                  <button className="btn btn-primary btn-sm" type="submit">
                    ยืนยันการแก้ไขข้อมูล
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThirdPartyEditProfile;
