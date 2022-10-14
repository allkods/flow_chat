$('#logo').on({
    click:function(){
        $.ajax({
            type: 'POST',
            url: '/backend',
            success: function(data){
              alert(data);
            }
          });
    }
})