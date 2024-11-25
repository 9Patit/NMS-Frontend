
$(function () {
  // ฟังก์ชันสำหรับดึงค่า JWT จากคุกกี้
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  $("#basic-datatable").DataTable({
    serverSide: true,
    processing: true,
    searching: true,
    paging: true,
    ajax: {
      url: "http://localhost:5000/users",
      type: "GET",
      headers: {
        Authorization: "Bearer " + getCookie("auth_token"),
      },
      data: function (d) {
        return {
          draw: d.draw,
          start: d.start,
          length: d.length,
          search: d.search.value,
          order: d.order,
          columns: d.columns,
        };
      },
      dataSrc: function (json) {
        return json.data;
      },
    },
    columns: [
      { data: "first_name" },
      { data: "last_name" },
      {
        data: "groups",
        render: function (data) {
          return data.join(", ");
        },
      },
      { data: "status" },
      { data: "verify" },
      {
        data: "id",
        render: function (data) {
          const base64Data = btoa(data);
          return `<a href="http://localhost:4321/tables/${base64Data}" class="btn btn-primary btn-sm">More</a>`;
        },
      },
    ],
    language: {
      search: "ค้นหา:", 
      lengthMenu: "แสดง _MENU_ รายการ", 
      info:"แสดงรายการที่ _START_ ถึง _END_ จาก _TOTAL_ รายการ",
      paginate: {
        previous: "<i class='mdi mdi-chevron-left'>",
        next: "<i class='mdi mdi-chevron-right'>",
      },
    },
    drawCallback: function () {
      $(".dataTables_paginate > .pagination").addClass("pagination-rounded");
    },
  });

  //-------------------------------------------------------------------------------------

  // ฟังก์ชันสำหรับดึงค่า cookie
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  // ฟังก์ชันสำหรับดึง leaderGroups จาก JWT token
  function getLeaderGroups() {
    const token = getCookie("auth_token");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.leaderGroups || [];
  }
  
  // ฟังก์ชันสำหรับดึงค่า query parameter
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const selectedTable = getQueryParam("type");



  // กำหนด DataTable สำหรับ leader-table
  $("#leader-table").DataTable({
    serverSide: true,
    processing: true,
    searching: true,
    paging: true,
    ajax: {
      url: "http://localhost:5000/leader-get-users",
      type: "POST",
      headers: {
        Authorization: "Bearer " + getCookie("auth_token"),
      },
      data: function (d) {
        const leaderGroups = getLeaderGroups();
        const requestData = {
          leaderGroups: leaderGroups,
          selectTable: selectedTable || "all",
          draw: d.draw,
          start: d.start,
          length: d.length,
          search: {
            value: d.search.value,
          },
          order: d.order,                 
        };
                
        return requestData;
      },
      dataSrc: function (json) {
        return json.data;
      },
    },
    columns: [
      { data: "first_name" },
      { data: "last_name" },
      {
        data: "groups",
        render: function (data) {
          return data.join(", ");
        },
      },
      { data: "status" },
      { data: "verify" },
      {
        data: "id",
        render: function (data) {
          const base64Data = btoa(data);
          return `<div class="btn-group mb-2">
            <button type="button" class="btn btn-info btn-sm dropdown-toggle waves-effect waves-light" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">แก้ไข</button>
              <div class="dropdown-menu" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(0px, 34px, 0px);">
                  <a class="dropdown-item change-status" data-id="${data}" data-status="1" href="#">ใช้งาน</a>
                  <a class="dropdown-item change-status" data-id="${data}" data-status="10" href="#">ออก</a>
              </div>
            </div>`;
        },
      },
    ],
    language: {
      search: "ค้นหา:",
      lengthMenu: "แสดง _MENU_ รายการ", 
      info:"แสดงรายการที่ _START_ ถึง _END_ จาก _TOTAL_ รายการ",
      paginate: {
        previous: "<i class='mdi mdi-chevron-left'>",
        next: "<i class='mdi mdi-chevron-right'>",
      },
    },
    drawCallback: function () {
      $(".dataTables_paginate > .pagination").addClass("pagination-rounded");
    },
  });

  // Event listener สำหรับ dropdown
  $("#leader-table").on("click", ".change-status", function (e) {
    e.preventDefault();

    const userId = $(this).data("id"); // รับ id ของผู้ใช้
    const newStatus = $(this).data("status"); // รับสถานะใหม่
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    }

    // เรียก API สำหรับอัปเดตสถานะ
    $.ajax({
      url: "http://localhost:5000/update-verify-status",
      type: "PUT",
      headers: {
        Authorization: "Bearer " + getCookie("auth_token"),
      },
      contentType: "application/json",
      data: JSON.stringify({ id: userId, verify: newStatus }),
      success: function (response) {
        alert("เปลี่ยนสถานะสำเร็จ"); // แสดงข้อความเมื่อสำเร็จ
        location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
        alert("ไม่สามารถอัปเดตสถานะได้");
        location.reload();
      },
    });
  });
});
