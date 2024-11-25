import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { jwtDecode } from 'jwt-decode';

// Define interfaces for type safety
interface FormData {
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  phone: string;
  branch: string;
  department: string;
}

interface JwtPayload {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

interface CustomJwtPayload extends JwtPayload {
  userId: string;
  pictureUrl: string;
}

const RegisterCard: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    nickName: '',
    email: '',
    phone: '',
    branch: '',
    department: '',
  });

  
   

  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);

  useEffect(() => {
    if (formData.branch === 'สำนักงานใหญ่') {
      setDepartmentOptions(['ยาม1', 'แม่บ้าน1', 'ฝ่ายขาย1']);
    } else if (formData.branch === 'ตลาดไทย') {
      setDepartmentOptions(['ยาม2', 'แม่บ้าน2', 'ฝ่ายขาย2']);
    } else if (formData.branch === 'วงเวียน') {
      setDepartmentOptions(['ยาม3', 'แม่บ้าน3', 'ฝ่ายขาย3']);
    }
  }, [formData.branch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const getCookie = (name: string): string | null => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  const decodeAuthToken = (): { userId: string; pictureUrl: string } | null => {
    const token = getCookie('auth_token');
    if (!token) return null;

    try {
      const decoded = jwtDecode<CustomJwtPayload>(token);
      return {
        userId: decoded.userId,
        pictureUrl: decoded.pictureUrl
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handleRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const tokenData = decodeAuthToken();
    if (!tokenData) {
      alert('ไม่พบข้อมูลการยืนยันตัวตน');
      return;
    }

    const { userId: line_usrid, pictureUrl: line_usrphoto } = tokenData;

    

    const dataToSend = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      nickname: formData.nickName,
      branch: formData.branch,
      department: formData.department,
      tel: formData.phone,
      email: formData.email,
      line_usrid,
      line_usrphoto,
    };
    
    console.log('Form data:', dataToSend);

    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_KEY}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'การลงทะเบียนล้มเหลว');
      }
      
      window.location.href = `${import.meta.env.PUBLIC_FRONTEND_UrL}/no-access`;
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        alert(`เกิดข้อผิดพลาดในการลงทะเบียน: ${error.message}`);
      } else {
        alert('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
      }
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center min-vh-100">
            <div className="w-100 d-block bg-white shadow-lg rounded my-5">
              <div className="row justify-content-center">
                <div className="col-lg-7">
                  <div className="p-5">
                    <div className="text-center mb-5">
                      <a href="index.html" className="text-dark font-size-22 font-family-secondary">
                        <i className="mdi mdi-album"></i>
                        <b>Notice Me Senpai</b>
                      </a>
                    </div>
                    <h1 className="h5 mb-1">คุณยังไม่มีสิทธิ์เข้าใช้งานระบบ</h1>
                    <p className="text-muted mb-4">กรุณากรอกข้อมูลเพื่อขอสิทธิ์เข้าสู่ระบบ แล้วรอการอนุมัติ</p>
                    <form id="registrationForm" className="user" onSubmit={handleRegistration}>
                      <div className="form-group row">
                        <div className="col-sm-4 mb-3 mb-sm-0">
                          <input type="text" className="form-control form-control-user" id="firstName" placeholder="ชื่อ" value={formData.firstName} onChange={handleChange} />
                        </div>
                        <div className="col-sm-4 mb-3 mb-sm-0">
                          <input type="text" className="form-control form-control-user" id="lastName" placeholder="นามสกุล" value={formData.lastName} onChange={handleChange} />
                        </div>
                        <div className="col-sm-4">
                          <input type="text" className="form-control form-control-user" id="nickName" placeholder="ชื่อเล่น" value={formData.nickName} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-sm-6 mb-3 mb-sm-0">
                          <input type="email" className="form-control form-control-user" id="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="col-sm-6">
                          <input type="text" className="form-control form-control-user" id="phone" placeholder="หมายเลขโทรศัพท์" value={formData.phone} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-sm-6 mb-3 mb-sm-0">
                          <select id="branch" className="form-control" value={formData.branch} onChange={handleChange}>
                            <option value="">เลือกสาขา</option>
                            <option value="สำนักงานใหญ่">สำนักงานใหญ่</option>
                            <option value="ตลาดไทย">ตลาดไทย</option>
                            <option value="วงเวียน">วงเวียน</option>
                          </select>
                        </div>
                        <div className="col-sm-6">
                          <select id="department" className="form-control" value={formData.department} onChange={handleChange}>
                            <option value="">เลือกแผนก</option>
                            {departmentOptions.map((dept, index) => (
                              <option key={index} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button type="submit" id="confirmAccessButton" className="btn btn-success btn-block waves-effect waves-light">
                        ยืนยันข้อมูลการขอสิทธิ์เข้าถึงระบบ
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCard;