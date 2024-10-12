$(function () {
  
  
  $("#basic-datatable").DataTable({
    serverSide: true,
    processing: true,
    searching: true,
    paging: true,
    ajax: {
      url: "http://localhost:5000/users",
      type: "GET",
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
      paginate: {
        previous: "<i class='mdi mdi-chevron-left'>",
        next: "<i class='mdi mdi-chevron-right'>",
      },
    },
    drawCallback: function () {
      $(".dataTables_paginate > .pagination").addClass("pagination-rounded");
    },
  });
});
