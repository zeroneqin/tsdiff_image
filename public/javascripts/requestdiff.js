$(function($) {
  $('#id_btn_compare').click(function() {
      var formData = new FormData();
      var sourceInputElement = $('#id_input_sourcefile')[0];
      var sourceFile = sourceInputElement.files[0];
      formData.append('source',sourceFile);

      var targetInputElement = $('#id_input_targetfile')[0];
      var targetFile = targetInputElement.files[0];
      formData.append('target',targetFile);

      $.ajax({
          type:'post',
          url:'image/compare',
          data: formData,
          cache:false,
          processData:false,
          contentType:false,
          success: function(data) {
              $('#id_div_result')[0],innerHTML = data;
          },
          error:function() {
              console.log('Upload fail');
          }
      })
  })



})