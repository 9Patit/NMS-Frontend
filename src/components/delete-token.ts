import axios from "axios";
import Swal from "sweetalert2";
import getCookie from "../utils/getCookie";

const apiUrl = import.meta.env.PUBLIC_API_KEY;



async function deleteTokenApi(id: string, tokenId: string) {
  console.log("id", id , "tokenId", tokenId);

  // ยืนยันการลบ
  const confirmation = await Swal.fire({
    title: 'คุณแน่ใจหรือไม่ว่าต้องการลบ Token ID นี้?',
    text: `Token ID: ${tokenId}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ใช่, ลบเลย!',
    cancelButtonText: 'ยกเลิก'
  });

  if (!confirmation.isConfirmed) {
    return; 
  }

  // ดึง JWT token จากคุกกี้
  const token = getCookie("auth_token");
  if (!token) {
    Swal.fire('เกิดข้อผิดพลาด', 'JWT token not found in cookies', 'error');
    return;
  }
  
  try {
    const response = await axios.delete(`${apiUrl}/tables/${id}/delete-token`, {
      headers: {
        "Authorization": `Bearer ${token}`
      },
      data: { tokenId },
    });
    if (response.status === 200) {
      Swal.fire({        
          title: 'ลบเรียบร้อย!',
          text: `Token ID: ${tokenId} ถูกลบเรียบร้อยแล้ว`,
          icon: 'success',
          timer: 1000, 
          showConfirmButton: false        
      }).then(() => {
        window.location.reload();
      });
    } else {
      Swal.fire('ล้มเหลว', 'Failed to delete token', 'error');
    }
  } catch (error) {
    console.error("Error deleting token:", error);
    Swal.fire('เกิดข้อผิดพลาด', 'An error occurred while deleting the token', 'error');
  }
}

export default deleteTokenApi;