console.log("Hello from front end thread.js file");

$(function() {
        var currentURL = window.location.pathname.slice(3);
        currentURL = currentURL.split('/');
        var threadName = currentURL[0];        
        var url = "/api/replies/"+currentURL[0];
        $('#linkT').attr('href','/b/' + currentURL[0] + '/');
        $('#threadTitle').text("Board: " + threadName + " - all replies to thread"); //window.location.pathname);
        $.ajax({
          type: "GET",
          url: url,
          data:{thread_id: currentURL[1]},
          success: function(ele)
          {
            var boardThreads= [];
            //
            // THIS ARRAY SET UP IS FOR CODE READABILITIES AND TESTING!
            // THIS IS NOT WHAT IT WOULD LOOK LIKE TO GO LIVE
            //
              console.log("---get replies-----", ele);//can I use typeScript please?!
              var thread = ['<div class="thread2">'];
              thread.push('<div class="main">')
              thread.push('<h2>' + ele.text + '</h2>');
              thread.push('<p class="idDate"> (' + new Date(ele.created_on).toLocaleString() + ')</p>');
              thread.push('<form id="reportThread"><input type="hidden" name="report_id" value="'+ele._id+'"><input type="submit" value="Report"></form>');
              thread.push('<form id="deleteThread"><input type="hidden" value="'+ele._id+'" name="thread_id" required=""><input type="text" placeholder="password" name="delete_password" required=""><input type="submit" value="Delete"></form>');             
              thread.push('</div><div class="replies">');
              ele.replies.forEach(function(rep) {
                thread.push('<div class="reply">')
                //thread.push('<p class="id">id: '+rep._id+' ('+rep.created_on+')</p>');
                thread.push('<p>'+rep.text+'</p>');
                thread.push('<p class="idDate"> (' + new Date(rep.created_on).toLocaleString() + ')</p>');
                thread.push('<form id="reportReply"><input type="hidden" name="thread_id" value="' + ele._id + '"><input type="hidden" name="reply_id" value="' + rep._id + '"><input type="submit" value="Report"></form>');
                thread.push('<form id="deleteReply"><input type="hidden" value="'+ele._id+'" name="thread_id" required=""><input type="hidden" value="'+rep._id+'" name="reply_id" required=""><input type="text" placeholder="password" name="delete_password" required=""><input type="submit" value="Delete"></form>');
                thread.push('</div>')
              });
              thread.push('<div class="newReply">')
              thread.push('<form action="/api/replies/'+currentURL[0]+'/" method="post" id="newReply">');
              thread.push('<input type="hidden" name="thread_id" value="'+ele._id+'">');
              thread.push('<textarea rows="5" cols="35" type="text" placeholder="Quick reply..." name="text" required=""></textarea><br>');
              thread.push('<input type="text" placeholder="password to delete" name="delete_password" required=""><input type="submit" value="Submit">') // style="margin-left: 5px" (in input)
              thread.push('</form></div></div></div>')
              boardThreads.push(thread.join(''));
            $('#boardDisplay').html(boardThreads.join(''));
          }
        });
        
        $('#newThread').submit(function(){
          $(this).attr('action', "/api/threads/" + currentBoard);
        });
        
        
        $('#boardDisplay').on('submit','#reportThread', function(e) {
          var url = "/api/threads/"+currentURL[0];
          $.ajax({
            type: "PUT",
            url: url,
            data: $(this).serialize(),
            success: function(data) { alert(data) }
          });
          e.preventDefault();
        });
        $('#boardDisplay').on('submit','#reportReply', function(e) {
          var url = "/api/replies/"+currentURL[0];
          $.ajax({
            type: "PUT",
            url: url,
            data: $(this).serialize(),
            success: function(data) { alert(data) }
          });
          e.preventDefault();
        });
        $('#boardDisplay').on('submit','#deleteThread', function(e) {
          var url = "/api/threads/"+currentURL[0];
          $.ajax({
            type: "DELETE",
            url: url,
            data: $(this).serialize(),
            success: function(data) { alert(data) }
          });
          //e.preventDefault(); stops alert but refreshes
        });        
        $('#boardDisplay').on('submit','#deleteReply', function(e) {
          var url = "/api/replies/"+currentURL[0];
          $.ajax({
            type: "DELETE",
            url: url,
            data: $(this).serialize(),
            success: function(data) { alert(data) }
          });
          //e.preventDefault(); stops alert but refreshes
        });              
      });