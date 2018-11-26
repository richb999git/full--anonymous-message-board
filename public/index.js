console.log("Hello from front end index.js file");

$(function() {
  
  // get database of boards here through AJAX - see api.js
  
  var currentBoard = window.location.pathname.slice(3,-1);
        var url = "/api/boards";
        $('#boardTitle').text('Welcome to the boards!')
        $.ajax({
          type: "GET",
          url: url,
          success: function(data)
          {
            var boardThreads= [];
            //
            // THIS ARRAY SET UP IS FOR CODE READABILITIES AND TESTING!
            // THIS IS NOT WHAT IT WOULD LOOK LIKE TO GO LIVE
            //
 
            data.forEach(function(ele) {
              console.log("----------thread get------------",ele);//can I use typeScript please?!
              var thread = ['<div class="thread">'];
              thread.push('<div class="main">');
              thread.push('<div><a class="boardButton" href="/b/' + ele + '/">' + ele + '</a></div>');
              thread.push('</div>');
              thread.push('<div class="threads">');
              
              thread.push('<div id="submitNewThreadBoards"><h3>Submit a new thread:</h3><form id="newThread2" method="post" action="/api/threads/' + ele + '/">');
              thread.push('<textarea rows="4" cols="35" type="text" placeholder="Thread text..." name="text" required></textarea><br>');
              thread.push('<input type="text" placeholder="password to delete" name="delete_password" required><br>');
              thread.push('<input class="inputB" type="submit" value="Submit"></form></div>');
              
              thread.push('</div></div>');
              
              boardThreads.push(thread.join(''));
            });
            $('#boardDisplay').html(boardThreads.join(''));
          }
        });
  

  
 

});
   