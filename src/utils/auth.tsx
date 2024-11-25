import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import cookie from 'cookie';

// อินเตอร์เฟซสำหรับ payload ของ JWT ที่กำหนดเอง
interface CustomJwtPayload {
  userId: string;
  displayName: string;
  pictureUrl: string;
  role: string;
  id: number; 
}

// ฟังก์ชันสำหรับการตรวจสอบ token
const checkToken = async (authToken: string): Promise<boolean> => {
  try {
    const response = await axios.post('http://localhost:5000/nms-token', {
      token: authToken
    });

    // ตรวจสอบผลลัพธ์จากเซิร์ฟเวอร์
    if (response.data.valid) {      
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

// ฟังก์ชันสำหรับการตรวจสอบ token และการเปลี่ยนเส้นทาง
export async function authenticate(req: Request) {  
  // แปลงคุกกี้จาก header ของ request เป็น object
  const cookies = cookie.parse(req.headers.get('cookie') || '');
  // ดึงค่า auth_token จากคุกกี้
  const authToken = cookies.auth_token || null;

  // ประกาศตัวแปรสำหรับเก็บข้อมูลผู้ใช้
  let  userId: string, displayName: string, pictureUrl: string, role: string, id: number;

  if (authToken) {
    // ตรวจสอบความถูกต้องของ token
    const isValidToken = await checkToken(authToken); 
    if (isValidToken) {
      // ถ้า token ถูกต้อง ให้ถอดรหัสและดึงข้อมูลผู้ใช้จาก token
      const decodedToken = jwtDecode<CustomJwtPayload>(authToken);
      
      userId = decodedToken.userId;
      displayName = decodedToken.displayName;
      pictureUrl = decodedToken.pictureUrl;
      role = decodedToken.role; 
      id = decodedToken.id;
      
    } else {      
      // ถ้า token ไม่ถูกต้อง ให้เปลี่ยนเส้นทางไปที่หน้าล็อกอิน
      return {
        redirect: "/login"
      };
    }
  } else {    
    // ถ้าไม่มี auth_token ให้เปลี่ยนเส้นทางไปที่หน้าล็อกอิน
    return {
      redirect: "/login"
    };
  }

  // ส่งข้อมูลผู้ใช้กลับไป
  return { userId, displayName, pictureUrl, role, id };
}